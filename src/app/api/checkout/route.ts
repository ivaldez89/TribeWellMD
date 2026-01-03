import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, getTierById } from '@/lib/stripe/config'

// POST /api/checkout - Create a Stripe Checkout session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tierId, billingPeriod } = body

    // Validate tier
    const tier = getTierById(tierId)
    if (!tier) {
      return NextResponse.json({ error: 'Invalid pricing tier' }, { status: 400 })
    }

    // Free tier doesn't need checkout
    if (tier.id === 'free') {
      return NextResponse.json({ error: 'Free tier does not require payment' }, { status: 400 })
    }

    // Institution tier requires contact
    if (tier.id === 'institution') {
      return NextResponse.json({ error: 'Please contact us for institutional pricing' }, { status: 400 })
    }

    // Get the appropriate price ID
    const priceId = billingPeriod === 'yearly'
      ? tier.stripePriceIdYearly
      : tier.stripePriceIdMonthly

    if (!priceId) {
      return NextResponse.json({
        error: 'Stripe price not configured. Please set up Stripe price IDs in environment variables.'
      }, { status: 500 })
    }

    const stripe = getStripe()

    // Check for existing customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    let customerId = customers.data[0]?.id

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabaseUserId: user.id,
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      subscription_data: {
        metadata: {
          supabaseUserId: user.id,
          tierId: tier.id,
          billingPeriod,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
