'use client';

import { Header } from '@/components/layout/Header';
import Link from 'next/link';

const WELLNESS_CATEGORIES = [
  {
    id: 'mental-health',
    title: 'Mental Health',
    description: 'Resources for managing stress, anxiety, and maintaining mental wellness',
    icon: '🧠',
    color: 'from-purple-500 to-indigo-500',
    comingSoon: false,
    items: [
      'Recognizing burnout signs',
      'Imposter syndrome toolkit',
      'Stress management techniques',
      'When to seek help'
    ]
  },
  {
    id: 'work-life-balance',
    title: 'Work-Life Balance',
    description: 'Tips for maintaining relationships and personal life during training',
    icon: '⚖️',
    color: 'from-teal-500 to-emerald-500',
    comingSoon: true,
    items: [
      'Setting boundaries',
      'Relationship maintenance',
      'Time for hobbies',
      'Sleep optimization'
    ]
  },
  {
    id: 'physical-wellness',
    title: 'Physical Wellness',
    description: 'Exercise, nutrition, and self-care for busy medical students',
    icon: '💪',
    color: 'from-orange-500 to-red-500',
    comingSoon: true,
    items: [
      'Quick workout routines',
      'Meal prep for students',
      'Ergonomics for studying',
      'Sleep hygiene'
    ]
  },
  {
    id: 'peer-support',
    title: 'Peer Support',
    description: 'Connect with others who understand the journey',
    icon: '🤝',
    color: 'from-pink-500 to-rose-500',
    comingSoon: true,
    items: [
      'Study group finder',
      'Anonymous support forum',
      'Mentorship connections',
      'Specialty-specific groups'
    ]
  }
];

const QUICK_TIPS = [
  {
    title: "The 5-4-3-2-1 Grounding Technique",
    description: "When anxiety hits during a tough rotation: Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste.",
    category: "Anxiety Relief"
  },
  {
    title: "Pomodoro for Medical Studying",
    description: "Study for 25 minutes, break for 5. After 4 cycles, take a 15-30 minute break. Your brain needs rest to consolidate.",
    category: "Study Tips"
  },
  {
    title: "The 'Good Enough' Mindset",
    description: "Perfection is the enemy of progress. A 'good enough' study session is infinitely better than a perfect one you never start.",
    category: "Mindset"
  }
];

export default function WellnessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
            <span>💜</span>
            <span>Your Mental Health Matters</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Wellness <span className="text-purple-600 dark:text-purple-400">Center</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Medical school is a marathon, not a sprint. Take care of yourself so you can take care of others.
          </p>
        </section>

        {/* Crisis Resources Banner */}
        <section className="mb-12 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <span className="text-2xl">🆘</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Need immediate support?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Crisis resources are available 24/7</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="tel:988" className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                988 Suicide & Crisis Lifeline
              </a>
              <a href="https://www.crisistextline.org/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Text HOME to 741741
              </a>
            </div>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span>💡</span> Quick Wellness Tips
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {QUICK_TIPS.map((tip, index) => (
              <div key={index} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full mb-3">
                  {tip.category}
                </span>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{tip.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Wellness Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span>🌿</span> Wellness Resources
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {WELLNESS_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`relative p-6 rounded-2xl border ${
                  category.comingSoon
                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow'
                }`}
              >
                {category.comingSoon && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full">
                    Coming Soon
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{category.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* Psychologist Section */}
        <section className="mb-12 p-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl text-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">👩‍⚕️</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Expert Wellness Guidance</h3>
              <p className="text-purple-100 mb-4">
                Our wellness content is developed in collaboration with clinical psychologists who specialize in medical trainee mental health. Real strategies from experts who understand your unique challenges.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Evidence-based</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Medical-specific</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Practical tips</span>
              </div>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
