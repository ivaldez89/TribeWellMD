import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getUserPointsBalance,
  initializeUserPoints,
  awardPoints,
  getPointTransactionHistory,
  type PointSource
} from '@/lib/supabase/points'

// GET /api/points - Get user's points balance
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for history param
    const { searchParams } = new URL(request.url)
    const includeHistory = searchParams.get('history') === 'true'
    const historyLimit = parseInt(searchParams.get('limit') || '50')

    let balance = await getUserPointsBalance(user.id)

    // Initialize if not exists
    if (!balance) {
      balance = await initializeUserPoints(user.id)
    }

    if (!balance) {
      return NextResponse.json({ error: 'Failed to get points balance' }, { status: 500 })
    }

    const response: {
      balance: typeof balance
      history?: Awaited<ReturnType<typeof getPointTransactionHistory>>
    } = { balance }

    if (includeHistory) {
      response.history = await getPointTransactionHistory(user.id, historyLimit)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/points - Award points to user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { points, source, description } = body

    // Validate input
    if (!points || typeof points !== 'number' || points <= 0) {
      return NextResponse.json({ error: 'Invalid points value' }, { status: 400 })
    }

    if (!source) {
      return NextResponse.json({ error: 'Source is required' }, { status: 400 })
    }

    // Validate source is a valid PointSource
    const validSources: PointSource[] = [
      'flashcard_review',
      'flashcard_correct',
      'qbank_question',
      'qbank_correct',
      'who5_checkin',
      'who5_streak_bonus',
      'wellness_journey',
      'daily_challenge',
      'tribe_activity',
      'referral',
      'achievement',
      'bonus'
    ]

    if (!validSources.includes(source)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 })
    }

    const result = await awardPoints(user.id, points, source, description)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      pointsAwarded: points,
      newBalance: result.newBalance,
      source
    })
  } catch (error) {
    console.error('Error in POST /api/points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
