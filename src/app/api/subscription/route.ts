import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRICING_TIERS } from '@/lib/stripe/config'

// GET /api/subscription - Get user's subscription status
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subscription from database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Default to free tier if no subscription exists
    const tierId = subscription?.tier_id || 'free'
    const tier = PRICING_TIERS.find(t => t.id === tierId) || PRICING_TIERS[0]

    // Calculate points multiplier
    let pointsMultiplier = 1
    if (tierId === 'student') pointsMultiplier = 2
    if (tierId === 'pro') pointsMultiplier = 3

    // Determine effective status
    let status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'free' = 'free'
    if (subscription) {
      if (subscription.status === 'active') status = 'active'
      else if (subscription.status === 'trialing') status = 'trialing'
      else if (subscription.status === 'past_due') status = 'past_due'
      else if (subscription.status === 'canceled') status = 'canceled'
    }

    return NextResponse.json({
      userId: user.id,
      tierId,
      tierName: tier.name,
      status,
      billingPeriod: subscription?.billing_period,
      currentPeriodEnd: subscription?.current_period_end,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end,
      features: tier.features,
      pointsMultiplier,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
