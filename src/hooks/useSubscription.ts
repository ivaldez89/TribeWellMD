'use client'

import { useState, useEffect, useCallback } from 'react'
import { PRICING_TIERS, type PricingTier } from '@/lib/stripe/config'

export interface Subscription {
  userId: string
  tierId: string
  tierName: string
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'free'
  billingPeriod?: 'monthly' | 'yearly'
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  features: string[]
  pointsMultiplier: number
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch subscription status
  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch('/api/subscription')

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - default to free tier
          setSubscription({
            userId: '',
            tierId: 'free',
            tierName: 'Free',
            status: 'free',
            features: PRICING_TIERS.find(t => t.id === 'free')?.features || [],
            pointsMultiplier: 1,
          })
          return
        }
        throw new Error('Failed to fetch subscription')
      }

      const data = await response.json()
      setSubscription(data)
      setError(null)
    } catch (err) {
      console.error('Subscription fetch error:', err)
      // Default to free tier on error
      setSubscription({
        userId: '',
        tierId: 'free',
        tierName: 'Free',
        status: 'free',
        features: PRICING_TIERS.find(t => t.id === 'free')?.features || [],
        pointsMultiplier: 1,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  // Check if user has access to a feature
  const hasFeature = useCallback((feature: string): boolean => {
    if (!subscription) return false

    const tier = PRICING_TIERS.find(t => t.id === subscription.tierId)
    if (!tier) return false

    // Check if feature is in the tier's features
    return tier.features.some(f =>
      f.toLowerCase().includes(feature.toLowerCase())
    )
  }, [subscription])

  // Check if user has a specific tier or higher
  const hasTier = useCallback((requiredTier: 'free' | 'student' | 'pro'): boolean => {
    if (!subscription) return requiredTier === 'free'

    const tierHierarchy = ['free', 'student', 'pro']
    const currentIndex = tierHierarchy.indexOf(subscription.tierId)
    const requiredIndex = tierHierarchy.indexOf(requiredTier)

    return currentIndex >= requiredIndex
  }, [subscription])

  // Get current tier info
  const currentTier: PricingTier | undefined = subscription
    ? PRICING_TIERS.find(t => t.id === subscription.tierId)
    : PRICING_TIERS.find(t => t.id === 'free')

  // Is subscription active (not free)
  const isPaid = subscription?.tierId !== 'free' &&
    ['active', 'trialing'].includes(subscription?.status || '')

  // Days until renewal
  const daysUntilRenewal = subscription?.currentPeriodEnd
    ? Math.ceil(
        (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
      )
    : null

  return {
    subscription,
    isLoading,
    error,
    refresh: fetchSubscription,

    // Helpers
    hasFeature,
    hasTier,
    currentTier,
    isPaid,
    daysUntilRenewal,
    pointsMultiplier: subscription?.pointsMultiplier || 1,
  }
}

// Gate component for subscription-based features
export function useSubscriptionGate(requiredTier: 'student' | 'pro') {
  const { hasTier, isLoading, currentTier } = useSubscription()

  return {
    hasAccess: hasTier(requiredTier),
    isLoading,
    requiredTier,
    currentTier,
    upgradeUrl: '/pricing',
  }
}
