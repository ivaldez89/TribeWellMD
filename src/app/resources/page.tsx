'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Icons } from '@/components/ui/Icons';
import Link from 'next/link';
import { useState } from 'react';

const RESOURCE_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'book' },
  { id: 'cardiology', name: 'Cardiology', icon: 'heart' },
  { id: 'nephrology', name: 'Nephrology', icon: 'kidney' },
  { id: 'pulmonology', name: 'Pulmonology', icon: 'lungs' },
  { id: 'neurology', name: 'Neurology', icon: 'brain' },
  { id: 'hematology', name: 'Hematology', icon: 'blood' },
  { id: 'infectious', name: 'Infectious Disease', icon: 'virus' },
  { id: 'pharmacology', name: 'Pharmacology', icon: 'pill' },
];

// Helper to render category icons
const renderCategoryIcon = (iconName: string, className = "w-5 h-5") => {
  switch (iconName) {
    case 'book': return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
    case 'heart': return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
    case 'kidney': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4c-2 0-4 2-4 5 0 2 1 3 1 5s-1 4-1 6c0 2 2 2 4 0 2 2 4 2 4 0 0-2-1-4-1-6s1-3 1-5c0-3-2-5-4-5z" /></svg>;
    case 'lungs': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v6M12 9c-3 0-5 3-6 6-1 3 0 5 2 6 2 0 3-1 4-3M12 9c3 0 5 3 6 6 1 3 0 5-2 6-2 0-3-1-4-3" /></svg>;
    case 'brain': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>;
    case 'blood': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a6 6 0 006-6c0-4-6-11-6-11S6 11 6 15a6 6 0 006 6z" /></svg>;
    case 'virus': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="5" /><path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" /></svg>;
    case 'pill': return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.5 5.5l13 13M10.5 5l8.5 8.5a4 4 0 01-5.657 5.657L4.843 10.657A4 4 0 0110.5 5z" /></svg>;
    default: return <Icons.Book />;
  }
};

const INFOGRAPHICS = [
  {
    id: 1,
    title: 'Nephrotic vs Nephritic Syndrome',
    description: 'Key differences in presentation, labs, and causes',
    category: 'nephrology',
    difficulty: 'High Yield',
    icon: 'kidney',
    comingSoon: false
  },
  {
    id: 2,
    title: 'Anticoagulants Comparison',
    description: 'Warfarin, Heparin, DOACs - mechanisms and monitoring',
    category: 'hematology',
    difficulty: 'High Yield',
    icon: 'blood',
    comingSoon: false
  },
  {
    id: 3,
    title: 'Heart Murmurs Guide',
    description: 'Timing, location, radiation, and maneuvers',
    category: 'cardiology',
    difficulty: 'High Yield',
    icon: 'heart',
    comingSoon: true
  },
  {
    id: 4,
    title: 'Antibiotics Coverage Chart',
    description: 'Gram positive, negative, and atypicals',
    category: 'infectious',
    difficulty: 'Must Know',
    icon: 'virus',
    comingSoon: true
  },
  {
    id: 5,
    title: 'CSF Analysis',
    description: 'Bacterial vs viral vs fungal meningitis',
    category: 'neurology',
    difficulty: 'High Yield',
    icon: 'brain',
    comingSoon: true
  },
  {
    id: 6,
    title: 'Obstructive vs Restrictive Lung Disease',
    description: 'PFTs, clinical features, and treatment',
    category: 'pulmonology',
    difficulty: 'High Yield',
    icon: 'lungs',
    comingSoon: true
  },
  {
    id: 7,
    title: 'Drug Induced Side Effects',
    description: 'Common medications and their adverse effects',
    category: 'pharmacology',
    difficulty: 'Must Know',
    icon: 'pill',
    comingSoon: true
  },
  {
    id: 8,
    title: 'EKG Interpretation Algorithm',
    description: 'Systematic approach to reading EKGs',
    category: 'cardiology',
    difficulty: 'Must Know',
    icon: 'heart',
    comingSoon: true
  },
];

const GUIDES = [
  {
    title: 'MS1: Surviving Your First Year',
    description: 'What to expect, study strategies, and common pitfalls',
    icon: 'graduation',
    comingSoon: true
  },
  {
    title: 'MS2: Board Prep Timeline',
    description: 'Month-by-month guide to Step 1/COMLEX preparation',
    icon: 'calendar',
    comingSoon: true
  },
  {
    title: 'MS3: Rotation Survival Guide',
    description: 'Tips for each core rotation from students who crushed it',
    icon: 'hospital',
    comingSoon: true
  },
  {
    title: 'MS4: Application Season',
    description: 'ERAS, personal statements, and interview prep',
    icon: 'airplane',
    comingSoon: true
  },
];

// Helper for guide icons
const renderGuideIcon = (iconName: string) => {
  switch (iconName) {
    case 'graduation': return <Icons.GraduationCap />;
    case 'calendar': return <Icons.Calendar />;
    case 'hospital': return <Icons.Hospital />;
    case 'airplane': return <Icons.Airplane />;
    default: return <Icons.Book />;
  }
};

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredInfographics = selectedCategory === 'all'
    ? INFOGRAPHICS
    : INFOGRAPHICS.filter(i => i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-8 md:p-10 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
                <span>High-Yield Resources</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                Resource <span className="text-blue-200">Library</span>
              </h1>

              <p className="text-white/80 text-lg max-w-2xl mb-6">
                Visual guides, infographics, and quick references designed for rapid learning and board prep.
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-4 md:gap-6">
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-white">{INFOGRAPHICS.length}</p>
                  <p className="text-white/60 text-xs">Infographics</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-white">{GUIDES.length}</p>
                  <p className="text-white/60 text-xs">Survival Guides</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                  <p className="text-2xl md:text-3xl font-bold text-white">{RESOURCE_CATEGORIES.length - 1}</p>
                  <p className="text-white/60 text-xs">Categories</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Infographics Section */}
        <section className="mb-12 animate-fade-in-up animation-delay-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-blue-500"><Icons.Image /></span> Infographics & Quick References
            </h2>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {RESOURCE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {renderCategoryIcon(cat.icon, "w-4 h-4")}
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
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                  {renderCategoryIcon(info.icon, "w-8 h-8")}
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
        <section className="mb-12 animate-fade-in-up animation-delay-200">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-tribe-sage-500"><Icons.Book /></span> Medical School Survival Guides
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4 text-tribe-sage-600 dark:text-tribe-sage-400">
                  {renderGuideIcon(guide.icon)}
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
                  <Icons.Lightbulb />
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
                      <Icons.Chat />
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
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 flex-shrink-0">
                      <Icons.Handshake />
                    </div>
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
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
                <Icons.Upload />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Have a Great Infographic?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                We're building a community-curated library. If you've created helpful visual resources, share them with your fellow medical students!
              </p>
              <button className="px-8 py-4 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-xl shadow-lg transition-all hover:scale-105">
                Submit a Resource
              </button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
