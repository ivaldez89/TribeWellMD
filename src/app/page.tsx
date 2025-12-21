'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Type for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PLATFORM_PILLARS = [
  {
    title: 'Study',
    description: 'FSRS-powered flashcards, rapid review, and exam prep designed for medical education',
    href: '/study',
    emoji: '📚',
    gradient: 'from-teal-400 to-cyan-500',
    features: ['Spaced Repetition', 'Step 2 CK & Shelf Exams', 'AI Card Generation']
  },
  {
    title: 'Wellness',
    description: 'Mental health resources, stress management, and support for your wellbeing journey',
    href: '/wellness',
    emoji: '💚',
    gradient: 'from-rose-400 to-pink-500',
    features: ['Mental Health Tools', 'Crisis Resources', 'Self-Care Guides']
  },
  {
    title: 'Resources',
    description: 'High-yield infographics, survival guides, and curated content for medical education',
    href: '/resources',
    emoji: '🖼️',
    gradient: 'from-amber-400 to-orange-500',
    features: ['Visual Summaries', 'Clinical Pearls', 'Study Guides']
  },
  {
    title: 'Community',
    description: 'Connect with mentors, join study groups, and find your tribe in medicine',
    href: '/community',
    emoji: '👥',
    gradient: 'from-violet-400 to-purple-500',
    features: ['Mentorship', 'Research & News', 'Study Groups'],
    comingSoon: true
  },
  {
    title: 'PreMed',
    description: 'Guidance, mentorship, and resources for your journey to medical school',
    href: '/premed',
    emoji: '🎓',
    gradient: 'from-emerald-400 to-teal-500',
    features: ['MCAT Prep', 'Application Guide', 'Med Student Mentors'],
    comingSoon: true
  },
];

const USER_TYPES = [
  { type: 'Medical Students', description: 'Ace your exams while staying sane', emoji: '🩺' },
  { type: 'Residents', description: 'Stay sharp, pay it forward', emoji: '👨‍⚕️' },
  { type: 'Attendings', description: 'Share wisdom, stay connected', emoji: '🏥' },
  { type: 'Pre-Meds', description: 'Start your journey right', emoji: '📖' },
];

export default function HomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16 py-12 md:py-20">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Study Smart.
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">Stay Well.</span>
            <br />
            Find Your Tribe.
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10">
            The complete platform for medical students, residents, and attendings.
            <br />
            Evidence-based tools. Mental wellness. Community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/study"
              className="px-8 py-4 bg-slate-900 dark:bg-slate-800 text-white font-semibold rounded-full hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Get Started &nbsp;→
            </Link>
            <Link
              href="/wellness"
              className="text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Explore Wellness →
            </Link>
          </div>
        </section>

        {/* Platform Pillars */}
        <section className="mb-16">
          {/* Top row - 2 featured cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {PLATFORM_PILLARS.slice(0, 2).map((pillar, index) => (
              <Link
                key={index}
                href={pillar.href}
                className={`group relative p-8 rounded-2xl bg-gradient-to-br ${pillar.gradient} text-white overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-5xl mb-4">{pillar.emoji}</div>
                    <h3 className="text-3xl font-bold mb-3">{pillar.title}</h3>
                    <p className="text-white/90 mb-6 max-w-md">{pillar.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pillar.features.map((feature, idx) => (
                    <span key={idx} className="px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom row - 3 cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {PLATFORM_PILLARS.slice(2).map((pillar, index) => (
              <Link
                key={index}
                href={pillar.href}
                className={`group relative p-6 rounded-2xl bg-gradient-to-br ${pillar.gradient} text-white overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-lg`}
              >
                {pillar.comingSoon && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
                    Coming Soon
                  </div>
                )}

                <div className="text-4xl mb-4">{pillar.emoji}</div>
                <h3 className="text-2xl font-bold mb-2">{pillar.title}</h3>
                <p className="text-white/80 text-sm mb-4">{pillar.description}</p>
                <div className="flex flex-wrap gap-2">
                  {pillar.features.map((feature, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Who We Serve */}
        <section className="mb-16 py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-4">
            For Everyone in Medicine
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Whether you're just starting out or leading a team, we've got your back.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {USER_TYPES.map((user, i) => (
              <div
                key={i}
                className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-all hover:shadow-lg text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {user.emoji}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{user.type}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-16 bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Built by Medical Students, for Everyone in Medicine
          </h2>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto mb-8">
            We believe that succeeding in medicine shouldn't mean sacrificing your health. TribeWellMD combines evidence-based study tools with wellness resources and a supportive community to help you thrive at every stage.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-white mb-2">Study Smarter</h4>
              <p className="text-slate-400 text-sm">FSRS algorithm optimizes your learning for maximum retention with minimum time</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💚</div>
              <h4 className="font-semibold text-white mb-2">Wellness First</h4>
              <p className="text-slate-400 text-sm">Mental health resources, crisis support, and self-care tools always at your fingertips</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h4 className="font-semibold text-white mb-2">Find Your Tribe</h4>
              <p className="text-slate-400 text-sm">Connect with mentors, peers, and a community that understands your journey</p>
            </div>
          </div>
        </section>

        {/* Philosophy Quote - Individualism + Community */}
        <section className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-indigo-500/5 rounded-3xl" />
          <div className="relative p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50 flex items-center justify-center">
              <span className="text-3xl">💡</span>
            </div>
            <blockquote className="text-2xl md:text-3xl font-serif text-slate-800 dark:text-slate-200 max-w-4xl mx-auto mb-6 leading-relaxed">
              "Most people believe <span className="text-teal-600 dark:text-teal-400 font-semibold">individualism</span> and{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">community</span> are mutually exclusive.{' '}
              <br className="hidden md:block" />
              Our mission is to show they are{' '}
              <span className="bg-gradient-to-r from-teal-500 to-indigo-500 bg-clip-text text-transparent font-bold">
                mutually reinforcing
              </span>."
            </blockquote>
            <p className="text-slate-500 dark:text-slate-400 italic">
              — TribeWellMD Philosophy
            </p>
          </div>
        </section>

        {/* Self-Care to Impact - Points System Concept */}
        <section className="mb-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                Coming Soon
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Self-Care Drives Community Impact
              </h2>
              <p className="text-white/90 text-lg max-w-2xl mx-auto">
                When you take care of yourself, you earn points that become real donations to causes you care about.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="font-bold text-xl mb-2">Earn Points</h3>
                <p className="text-white/80 text-sm">
                  Study flashcards, log sleep, complete wellness activities, hit your goals
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="font-bold text-xl mb-2">Unite with Your Tribe</h3>
                <p className="text-white/80 text-sm">
                  Join tribes supporting causes like Red Cross, animal shelters, or beach cleanups
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">💚</span>
                </div>
                <h3 className="font-bold text-xl mb-2">Make Real Impact</h3>
                <p className="text-white/80 text-sm">
                  Your points convert to charity donations — self-improvement becomes world improvement
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                Imagine: Every time you review flashcards or get 8 hours of sleep, you're contributing to clean water access, disaster relief, or medical missions.
              </p>
              <Link
                href="/tribes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
              >
                Explore Tribes
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to Join Your Tribe?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Start your journey today. Study smarter, take care of yourself, and connect with a community that has your back.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/study"
              className="px-8 py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-all shadow-lg"
            >
              Start Studying Now →
            </Link>
            <Link
              href="/premed"
              className="px-8 py-4 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all"
            >
              I'm a Pre-Med
            </Link>
          </div>
        </section>

        {/* Install App Section */}
        {isMounted && !isInstalled && (
          <section className="mb-16 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Install TribeWellMD</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {isIOS ? 'Tap share → Add to Home Screen' : 'Add to your home screen for quick access'}
                  </p>
                </div>
              </div>
              {deferredPrompt ? (
                <button
                  onClick={handleInstall}
                  className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-all"
                >
                  Install App
                </button>
              ) : (
                <div className="text-slate-500 text-sm">
                  {isIOS ? 'Use Safari to install' : 'Use browser menu to install'}
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
