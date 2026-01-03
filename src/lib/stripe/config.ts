import Stripe from 'stripe'

// Lazy initialize Stripe to avoid build-time errors when env vars not set
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// For backwards compatibility (use getStripe() for new code)
export const stripe = {
  get customers() { return getStripe().customers },
  get subscriptions() { return getStripe().subscriptions },
  get checkout() { return getStripe().checkout },
  get webhooks() { return getStripe().webhooks },
}

// Pricing tiers for TribeWellMD
export interface PricingTier {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  highlighted?: boolean
  badge?: string
  stripePriceIdMonthly?: string // Set in Stripe Dashboard
  stripePriceIdYearly?: string // Set in Stripe Dashboard
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic study tools',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Basic flashcard decks',
      'Limited QBank questions (10/day)',
      'WHO-5 wellness check-ins',
      'Community access',
      'Earn points for charity',
      'Join 1 village',
    ],
  },
  {
    id: 'student',
    name: 'Student',
    description: 'Everything you need to excel',
    monthlyPrice: 12,
    yearlyPrice: 99,
    features: [
      'All Free features',
      'Unlimited flashcard decks',
      'Full QBank access (2,500+ questions)',
      'Spaced repetition (FSRS algorithm)',
      'Case studies & clinical scenarios',
      'Rapid Review mode',
      'Study group rooms',
      'Advanced progress analytics',
      '2x points multiplier',
      'Join unlimited villages',
    ],
    highlighted: true,
    badge: 'Most Popular',
    stripePriceIdMonthly: process.env.STRIPE_STUDENT_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_STUDENT_YEARLY_PRICE_ID,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious test preparation',
    monthlyPrice: 29,
    yearlyPrice: 249,
    features: [
      'All Student features',
      'Priority QBank updates',
      'Custom flashcard generation',
      'AI-powered study recommendations',
      'Mock exam simulations',
      '1-on-1 tutoring credits (2/month)',
      'Exclusive webinars',
      'Early access to new features',
      '3x points multiplier',
      'Create your own village',
    ],
    badge: 'Best Value',
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
  {
    id: 'institution',
    name: 'Institution',
    description: 'For medical schools & programs',
    monthlyPrice: 0, // Custom pricing
    yearlyPrice: 0, // Custom pricing
    features: [
      'All Pro features',
      'Bulk student licensing',
      'Admin dashboard',
      'Custom branding',
      'Student progress reporting',
      'LCME/AAMC compliance tools',
      'Dedicated account manager',
      'Custom integrations',
      'Priority support',
      'Institutional village management',
    ],
    badge: 'Contact Us',
  },
]

// Get tier by ID
export function getTierById(id: string): PricingTier | undefined {
  return PRICING_TIERS.find((tier) => tier.id === id)
}

// Calculate savings for yearly billing
export function getYearlySavings(tier: PricingTier): number {
  if (tier.monthlyPrice === 0) return 0
  const monthlyTotal = tier.monthlyPrice * 12
  return monthlyTotal - tier.yearlyPrice
}

// Calculate percentage savings
export function getYearlySavingsPercent(tier: PricingTier): number {
  if (tier.monthlyPrice === 0) return 0
  const monthlyTotal = tier.monthlyPrice * 12
  return Math.round(((monthlyTotal - tier.yearlyPrice) / monthlyTotal) * 100)
}
