'use client'

import { useState, useEffect, useCallback } from 'react'
import { POINTS_PER_DOLLAR, pointsToDollars, formatDonation, formatPoints } from '@/types/donations'

export interface PointsBalance {
  userId: string
  totalEarned: number
  totalDonated: number
  currentBalance: number
  villageId: string | null
  updatedAt: string
}

export interface PointTransaction {
  id: string
  points: number
  source: string
  description: string
  createdAt: string
}

export interface DonationResult {
  success: boolean
  pointsConverted?: number
  dollarsGenerated?: number
  dollarsFormatted?: string
  transactionId?: string
  charity?: {
    id: string
    name: string
    mission: string
  }
  message?: string
  error?: string
}

export function usePoints() {
  const [balance, setBalance] = useState<PointsBalance | null>(null)
  const [history, setHistory] = useState<PointTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch balance and history
  const fetchPoints = useCallback(async (includeHistory = false) => {
    try {
      const url = `/api/points${includeHistory ? '?history=true' : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch points')
      }

      const data = await response.json()
      setBalance(data.balance)

      if (data.history) {
        setHistory(data.history)
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch points')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchPoints(true)
  }, [fetchPoints])

  // Award points
  const awardPoints = useCallback(async (
    points: number,
    source: string,
    description?: string
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, source, description })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      // Update local state
      if (balance && data.newBalance !== undefined) {
        setBalance({
          ...balance,
          currentBalance: data.newBalance,
          totalEarned: balance.totalEarned + points
        })
      }

      return { success: true, newBalance: data.newBalance }
    } catch (err) {
      return { success: false, error: 'Network error' }
    }
  }, [balance])

  // Convert points to donation
  const donate = useCallback(async (
    points: number,
    charityId: string
  ): Promise<DonationResult> => {
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, charityId })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      // Update local state
      if (balance) {
        setBalance({
          ...balance,
          currentBalance: balance.currentBalance - points,
          totalDonated: balance.totalDonated + points
        })
      }

      return {
        success: true,
        pointsConverted: data.pointsConverted,
        dollarsGenerated: data.dollarsGenerated,
        dollarsFormatted: data.dollarsFormatted,
        transactionId: data.transactionId,
        charity: data.charity,
        message: data.message
      }
    } catch (err) {
      return { success: false, error: 'Network error' }
    }
  }, [balance])

  // Refresh data
  const refresh = useCallback(() => {
    setIsLoading(true)
    fetchPoints(true)
  }, [fetchPoints])

  // Computed values
  const dollarsAvailable = balance ? pointsToDollars(balance.currentBalance) : 0
  const dollarsDonated = balance ? pointsToDollars(balance.totalDonated) : 0
  const dollarsEarned = balance ? pointsToDollars(balance.totalEarned) : 0

  const canDonate = balance ? balance.currentBalance >= POINTS_PER_DOLLAR : false

  return {
    // State
    balance,
    history,
    isLoading,
    error,

    // Actions
    awardPoints,
    donate,
    refresh,

    // Computed
    dollarsAvailable,
    dollarsDonated,
    dollarsEarned,
    canDonate,

    // Formatters
    formatPoints,
    formatDonation,

    // Constants
    POINTS_PER_DOLLAR
  }
}

// Global stats hook
export function useGlobalStats() {
  const [stats, setStats] = useState<{
    totalPoints: number
    totalDonated: number
    totalDonatedFormatted: string
    totalUsers: number
    totalVillages: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/donations?type=global')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (err) {
        console.error('Failed to fetch global stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading }
}

// Village leaderboard hook
export function useVillageLeaderboard(limit = 10) {
  const [leaderboard, setLeaderboard] = useState<Array<{
    villageId: string
    villageName: string
    totalDonated: number
    memberCount: number
  }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(`/api/donations?type=leaderboard&limit=${limit}`)
        if (response.ok) {
          const data = await response.json()
          setLeaderboard(data.leaderboard || [])
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [limit])

  return { leaderboard, isLoading }
}
