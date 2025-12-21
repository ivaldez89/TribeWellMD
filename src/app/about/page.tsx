'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />

      <main>
        {/* Hero Section - Origin Story */}
        <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                Our Story
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
                Born From Experience.<br />
                <span className="text-teal-600 dark:text-teal-400">Built for Change.</span>
              </h1>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  TribeWellMD was founded by physicians who lived the paradox: training to heal others while watching themselves and colleagues struggle with burnout, isolation, and a system that treats wellness as an afterthought.
                </p>
                <blockquote className="border-l-4 border-teal-500 pl-6 py-2 my-8 bg-teal-50 dark:bg-teal-900/20 rounded-r-xl">
                  <p className="text-xl text-slate-700 dark:text-slate-300 italic mb-2">
                    "We kept asking ourselves: why does becoming a doctor require sacrificing your own health? What if the same tools that help us learn could help us thrive?"
                  </p>
                  <cite className="text-sm text-slate-500 dark:text-slate-400 not-italic">
                    — TribeWellMD Founding Team
                  </cite>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Theory of Change - Academic Framework */}
        <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Evidence-Based Approach</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                Theory of Change
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Our intervention model is grounded in behavioral science, social psychology, and medical education research.
              </p>
            </div>

            {/* Logic Model */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 md:p-10">
              <div className="grid md:grid-cols-5 gap-4 md:gap-2 relative">
                {/* Arrows for desktop */}
                <div className="hidden md:block absolute top-1/2 left-[18%] w-[14%] h-0.5 bg-gradient-to-r from-violet-400 to-emerald-400 -translate-y-1/2" />
                <div className="hidden md:block absolute top-1/2 left-[38%] w-[14%] h-0.5 bg-gradient-to-r from-emerald-400 to-orange-400 -translate-y-1/2" />
                <div className="hidden md:block absolute top-1/2 left-[58%] w-[14%] h-0.5 bg-gradient-to-r from-orange-400 to-cyan-400 -translate-y-1/2" />
                <div className="hidden md:block absolute top-1/2 left-[78%] w-[14%] h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400 -translate-y-1/2" />

                {/* Input */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-t-4 border-violet-500 shadow-lg">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Inputs</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">Platform & Community</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>FSRS algorithm</li>
                    <li>Tribe networks</li>
                    <li>Wellness modules</li>
                    <li>Charity partners</li>
                  </ul>
                </div>

                {/* Activities */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-t-4 border-emerald-500 shadow-lg">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Activities</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">User Engagement</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Daily study sessions</li>
                    <li>Wellness check-ins</li>
                    <li>Peer interactions</li>
                    <li>Point accumulation</li>
                  </ul>
                </div>

                {/* Outputs */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-t-4 border-orange-500 shadow-lg">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Outputs</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">Measurable Actions</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Cards reviewed</li>
                    <li>Habits completed</li>
                    <li>Connections made</li>
                    <li>Points donated</li>
                  </ul>
                </div>

                {/* Outcomes */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-t-4 border-cyan-500 shadow-lg">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Outcomes</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">Individual Impact</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Better retention</li>
                    <li>Lower burnout</li>
                    <li>Stronger network</li>
                    <li>Sense of purpose</li>
                  </ul>
                </div>

                {/* Impact */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-t-4 border-teal-500 shadow-lg">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Impact</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">Systemic Change</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Healthier physicians</li>
                    <li>Better patient care</li>
                    <li>Cultural shift</li>
                    <li>Charitable impact</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Research Citations */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">2.5x</div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Spaced repetition improves long-term retention by 2.5x compared to massed practice
                </p>
                <cite className="text-xs text-slate-500 dark:text-slate-500 mt-2 block">
                  Karpicke & Roediger, Science (2008)
                </cite>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">40%</div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Social support reduces burnout symptoms by up to 40% in healthcare workers
                </p>
                <cite className="text-xs text-slate-500 dark:text-slate-500 mt-2 block">
                  West et al., JAMA Internal Medicine (2016)
                </cite>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">68%</div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Prosocial giving increases happiness and motivation more than self-focused rewards
                </p>
                <cite className="text-xs text-slate-500 dark:text-slate-500 mt-2 block">
                  Dunn et al., Science (2008)
                </cite>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values - Strategic Pillars */}
        <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Guiding Principles</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                Core Values
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Five principles that guide every decision we make as we build TribeWellMD.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Value 1 */}
              <div className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform">
                  01
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Evidence Over Opinion</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Every feature is grounded in peer-reviewed research. We build on what science proves works.
                </p>
              </div>

              {/* Value 2 */}
              <div className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform">
                  02
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Community First</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We design for collective benefit. Individual success is a stepping stone to community thriving.
                </p>
              </div>

              {/* Value 3 */}
              <div className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform">
                  03
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Sustainable Growth</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No shortcuts, no burnout culture. We optimize for long-term wellbeing, not short-term metrics.
                </p>
              </div>

              {/* Value 4 */}
              <div className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform">
                  04
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Radical Transparency</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Users know exactly how points convert, where donations go, and how the platform works.
                </p>
              </div>

              {/* Value 5 */}
              <div className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform">
                  05
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Purpose-Driven</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Every action on the platform can create real-world impact. Progress becomes meaningful.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Virtuous Cycle - Visual Diagram */}
        <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Core Mechanism</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                The Virtuous Cycle
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Our unique insight: individual achievement and community wellbeing are not opposing forces—they are mutually reinforcing.
              </p>
            </div>

            {/* Cycle Visualization */}
            <div className="relative max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
                {/* Personal Achievement */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/20 rounded-2xl p-8 text-center border-2 border-violet-200 dark:border-violet-700">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-xl text-violet-900 dark:text-violet-300 mb-2">Personal Achievement</h3>
                    <p className="text-violet-700 dark:text-violet-400 text-sm">
                      Study effectively with FSRS, build healthy habits, and track your progress
                    </p>
                  </div>
                  {/* Arrow to next */}
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                  <div className="md:hidden flex justify-center my-4">
                    <svg className="w-8 h-8 text-emerald-500 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>

                {/* Community Connection */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-2xl p-8 text-center border-2 border-emerald-200 dark:border-emerald-700">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-xl text-emerald-900 dark:text-emerald-300 mb-2">Community Connection</h3>
                    <p className="text-emerald-700 dark:text-emerald-400 text-sm">
                      Join tribes, find mentors, share wins, and lift each other up
                    </p>
                  </div>
                  {/* Arrow to next */}
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                  <div className="md:hidden flex justify-center my-4">
                    <svg className="w-8 h-8 text-orange-500 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>

                {/* Charitable Impact */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl p-8 text-center border-2 border-orange-200 dark:border-orange-700">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-xl text-orange-900 dark:text-orange-300 mb-2">Charitable Impact</h3>
                    <p className="text-orange-700 dark:text-orange-400 text-sm">
                      Convert achievements to donations, creating purpose that fuels more growth
                    </p>
                  </div>
                </div>
              </div>

              {/* Connecting cycle arrow back */}
              <div className="hidden md:block absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4">
                <svg className="w-full h-12 text-violet-400" viewBox="0 0 400 50" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M380 10 C 380 40, 20 40, 20 10" strokeDasharray="5,5" />
                  <path d="M20 10 L 10 20 M20 10 L 30 20" strokeDasharray="none" />
                </svg>
              </div>
              <p className="hidden md:block text-center text-sm text-violet-600 dark:text-violet-400 mt-8 italic">
                Purpose creates meaning → Meaning drives motivation → Motivation fuels achievement
              </p>
            </div>
          </div>
        </section>

        {/* Commitment to Impact */}
        <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Our Commitment</span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-6">
                  Impact Over Profit
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                  Unlike traditional EdTech that optimizes for engagement metrics and ad revenue, TribeWellMD is structured to maximize positive outcomes for medical learners.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Transparent Charitable Model</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Users see exactly where their points-to-donations go</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Wellness-First Design</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Features discourage cramming and promote sustainable habits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Community Ownership</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">User feedback directly shapes platform development</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Stats */}
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6">Our Vision for Impact</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">1M+</div>
                    <div className="text-teal-100 text-sm">Medical learners served</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">$10M+</div>
                    <div className="text-teal-100 text-sm">Charitable donations enabled</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">50%</div>
                    <div className="text-teal-100 text-sm">Reduction in reported burnout</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">100K+</div>
                    <div className="text-teal-100 text-sm">Meaningful peer connections</div>
                  </div>
                </div>
                <p className="mt-6 text-teal-100 text-sm italic text-center">
                  These are the goals we are working toward. Join us in making them reality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
                Join the Movement
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                TribeWellMD is more than an app—it is a community committed to proving that healthcare professionals can thrive, not just survive.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:scale-105"
                >
                  Create Your Account
                </Link>
                <Link
                  href="/investors"
                  className="px-8 py-4 border-2 border-slate-600 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 hover:border-slate-500 transition-all"
                >
                  For Investors
                </Link>
                <Link
                  href="/partners"
                  className="px-8 py-4 border-2 border-slate-600 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 hover:border-slate-500 transition-all"
                >
                  For Partners
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
