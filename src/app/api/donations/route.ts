import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  convertPointsToDonation,
  getUserDonationHistory,
  getVillageDonationStats,
  getGlobalStats,
  getVillageLeaderboard
} from '@/lib/supabase/points'
import { POINTS_PER_DOLLAR, pointsToDollars, formatDonation } from '@/types/donations'
import { getCharityById } from '@/data/charities'

// GET /api/donations - Get donation info
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'user'
    const villageId = searchParams.get('villageId')

    // Global stats don't require auth
    if (type === 'global') {
      const stats = await getGlobalStats()
      return NextResponse.json({
        totalPoints: stats.totalPoints,
        totalDonated: stats.totalDonated,
        totalDonatedFormatted: formatDonation(stats.totalDonated),
        totalUsers: stats.totalUsers,
        totalVillages: stats.totalVillages
      })
    }

    // Leaderboard doesn't require auth
    if (type === 'leaderboard') {
      const limit = parseInt(searchParams.get('limit') || '10')
      const leaderboard = await getVillageLeaderboard(limit)
      return NextResponse.json({ leaderboard })
    }

    // Village stats
    if (type === 'village' && villageId) {
      const stats = await getVillageDonationStats(villageId)
      if (!stats) {
        return NextResponse.json({ error: 'Village not found' }, { status: 404 })
      }
      return NextResponse.json({
        ...stats,
        totalDonatedFormatted: formatDonation(stats.totalDonated)
      })
    }

    // User-specific endpoints require auth
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User donation history
    if (type === 'user' || type === 'history') {
      const history = await getUserDonationHistory(user.id)
      if (!history) {
        return NextResponse.json({
          userId: user.id,
          totalPointsContributed: 0,
          totalDonationsGenerated: 0,
          villageContributions: [],
          milestonesUnlocked: [],
          recentActivity: []
        })
      }
      return NextResponse.json({
        ...history,
        totalDonationsGeneratedFormatted: formatDonation(history.totalDonationsGenerated)
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error in GET /api/donations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/donations - Convert points to donation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { points, charityId } = body

    // Validate input
    if (!points || typeof points !== 'number' || points < POINTS_PER_DOLLAR) {
      return NextResponse.json({
        error: `Minimum conversion is ${POINTS_PER_DOLLAR} points ($1)`
      }, { status: 400 })
    }

    if (!charityId || typeof charityId !== 'string') {
      return NextResponse.json({ error: 'Charity ID is required' }, { status: 400 })
    }

    // Validate charity exists
    const charity = getCharityById(charityId)
    if (!charity) {
      return NextResponse.json({ error: 'Invalid charity ID' }, { status: 400 })
    }

    // Convert points to donation
    const result = await convertPointsToDonation(user.id, points, charityId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      pointsConverted: points,
      dollarsGenerated: result.dollars,
      dollarsFormatted: formatDonation(result.dollars || 0),
      transactionId: result.transactionId,
      charity: {
        id: charity.id,
        name: charity.name,
        mission: charity.mission
      },
      message: `You've generated ${formatDonation(result.dollars || 0)} for ${charity.name}!`
    })
  } catch (error) {
    console.error('Error in POST /api/donations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
