'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRICING_TIERS, getYearlySavings, getYearlySavingsPercent } from '@/lib/stripe/config'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { LandingLayout, HEADER_HEIGHT, FOOTER_HEIGHT } from '@/components/layout/LandingLayout'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly')
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const isAuthenticated = useIsAuthenticated()
  const router = useRouter()

  const handleSelectPlan = async (tierId: string) => {
    // Free tier - just redirect to register/home
    if (tierId === 'free') {
      if (isAuthenticated) {
        router.push('/home')
      } else {
        router.push('/register')
      }
      return
    }

    // Institution tier - contact form
    if (tierId === 'institution') {
      window.location.href = 'mailto:contact@tribewellmd.com?subject=Institution%20Pricing%20Inquiry'
      return
    }

    // Paid tiers - require auth
    if (!isAuthenticated) {
      router.push(`/register?redirect=/pricing&tier=${tierId}`)
      return
    }

    setLoadingTier(tierId)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId, billingPeriod }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Unable to start checkout. Please try again.')
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <LandingLayout>
      <div
        className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-white dark:from-slate-900 dark:to-slate-800"
        style={{ paddingTop: HEADER_HEIGHT, paddingBottom: FOOTER_HEIGHT }}
      >
      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Invest in Your Future
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Study smarter, track wellness, and make an impact. Choose the plan that fits your journey.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-[#5B7B6D] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#5B7B6D]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-[#5B7B6D] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#5B7B6D]'
              }`}
            >
              Yearly
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                billingPeriod === 'yearly'
                  ? 'bg-[#C4A77D] text-white'
                  : 'bg-[#C4A77D]/20 text-[#8B7355]'
              }`}>
                Save up to 30%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier) => {
              const price = billingPeriod === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice
              const monthlyEquivalent = billingPeriod === 'yearly' && tier.yearlyPrice > 0
                ? (tier.yearlyPrice / 12).toFixed(2)
                : null
              const savings = getYearlySavings(tier)
              const savingsPercent = getYearlySavingsPercent(tier)

              return (
                <div
                  key={tier.id}
                  className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                    tier.highlighted
                      ? 'border-[#5B7B6D] ring-4 ring-[#5B7B6D]/10'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                      tier.highlighted
                        ? 'bg-[#5B7B6D] text-white'
                        : tier.badge === 'Contact Us'
                        ? 'bg-slate-600 text-white'
                        : 'bg-[#C4A77D] text-white'
                    }`}>
                      {tier.badge}
                    </div>
                  )}

                  <div className="p-6">
                    {/* Tier Name */}
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      {tier.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      {tier.id === 'institution' ? (
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          Custom
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">
                              ${price === 0 ? '0' : billingPeriod === 'yearly' ? monthlyEquivalent : price}
                            </span>
                            {price > 0 && (
                              <span className="text-slate-500 dark:text-slate-400">/month</span>
                            )}
                          </div>
                          {billingPeriod === 'yearly' && price > 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              ${tier.yearlyPrice}/year
                              {savings > 0 && (
                                <span className="text-[#5B7B6D] font-medium ml-2">
                                  Save ${savings} ({savingsPercent}%)
                                </span>
                              )}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(tier.id)}
                      disabled={loadingTier === tier.id}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                        tier.highlighted
                          ? 'bg-[#5B7B6D] hover:bg-[#4A6A5C] text-white'
                          : tier.id === 'free'
                          ? 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
                          : tier.id === 'institution'
                          ? 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900'
                          : 'bg-[#C4A77D] hover:bg-[#B39770] text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loadingTier === tier.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : tier.id === 'free' ? (
                        'Get Started Free'
                      ) : tier.id === 'institution' ? (
                        'Contact Sales'
                      ) : (
                        'Start 7-Day Free Trial'
                      )}
                    </button>

                    {/* Features */}
                    <ul className="mt-6 space-y-3">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <svg
                            className={`w-5 h-5 flex-shrink-0 ${
                              tier.highlighted ? 'text-[#5B7B6D]' : 'text-[#C4A77D]'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I switch plans at any time?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the change takes effect at the end of your current billing period.'
              },
              {
                q: 'What happens to my points if I cancel?',
                a: 'Your earned points remain yours forever! You can still donate them to your village charity even on the free plan. However, paid plan features like multipliers will no longer apply to new points earned.'
              },
              {
                q: 'Is there a student discount?',
                a: 'Our Student plan is already priced for medical students. For even more savings, try yearly billing (save up to 30%). We also offer institutional pricing for medical schools.'
              },
              {
                q: 'How does the 7-day free trial work?',
                a: 'Start with full access to your chosen plan. You won\'t be charged until day 8. Cancel anytime during the trial and pay nothing.'
              },
              {
                q: 'How do charitable donations work?',
                a: 'As you study and complete wellness activities, you earn points. These points convert to real charitable donations (1,000 points = $1) that go directly to verified 501(c)(3) organizations chosen by your village.'
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#5B7B6D] to-[#4A6A5C]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your Subscription Makes a Difference
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Every subscription helps fund our platform&apos;s mission to support medical student wellness and make charitable giving accessible to everyone.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl font-bold text-white mb-2">$50K+</div>
              <div className="text-white/80">Donated to charities</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl font-bold text-white mb-2">10+</div>
              <div className="text-white/80">Partner charities</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl font-bold text-white mb-2">5,000+</div>
              <div className="text-white/80">Medical students</div>
            </div>
          </div>
        </div>
      </section>

      </div>
    </LandingLayout>
  )
}
