import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Lazy initialize Supabase admin client (bypasses RLS)
let supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase admin credentials not configured')
    }
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
  return supabaseAdminInstance
}

// POST /api/webhooks/stripe - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Handle successful checkout
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Get subscription details - use expand to get full subscription data
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price']
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = subscription as any
  const userId = subData.metadata?.supabaseUserId
  const tierId = subData.metadata?.tierId
  const billingPeriod = subData.metadata?.billingPeriod

  if (!userId) {
    console.error('No user ID in subscription metadata')
    return
  }

  // Upsert subscription record
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      tier_id: tierId,
      billing_period: billingPeriod,
      status: subData.status,
      current_period_start: subData.current_period_start
        ? new Date(subData.current_period_start * 1000).toISOString()
        : null,
      current_period_end: subData.current_period_end
        ? new Date(subData.current_period_end * 1000).toISOString()
        : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Error upserting subscription:', error)
  }
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = subscription as any
  const userId = subData.metadata?.supabaseUserId

  if (!userId) {
    console.error('No user ID in subscription metadata')
    return
  }

  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: subData.status,
      tier_id: subData.metadata?.tierId,
      billing_period: subData.metadata?.billingPeriod,
      current_period_start: subData.current_period_start
        ? new Date(subData.current_period_start * 1000).toISOString()
        : null,
      current_period_end: subData.current_period_end
        ? new Date(subData.current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = subscription as any
  const userId = subData.metadata?.supabaseUserId

  if (!userId) {
    console.error('No user ID in subscription metadata')
    return
  }

  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error canceling subscription:', error)
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceData = invoice as any
  const subscriptionId = invoiceData.subscription as string

  if (!subscriptionId) return

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = subscription as any
  const userId = subData.metadata?.supabaseUserId

  if (!userId) return

  // Log payment
  await getSupabaseAdmin()
    .from('payment_history')
    .insert({
      user_id: userId,
      stripe_invoice_id: invoiceData.id,
      amount: (invoiceData.amount_paid || 0) / 100, // Convert from cents
      currency: invoiceData.currency || 'usd',
      status: 'succeeded',
      created_at: new Date().toISOString(),
    })
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceData = invoice as any
  const subscriptionId = invoiceData.subscription as string

  if (!subscriptionId) return

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = subscription as any
  const userId = subData.metadata?.supabaseUserId

  if (!userId) return

  // Log failed payment
  await getSupabaseAdmin()
    .from('payment_history')
    .insert({
      user_id: userId,
      stripe_invoice_id: invoiceData.id,
      amount: (invoiceData.amount_due || 0) / 100,
      currency: invoiceData.currency || 'usd',
      status: 'failed',
      failure_reason: invoiceData.last_finalization_error?.message,
      created_at: new Date().toISOString(),
    })

  // Could also send notification to user here
}
