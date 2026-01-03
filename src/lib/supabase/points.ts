import { createClient } from './server'
import {
  type DonationTransaction,
  type UserDonationHistory,
  type VillageDonationStats,
  POINTS_PER_DOLLAR,
  pointsToDollars,
  PERSONAL_MILESTONES,
  GLOBAL_MILESTONES,
  getUnlockedMilestones
} from '@/types/donations'

// Point sources for tracking
export type PointSource =
  | 'flashcard_review'
  | 'flashcard_correct'
  | 'qbank_question'
  | 'qbank_correct'
  | 'who5_checkin'
  | 'who5_streak_bonus'
  | 'wellness_journey'
  | 'daily_challenge'
  | 'tribe_activity'
  | 'referral'
  | 'achievement'
  | 'bonus'

// Point values by source
export const POINT_VALUES: Record<PointSource, number> = {
  flashcard_review: 2,
  flashcard_correct: 5,
  qbank_question: 5,
  qbank_correct: 10,
  who5_checkin: 15,
  who5_streak_bonus: 50,
  wellness_journey: 20,
  daily_challenge: 25,
  tribe_activity: 10,
  referral: 500,
  achievement: 100,
  bonus: 0 // Variable
}

// User points balance interface
export interface UserPointsBalance {
  userId: string
  totalEarned: number
  totalDonated: number
  currentBalance: number
  villageId: string | null
  updatedAt: string
}

// Get user's current points balance
export async function getUserPointsBalance(userId: string): Promise<UserPointsBalance | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // If no record exists, return null (user needs to be initialized)
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching points balance:', error)
    return null
  }

  return {
    userId: data.user_id,
    totalEarned: data.total_earned,
    totalDonated: data.total_donated,
    currentBalance: data.current_balance,
    villageId: data.village_id,
    updatedAt: data.updated_at
  }
}

// Initialize user points record
export async function initializeUserPoints(userId: string, villageId?: string): Promise<UserPointsBalance | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_points')
    .upsert({
      user_id: userId,
      total_earned: 0,
      total_donated: 0,
      current_balance: 0,
      village_id: villageId || null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error initializing user points:', error)
    return null
  }

  return {
    userId: data.user_id,
    totalEarned: data.total_earned,
    totalDonated: data.total_donated,
    currentBalance: data.current_balance,
    villageId: data.village_id,
    updatedAt: data.updated_at
  }
}

// Award points to a user
export async function awardPoints(
  userId: string,
  points: number,
  source: PointSource,
  description?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const supabase = await createClient()

  // Start a transaction by first getting current balance
  const { data: currentData, error: fetchError } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    return { success: false, error: 'Failed to fetch current balance' }
  }

  const currentBalance = currentData?.current_balance || 0
  const totalEarned = currentData?.total_earned || 0
  const newBalance = currentBalance + points
  const newTotalEarned = totalEarned + points

  // Upsert user points
  const { error: updateError } = await supabase
    .from('user_points')
    .upsert({
      user_id: userId,
      total_earned: newTotalEarned,
      total_donated: currentData?.total_donated || 0,
      current_balance: newBalance,
      village_id: currentData?.village_id || null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (updateError) {
    return { success: false, error: 'Failed to update points balance' }
  }

  // Record the transaction
  const { error: txError } = await supabase
    .from('point_transactions')
    .insert({
      user_id: userId,
      points: points,
      source: source,
      description: description || `Earned from ${source.replace('_', ' ')}`,
      created_at: new Date().toISOString()
    })

  if (txError) {
    console.error('Error recording point transaction:', txError)
    // Don't fail the whole operation if transaction logging fails
  }

  // Check for newly unlocked milestones
  const unlockedMilestones = getUnlockedMilestones(newTotalEarned, PERSONAL_MILESTONES)
  const previouslyUnlocked = getUnlockedMilestones(totalEarned, PERSONAL_MILESTONES)

  if (unlockedMilestones.length > previouslyUnlocked.length) {
    // New milestone unlocked!
    const newMilestone = unlockedMilestones[unlockedMilestones.length - 1]
    await recordMilestoneUnlock(userId, newMilestone.id, 'personal')
  }

  return { success: true, newBalance }
}

// Convert points to donation
export async function convertPointsToDonation(
  userId: string,
  points: number,
  charityId: string
): Promise<{ success: boolean; dollars?: number; transactionId?: string; error?: string }> {
  const supabase = await createClient()

  // Validate minimum conversion (at least $1 = 1000 points)
  if (points < POINTS_PER_DOLLAR) {
    return { success: false, error: `Minimum conversion is ${POINTS_PER_DOLLAR} points ($1)` }
  }

  // Get current balance
  const { data: userData, error: fetchError } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (fetchError || !userData) {
    return { success: false, error: 'User points not found' }
  }

  if (userData.current_balance < points) {
    return { success: false, error: 'Insufficient points balance' }
  }

  const dollars = pointsToDollars(points)
  const newBalance = userData.current_balance - points
  const newTotalDonated = userData.total_donated + points

  // Update user balance
  const { error: updateError } = await supabase
    .from('user_points')
    .update({
      current_balance: newBalance,
      total_donated: newTotalDonated,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (updateError) {
    return { success: false, error: 'Failed to update balance' }
  }

  // Record donation transaction
  const { data: txData, error: txError } = await supabase
    .from('donation_transactions')
    .insert({
      user_id: userId,
      village_id: userData.village_id,
      charity_id: charityId,
      points_spent: points,
      dollars_amount: dollars,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (txError) {
    // Rollback the balance update
    await supabase
      .from('user_points')
      .update({
        current_balance: userData.current_balance,
        total_donated: userData.total_donated,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    return { success: false, error: 'Failed to record donation' }
  }

  // Update village donation stats
  if (userData.village_id) {
    await updateVillageDonationStats(userData.village_id, points, dollars)
  }

  // Update global donation stats
  await updateGlobalDonationStats(points, dollars)

  return { success: true, dollars, transactionId: txData.id }
}

// Update village donation statistics
async function updateVillageDonationStats(villageId: string, points: number, dollars: number) {
  const supabase = await createClient()

  // Get current stats
  const { data: currentStats } = await supabase
    .from('village_donations')
    .select('*')
    .eq('village_id', villageId)
    .single()

  if (currentStats) {
    // Update existing
    await supabase
      .from('village_donations')
      .update({
        total_points: currentStats.total_points + points,
        total_donated: currentStats.total_donated + dollars,
        last_donation_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('village_id', villageId)
  } else {
    // Insert new
    await supabase
      .from('village_donations')
      .insert({
        village_id: villageId,
        total_points: points,
        total_donated: dollars,
        last_donation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
  }
}

// Update global donation statistics
async function updateGlobalDonationStats(points: number, dollars: number) {
  const supabase = await createClient()

  // Use a special 'global' record
  const { data: currentStats } = await supabase
    .from('global_stats')
    .select('*')
    .eq('id', 'global')
    .single()

  const newTotalPoints = (currentStats?.total_points || 0) + points
  const newTotalDonated = (currentStats?.total_donated || 0) + dollars

  await supabase
    .from('global_stats')
    .upsert({
      id: 'global',
      total_points: newTotalPoints,
      total_donated: newTotalDonated,
      total_users: currentStats?.total_users || 0,
      updated_at: new Date().toISOString()
    })

  // Check for global milestones
  const previousMilestones = getUnlockedMilestones((currentStats?.total_points || 0), GLOBAL_MILESTONES)
  const newMilestones = getUnlockedMilestones(newTotalPoints, GLOBAL_MILESTONES)

  if (newMilestones.length > previousMilestones.length) {
    const newMilestone = newMilestones[newMilestones.length - 1]
    await recordMilestoneUnlock('global', newMilestone.id, 'global')
  }
}

// Record milestone unlock
async function recordMilestoneUnlock(userId: string, milestoneId: string, type: 'personal' | 'global') {
  const supabase = await createClient()

  await supabase
    .from('milestone_unlocks')
    .insert({
      user_id: userId,
      milestone_id: milestoneId,
      milestone_type: type,
      unlocked_at: new Date().toISOString()
    })
}

// Get user's donation history
export async function getUserDonationHistory(userId: string): Promise<UserDonationHistory | null> {
  const supabase = await createClient()

  // Get user points
  const { data: pointsData } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!pointsData) {
    return null
  }

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('donation_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get milestones
  const { data: milestones } = await supabase
    .from('milestone_unlocks')
    .select('milestone_id')
    .eq('user_id', userId)

  return {
    userId,
    totalPointsContributed: pointsData.total_earned,
    totalDonationsGenerated: pointsToDollars(pointsData.total_donated),
    villageContributions: [], // Would need aggregation query
    milestonesUnlocked: milestones?.map(m => m.milestone_id) || [],
    recentActivity: transactions?.map(t => ({
      id: t.id,
      villageId: t.village_id || '',
      userId: t.user_id,
      points: t.points_spent,
      dollars: t.dollars_amount,
      source: 'donation',
      timestamp: t.created_at,
      isProcessed: t.status === 'processed',
      processedAt: t.processed_at
    })) || []
  }
}

// Get village donation stats
export async function getVillageDonationStats(villageId: string): Promise<VillageDonationStats | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('village_donations')
    .select('*')
    .eq('village_id', villageId)
    .single()

  if (error || !data) {
    return null
  }

  // Get member count
  const { count } = await supabase
    .from('user_points')
    .select('*', { count: 'exact', head: true })
    .eq('village_id', villageId)

  return {
    villageId: data.village_id,
    villageName: data.village_name || villageId,
    charityEIN: data.charity_ein || '',
    totalPointsEarned: data.total_points,
    totalDonated: data.total_donated,
    pendingDonation: 0, // Would need calculation
    lastDonationDate: data.last_donation_date,
    memberCount: count || 0,
    impactStatement: data.impact_statement
  }
}

// Get global stats
export async function getGlobalStats(): Promise<{
  totalPoints: number
  totalDonated: number
  totalUsers: number
  totalVillages: number
}> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('global_stats')
    .select('*')
    .eq('id', 'global')
    .single()

  const { count: villageCount } = await supabase
    .from('village_donations')
    .select('*', { count: 'exact', head: true })

  return {
    totalPoints: data?.total_points || 0,
    totalDonated: data?.total_donated || 0,
    totalUsers: data?.total_users || 0,
    totalVillages: villageCount || 0
  }
}

// Get leaderboard
export async function getVillageLeaderboard(limit: number = 10): Promise<VillageDonationStats[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('village_donations')
    .select('*')
    .order('total_donated', { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data.map(v => ({
    villageId: v.village_id,
    villageName: v.village_name || v.village_id,
    charityEIN: v.charity_ein || '',
    totalPointsEarned: v.total_points,
    totalDonated: v.total_donated,
    pendingDonation: 0,
    lastDonationDate: v.last_donation_date,
    memberCount: v.member_count || 0,
    impactStatement: v.impact_statement
  }))
}

// Set user's village
export async function setUserVillage(userId: string, villageId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_points')
    .update({
      village_id: villageId,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  return !error
}

// Get point transaction history
export async function getPointTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<Array<{
  id: string
  points: number
  source: string
  description: string
  createdAt: string
}>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data.map(t => ({
    id: t.id,
    points: t.points,
    source: t.source,
    description: t.description,
    createdAt: t.created_at
  }))
}
