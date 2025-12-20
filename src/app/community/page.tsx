'use client';

import { Header } from '@/components/layout/Header';
import Link from 'next/link';

const COMMUNITY_FEATURES = [
  {
    title: 'Mentorship Matching',
    description: 'Connect with residents and attendings in your specialty of interest for guidance and advice',
    icon: '🎯',
    status: 'Coming Soon',
    features: ['Specialty-specific matching', 'Video calls & messaging', 'Career guidance']
  },
  {
    title: 'Day-in-the-Life',
    description: 'See what residency is really like through posts from current residents at programs nationwide',
    icon: '📸',
    status: 'Coming Soon',
    features: ['Real resident experiences', 'Program insights', 'Specialty exploration']
  },
  {
    title: 'Study Groups',
    description: 'Find study partners for boards, shelf exams, or just getting through the week',
    icon: '📚',
    status: 'Coming Soon',
    features: ['Location-based matching', 'Virtual study rooms', 'Accountability partners']
  },
  {
    title: 'Anonymous Support',
    description: 'A safe space to share struggles, ask questions, and support each other',
    icon: '💬',
    status: 'Coming Soon',
    features: ['Moderated discussions', 'Peer support', 'Professional resources']
  },
  {
    title: 'Program Reviews',
    description: 'Honest, verified reviews of residency programs from people who trained there',
    icon: '⭐',
    status: 'Coming Soon',
    features: ['Verified reviewers', 'Detailed ratings', 'Anonymous feedback']
  },
  {
    title: 'Specialty Channels',
    description: 'Join communities focused on your specialty interests - from surgery to psychiatry',
    icon: '🏥',
    status: 'Coming Soon',
    features: ['Specialty discussions', 'Research opportunities', 'Conference updates']
  },
];

const RESEARCH_NEWS_FEATURES = [
  {
    title: 'Medical Breakthroughs',
    description: 'Stay current with the latest research findings, curated and summarized by specialty',
    icon: '🔬',
    status: 'Coming Soon',
    features: ['Specialty-specific feeds', 'Plain-language summaries', 'Clinical implications']
  },
  {
    title: 'Conference Calendar',
    description: 'Never miss an important conference - find events by specialty and location',
    icon: '📅',
    status: 'Coming Soon',
    features: ['Specialty filters', 'Virtual & in-person', 'Abstract deadlines']
  },
  {
    title: 'Funding Opportunities',
    description: 'Discover grants, fellowships, and research funding matched to your interests',
    icon: '💰',
    status: 'Coming Soon',
    features: ['Deadline tracking', 'Eligibility matching', 'Application tips']
  },
  {
    title: 'Journal Club',
    description: 'Join discussions about landmark papers and emerging research in your field',
    icon: '📰',
    status: 'Coming Soon',
    features: ['Moderated discussions', 'Expert commentary', 'Critical appraisal']
  },
];

const TESTIMONIALS = [
  {
    quote: "I wish I had something like this when I was applying. Finding a mentor in interventional cardiology was pure luck.",
    author: "PGY-3, Internal Medicine",
    avatar: "👨‍⚕️"
  },
  {
    quote: "The anonymous support would have helped so much during my surgery rotation. I thought I was the only one struggling.",
    author: "MS3, Midwest Medical School",
    avatar: "👩‍⚕️"
  },
  {
    quote: "Knowing what programs are actually like before rank day would be invaluable. The interview day experience isn't reality.",
    author: "PGY-1, Emergency Medicine",
    avatar: "🧑‍⚕️"
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-orange-50 dark:from-slate-900 dark:to-orange-900/20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-700 dark:text-orange-300 text-sm font-medium mb-6">
            <span>🚀</span>
            <span>Coming Soon</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Find Your <span className="text-orange-600 dark:text-orange-400">Tribe</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Medicine is hard. You don't have to do it alone. Connect with mentors, peers, and a community that understands your journey.
          </p>

          {/* Email Signup */}
          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email for early access"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25">
                Notify Me
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Be the first to know when community features launch. No spam, ever.
            </p>
          </div>
        </section>

        {/* Community Features Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Connect & Support
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMUNITY_FEATURES.map((feature, index) => (
              <div
                key={index}
                className="relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-full">
                  {feature.status}
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center mb-4 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Research & News Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
              <span>🔬</span>
              <span>Research & News</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Stay Current, Stay Connected
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From breakthrough research to funding opportunities, stay informed and engaged with the academic medicine community.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {RESEARCH_NEWS_FEATURES.map((feature, index) => (
              <div
                key={index}
                className="relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                  {feature.status}
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Why Community Matters */}
        <section className="mb-16 p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Why This Matters</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-4xl font-bold text-orange-400 mb-2">27%</div>
                <p className="text-slate-300">of medical students experience depression</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-400 mb-2">50%</div>
                <p className="text-slate-300">feel they lack adequate mentorship</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-400 mb-2">1 in 3</div>
                <p className="text-slate-300">residents report burnout symptoms</p>
              </div>
            </div>
            <p className="text-slate-300 text-lg">
              Medical training can be isolating. TribeWellMD is building the community that should have always existed.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            What Trainees Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-slate-600 dark:text-slate-300 italic mb-4">"{testimonial.quote}"</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center p-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Your Tribe?</h2>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto">
            We're building this for you. Sign up for early access and help shape the community.
          </p>
          <button className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors shadow-lg">
            Get Early Access
          </button>
        </section>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
