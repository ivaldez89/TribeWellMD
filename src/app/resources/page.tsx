'use client';

import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { useState } from 'react';

const RESOURCE_CATEGORIES = [
  { id: 'all', name: 'All', icon: '📚' },
  { id: 'cardiology', name: 'Cardiology', icon: '❤️' },
  { id: 'nephrology', name: 'Nephrology', icon: '🫘' },
  { id: 'pulmonology', name: 'Pulmonology', icon: '🫁' },
  { id: 'neurology', name: 'Neurology', icon: '🧠' },
  { id: 'hematology', name: 'Hematology', icon: '🩸' },
  { id: 'infectious', name: 'Infectious Disease', icon: '🦠' },
  { id: 'pharmacology', name: 'Pharmacology', icon: '💊' },
];

const INFOGRAPHICS = [
  {
    id: 1,
    title: 'Nephrotic vs Nephritic Syndrome',
    description: 'Key differences in presentation, labs, and causes',
    category: 'nephrology',
    difficulty: 'High Yield',
    preview: '🫘',
    comingSoon: false
  },
  {
    id: 2,
    title: 'Anticoagulants Comparison',
    description: 'Warfarin, Heparin, DOACs - mechanisms and monitoring',
    category: 'hematology',
    difficulty: 'High Yield',
    preview: '🩸',
    comingSoon: false
  },
  {
    id: 3,
    title: 'Heart Murmurs Guide',
    description: 'Timing, location, radiation, and maneuvers',
    category: 'cardiology',
    difficulty: 'High Yield',
    preview: '❤️',
    comingSoon: true
  },
  {
    id: 4,
    title: 'Antibiotics Coverage Chart',
    description: 'Gram positive, negative, and atypicals',
    category: 'infectious',
    difficulty: 'Must Know',
    preview: '🦠',
    comingSoon: true
  },
  {
    id: 5,
    title: 'CSF Analysis',
    description: 'Bacterial vs viral vs fungal meningitis',
    category: 'neurology',
    difficulty: 'High Yield',
    preview: '🧠',
    comingSoon: true
  },
  {
    id: 6,
    title: 'Obstructive vs Restrictive Lung Disease',
    description: 'PFTs, clinical features, and treatment',
    category: 'pulmonology',
    difficulty: 'High Yield',
    preview: '🫁',
    comingSoon: true
  },
  {
    id: 7,
    title: 'Drug Induced Side Effects',
    description: 'Common medications and their adverse effects',
    category: 'pharmacology',
    difficulty: 'Must Know',
    preview: '💊',
    comingSoon: true
  },
  {
    id: 8,
    title: 'EKG Interpretation Algorithm',
    description: 'Systematic approach to reading EKGs',
    category: 'cardiology',
    difficulty: 'Must Know',
    preview: '❤️',
    comingSoon: true
  },
];

const GUIDES = [
  {
    title: 'MS1: Surviving Your First Year',
    description: 'What to expect, study strategies, and common pitfalls',
    icon: '🎓',
    comingSoon: true
  },
  {
    title: 'MS2: Board Prep Timeline',
    description: 'Month-by-month guide to Step 1/COMLEX preparation',
    icon: '📅',
    comingSoon: true
  },
  {
    title: 'MS3: Rotation Survival Guide',
    description: 'Tips for each core rotation from students who crushed it',
    icon: '🏥',
    comingSoon: true
  },
  {
    title: 'MS4: Application Season',
    description: 'ERAS, personal statements, and interview prep',
    icon: '✈️',
    comingSoon: true
  },
];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredInfographics = selectedCategory === 'all'
    ? INFOGRAPHICS
    : INFOGRAPHICS.filter(i => i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <span>📖</span>
            <span>High-Yield Resources</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Resource <span className="text-blue-600 dark:text-blue-400">Library</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Visual guides, infographics, and quick references designed for rapid learning and board prep.
          </p>
        </section>

        {/* Infographics Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🖼️</span> Infographics & Quick References
            </h2>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {RESOURCE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Infographics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfographics.map((info) => (
              <div
                key={info.id}
                className={`relative group p-6 rounded-2xl border transition-all ${
                  info.comingSoon
                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer'
                }`}
              >
                {info.comingSoon && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full">
                    Coming Soon
                  </div>
                )}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4 text-3xl">
                  {info.preview}
                </div>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded mb-2 ${
                  info.difficulty === 'Must Know'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                }`}>
                  {info.difficulty}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{info.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{info.description}</p>
                {!info.comingSoon && (
                  <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    View Infographic
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Medical School Guides */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span>📚</span> Medical School Survival Guides
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GUIDES.map((guide, index) => (
              <div
                key={index}
                className="relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full">
                  Coming Soon
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4 text-2xl">
                  {guide.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{guide.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{guide.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Accommodations Section */}
        <section className="mb-12">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/30 dark:bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/50 rounded-full text-violet-700 dark:text-violet-300 text-sm font-medium mb-4">
                  <span>💡</span>
                  Everyone Learns Differently
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Accommodations Aren't a Weakness
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  Our founder was the first medical student in his school's history to use text-to-speech technology for exams.
                  From extended time to screen readers, accommodations are tools for success—not limitations.
                  <span className="font-medium text-slate-900 dark:text-white"> We celebrate different learning styles.</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Extended Time', 'Text-to-Speech', 'Screen Readers', 'Quiet Testing', 'Breaks'].map((acc) => (
                    <span key={acc} className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full text-sm text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
                      {acc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 flex-shrink-0">
                      💬
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        "I thought I was alone. Seeing that others use accommodations too made me finally reach out for support."
                      </p>
                      <p className="text-slate-500 text-xs mt-2">— Future TribeWellMD community member</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🤝</div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">Ask Questions. Share Experiences.</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Join a community that normalizes getting the support you need.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contribute CTA */}
        <section className="p-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Have a Great Infographic?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            We're building a community-curated library. If you've created helpful visual resources, share them with your fellow medical students!
          </p>
          <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
            Submit a Resource
          </button>
        </section>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
