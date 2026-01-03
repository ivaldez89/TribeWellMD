'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useIsAuthenticated } from '@/hooks/useAuth'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const [isLoading, setIsLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Simulate verification of the session
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [sessionId])

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#5B7B6D] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-300">Confirming your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome to TribeWellMD!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Your subscription is now active. Get ready to study smarter, track your wellness, and make a real impact.
          </p>

          {/* What's Next */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Next Steps
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#5B7B6D]/10 text-[#5B7B6D] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                Complete your profile and choose your village
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#5B7B6D]/10 text-[#5B7B6D] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                Start your first WHO-5 wellness check-in
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#5B7B6D]/10 text-[#5B7B6D] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                Explore flashcards and QBank to start earning points
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              href="/home"
              className="block w-full py-3 px-4 bg-[#5B7B6D] hover:bg-[#4A6A5C] text-white font-semibold rounded-xl transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/flashcards"
              className="block w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-colors"
            >
              Start Studying
            </Link>
          </div>
        </div>

        {/* Confirmation Details */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            A confirmation email has been sent to your inbox.
          </p>
          <p className="mt-1">
            Questions? <a href="mailto:support@tribewellmd.com" className="text-[#5B7B6D] hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#5B7B6D] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-300">Loading...</p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
