'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Professional SVG Icons
const Icons = {
  Problem: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  Solution: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Market: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  Differentiator: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Contact: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  // Category icons for competitive landscape
  Study: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  Wellness: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  Fitness: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013-5.4 8.25 8.25 0 013.362 1.014z" />
    </svg>
  ),
  Charity: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
    </svg>
  ),
  Holistic: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
};

export default function InvestorsPage() {
  // Scroll animation refs
  const problemRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);
  const marketRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Visibility states
  const [problemVisible, setProblemVisible] = useState(false);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [landscapeVisible, setLandscapeVisible] = useState(false);
  const [marketVisible, setMarketVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === problemRef.current) setProblemVisible(true);
          if (entry.target === solutionRef.current) setSolutionVisible(true);
          if (entry.target === landscapeRef.current) setLandscapeVisible(true);
          if (entry.target === marketRef.current) setMarketVisible(true);
          if (entry.target === contactRef.current) setContactVisible(true);
        }
      });
    }, observerOptions);

    const refs = [problemRef, solutionRef, landscapeRef, marketRef, contactRef];
    refs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/20 text-teal-300 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                For Investors & Partners
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                The Only Platform Where Studying for Step 2 CK{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                  Saves Lives
                </span>{' '}
                Through Charitable Giving
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl">
                TribeWellMD transforms medical education by connecting academic achievement with wellness and social impact.
                Every study session, every wellness activity creates real-world charitable donations.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:invest@tribewellmd.com"
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
                >
                  Request Pitch Deck
                </a>
                <Link
                  href="/about"
                  className="px-8 py-4 border-2 border-slate-600 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section ref={problemRef} className="bg-white dark:bg-slate-900 py-16 md:py-24">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${problemVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0">
                <Icons.Problem />
              </div>
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  The Problem
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Medical education is broken</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-red-500 mb-2">400+</div>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">Physician suicides annually</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  The highest rate of any profession. Medical students have 3x higher suicide rates than age-matched peers.
                  The Dr. Lorna Breen Act was passed in 2022 to address this crisis.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
                  Sources: AFSP, AAMC 2023
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-red-500 mb-2">$300K+</div>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">Average medical student debt</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Students cannot afford premium study tools AND wellness resources. They are forced to choose between
                  their education and their mental health.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
                  Source: AAMC 2023 Graduate Survey
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-red-500 mb-2">Fragmented</div>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">Disconnected tools</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Anki for studying. Headspace for wellness. Strava for fitness. Instagram and TikTok for connection.
                  Distracting social media apps replace meaningful community. No integration. No purpose.
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-red-500 mb-2">Isolated</div>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">Limited networking</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Students enter medical school and residency programs with minimal cross-institutional connections.
                  No platform bridges the gap between schools, specialties, and career stages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section ref={solutionRef} className="bg-gradient-to-b from-teal-50/70 to-cyan-50/50 dark:from-slate-800/50 dark:to-slate-900 py-16 md:py-24">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${solutionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0">
                <Icons.Solution />
              </div>
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Our Solution
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">One platform. Study. Wellness. Community. Impact.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-t-4 border-teal-500">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">AI-Powered Study</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>• <strong>FSRS</strong> (Free Spaced Repetition Scheduler) - next-gen algorithm outperforming SM-2</li>
                  <li>• Smart review targets weak areas</li>
                  <li>• Text-to-speech for commutes</li>
                  <li>• Step 2 CK & Shelf exam prep</li>
                </ul>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-t-4 border-rose-500">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Wellness Tracking</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Daily wellness challenges</li>
                  <li>• Tiered activity verification</li>
                  <li>• Apple Health / Google Fit integration</li>
                  <li>• Mental health resources</li>
                </ul>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-t-4 border-violet-500">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Community & Tribes</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Peer study groups by specialty</li>
                  <li>• Mentorship matching</li>
                  <li>• Shared accountability</li>
                  <li>• Cross-institution connections</li>
                </ul>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-t-4 border-orange-500">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Social Impact</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Points convert to donations</li>
                  <li>• Curated 501(c)(3) partners</li>
                  <li>• Community impact dashboard</li>
                  <li>• Institutional sponsorship model</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Landscape - McKinsey/BCG Style */}
        <section ref={landscapeRef} className="bg-white dark:bg-slate-900 py-16 md:py-24">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${landscapeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Icons.Differentiator />
              </div>
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Competitive Landscape
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Market positioning and strategic differentiation</p>
              </div>
            </div>

            {/* Strategic Framework Box */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 md:p-8 mb-8 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Strategic Position: Integrated Value Platform</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Current market solutions address individual pain points in isolation. TribeWellMD captures value across the entire
                medical education ecosystem by integrating study, wellness, community, and social impact into a single platform with
                network effects.
              </p>

              {/* Competitive Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Competitor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Value Proposition</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Limitation</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-teal-600 dark:text-teal-400">TribeWellMD Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    <tr>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                            <Icons.Study />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Study</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900 dark:text-white">Anki, Quizlet</td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">Spaced repetition flashcards</td>
                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-500">Single-purpose, no community</td>
                      <td className="px-4 py-4 text-sm text-teal-600 dark:text-teal-400 font-medium">Study = Community Impact</td>
                    </tr>
                    <tr className="bg-slate-25 dark:bg-slate-800/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                            <Icons.Wellness />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Wellness</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900 dark:text-white">Headspace, Calm</td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">Personal meditation & wellness</td>
                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-500">Individual focus, no external impact</td>
                      <td className="px-4 py-4 text-sm text-teal-600 dark:text-teal-400 font-medium">Wellness → Charitable Giving</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <Icons.Fitness />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fitness</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900 dark:text-white">Strava, Peloton</td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">Fitness tracking & competition</td>
                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-500">General audience, no purpose</td>
                      <td className="px-4 py-4 text-sm text-teal-600 dark:text-teal-400 font-medium">Fitness → Medical Education Causes</td>
                    </tr>
                    <tr className="bg-slate-25 dark:bg-slate-800/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                            <Icons.Charity />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Charity</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900 dark:text-white">Charity Miles</td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">Walking/running for donations</td>
                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-500">Single activity type, low engagement</td>
                      <td className="px-4 py-4 text-sm text-teal-600 dark:text-teal-400 font-medium">Holistic (Study + Wellness + Social)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Differentiators */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl border border-teal-200 dark:border-teal-800">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Vertical Focus</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Purpose-built for medical education. Deep understanding of USMLE, shelf exams, and clinical rotations that
                  horizontal competitors cannot match.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl border border-violet-200 dark:border-violet-800">
                <div className="text-3xl mb-3">🔄</div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Virtuous Cycle</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Study progress drives wellness engagement. Wellness activities generate charitable impact.
                  Impact creates meaning that fuels continued study. Self-reinforcing flywheel.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                <div className="text-3xl mb-3">🤝</div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Network Effects</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Cross-institutional community creates defensible moat. More students = better mentorship matching,
                  study groups, and collective impact. Winner-take-most dynamics.
                </p>
              </div>
            </div>

            {/* Strategic Quote */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white">
              <p className="text-xl md:text-2xl font-serif italic text-center mb-4">
                "The only platform where studying for Step 2 CK literally saves lives through charitable giving."
              </p>
              <p className="text-center text-slate-400 text-sm">
                Unique value proposition with no direct competitors in the integrated medical education + wellness + impact space
              </p>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section ref={marketRef} className="bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900 py-16 md:py-24">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${marketVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Icons.Market />
              </div>
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Market Opportunity
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Large addressable market with multiple expansion vectors</p>
              </div>
            </div>

            {/* TAM/SAM/SOM */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-l-4 border-teal-500">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Addressable Market (TAM)</p>
                <div className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">$12B+</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Global medical education technology market, growing 17% CAGR
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
                  Source: Grand View Research 2023
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-l-4 border-violet-500">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Serviceable Addressable Market (SAM)</p>
                <div className="text-4xl font-bold text-violet-600 dark:text-violet-400 mb-2">$2B+</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  US medical student study tools + wellness apps + professional networking
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-l-4 border-amber-500">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Serviceable Obtainable Market (SOM)</p>
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">$200M</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  5-year target: 10% penetration of US medical students + residents
                </p>
              </div>
            </div>

            {/* Market Size Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-slate-800 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">95K+</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">US medical students</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">AAMC 2023</p>
              </div>
              <div className="p-5 bg-white dark:bg-slate-800 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">145K+</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">US residents</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ACGME 2023</p>
              </div>
              <div className="p-5 bg-white dark:bg-slate-800 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">90K+</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Serious pre-med students</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">MCAT registrations</p>
              </div>
              <div className="p-5 bg-white dark:bg-slate-800 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">155</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">US medical schools</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">B2B expansion</p>
              </div>
            </div>

            {/* Revenue Model Preview */}
            <div className="mt-8 p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl text-white">
              <h3 className="font-bold text-lg mb-4">Revenue Model</h3>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="font-medium">Freemium SaaS</p>
                  <p className="text-teal-100 text-xs mt-1">Core features free, premium tiers</p>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="font-medium">Institutional Licenses</p>
                  <p className="text-teal-100 text-xs mt-1">Medical school partnerships</p>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="font-medium">Sponsor Matching</p>
                  <p className="text-teal-100 text-xs mt-1">Charities & corporate sponsors</p>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="font-medium">Content Partnerships</p>
                  <p className="text-teal-100 text-xs mt-1">QBank integrations, resources</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section ref={contactRef} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-24">
          <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${contactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400">
              <Icons.Contact />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Let's Build the Future of Medical Education
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              We are looking for investors and partners who share our vision of transforming how medical students learn,
              stay well, and create impact.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:invest@tribewellmd.com"
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
              >
                Contact Us: invest@tribewellmd.com
              </a>
              <Link
                href="/partners"
                className="px-8 py-4 border-2 border-slate-600 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
              >
                Charity Partners →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
