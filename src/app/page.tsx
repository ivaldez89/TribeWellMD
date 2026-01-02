'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// ʻUlu Plant SVG Component - grows and transforms as user scrolls
const UluPlant = ({ scrollProgress }: { scrollProgress: number }) => {
  // Calculate growth stages based on scroll
  const stemHeight = Math.min(100, scrollProgress * 150);
  const leafOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.2) * 2));
  const fruitOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.5) * 2));
  const blossomScale = Math.min(1, Math.max(0, scrollProgress * 1.5));

  return (
    <svg
      width="400"
      height="500"
      viewBox="0 0 400 500"
      className="w-full max-w-md mx-auto transition-all duration-700 ease-out"
      style={{ opacity: Math.min(1, scrollProgress * 2) }}
    >
      {/* Root system - always visible, subtle */}
      <g opacity="0.3">
        <path
          d="M200 500 Q180 480 160 450 Q140 420 130 400"
          stroke="#8B7355"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M200 500 Q220 480 240 450 Q260 420 270 400"
          stroke="#8B7355"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Main stem - grows with scroll */}
      <path
        d={`M200 500 L200 ${500 - stemHeight}`}
        stroke="#556B5E"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        style={{ transition: 'all 0.3s ease-out' }}
      />

      {/* Leaves - appear after stem grows */}
      <g opacity={leafOpacity} style={{ transition: 'opacity 0.5s ease-out' }}>
        {/* Left leaves */}
        <ellipse cx="150" cy="350" rx="40" ry="60" fill="#5B7B6D" opacity="0.8" transform="rotate(-30 150 350)" />
        <ellipse cx="130" cy="280" rx="35" ry="55" fill="#5B7B6D" opacity="0.7" transform="rotate(-35 130 280)" />
        <ellipse cx="140" cy="220" rx="38" ry="58" fill="#5B7B6D" opacity="0.75" transform="rotate(-25 140 220)" />

        {/* Right leaves */}
        <ellipse cx="250" cy="330" rx="40" ry="60" fill="#5B7B6D" opacity="0.8" transform="rotate(30 250 330)" />
        <ellipse cx="270" cy="260" rx="35" ry="55" fill="#5B7B6D" opacity="0.7" transform="rotate(35 270 260)" />
        <ellipse cx="260" cy="200" rx="38" ry="58" fill="#5B7B6D" opacity="0.75" transform="rotate(25 260 200)" />
      </g>

      {/* Breadfruit - appears in final stage */}
      <g opacity={fruitOpacity} style={{ transition: 'opacity 0.5s ease-out' }}>
        <ellipse cx="180" cy="250" rx="25" ry="30" fill="#C4A77D" opacity="0.9" />
        <ellipse cx="220" cy="230" rx="28" ry="32" fill="#C4A77D" opacity="0.9" />
        <ellipse cx="200" cy="190" rx="22" ry="28" fill="#C4A77D" opacity="0.85" />

        {/* Fruit texture */}
        <circle cx="180" cy="245" r="3" fill="#A89070" opacity="0.6" />
        <circle cx="185" cy="255" r="3" fill="#A89070" opacity="0.6" />
        <circle cx="220" cy="225" r="3" fill="#A89070" opacity="0.6" />
        <circle cx="225" cy="235" r="3" fill="#A89070" opacity="0.6" />
      </g>

      {/* Blossom at top - scales with scroll */}
      <g
        transform={`translate(200, ${500 - stemHeight}) scale(${blossomScale})`}
        style={{ transition: 'all 0.5s ease-out', transformOrigin: 'center' }}
      >
        {/* Flower petals */}
        <circle cx="0" cy="-20" r="12" fill="#F5E6D3" opacity="0.9" />
        <circle cx="15" cy="-10" r="12" fill="#F5E6D3" opacity="0.9" />
        <circle cx="15" cy="10" r="12" fill="#F5E6D3" opacity="0.9" />
        <circle cx="0" cy="20" r="12" fill="#F5E6D3" opacity="0.9" />
        <circle cx="-15" cy="10" r="12" fill="#F5E6D3" opacity="0.9" />
        <circle cx="-15" cy="-10" r="12" fill="#F5E6D3" opacity="0.9" />

        {/* Center */}
        <circle cx="0" cy="0" r="8" fill="#C4A77D" />
      </g>
    </svg>
  );
};

// Simplified logo version for final transformation
const TribeWellLogo = ({ opacity }: { opacity: number }) => (
  <div
    className="transition-opacity duration-1000"
    style={{ opacity }}
  >
    <img
      src="/logo.jpeg"
      alt="TribeWellMD"
      className="w-32 h-32 rounded-3xl shadow-2xl mx-auto"
    />
  </div>
);

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);

  // Track scroll for ʻUlu growth animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Calculate overall scroll progress (0 to 1)
      const progress = scrollY / (documentHeight - windowHeight);
      setScrollProgress(progress);

      // Show logo when reaching final section
      if (finalRef.current) {
        const finalRect = finalRef.current.getBoundingClientRect();
        setShowLogo(finalRect.top < windowHeight * 0.6);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] dark:bg-slate-900">
      <Header />

      <main className="flex-1">
        {/* Hero Section with ʻUlu Plant */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-[#F5F0E8] to-[#EBE4D8] dark:from-slate-900 dark:via-slate-800 dark:to-slate-700"
        >
          {/* Background ambient shapes */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#C4A77D] rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5B7B6D] rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Messaging */}
              <div className="text-center lg:text-left">
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  Health is a journey,
                  <br />
                  <span className="text-[#556B5E] dark:text-[#5B7B6D]">
                    not a destination
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl">
                  A proactive wellness ecosystem for medical professionals—supporting you at every stage.
                </p>

                <Link
                  href="/register"
                  className="inline-block px-10 py-5 bg-[#556B5E] hover:bg-[#2D5A4A] text-white text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
                >
                  Begin Your Journey
                </Link>

                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                  For pre-med students, medical students, residents, and attendings
                </p>
              </div>

              {/* Right: ʻUlu Plant Visual */}
              <div className="flex items-center justify-center">
                <UluPlant scrollProgress={scrollProgress} />
              </div>
            </div>
          </div>
        </section>

        {/* Journey Philosophy */}
        <section className="bg-white dark:bg-slate-900 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8">
              Proactive, Not Reactive
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* NOT This */}
              <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                <div className="text-4xl mb-4 opacity-50">✕</div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
                  Waiting for Crisis
                </h3>
                <ul className="text-left space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>Addressing burnout after it happens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>Survival mode as the default</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>Generic wellness advice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>Crisis-driven interventions</span>
                  </li>
                </ul>
              </div>

              {/* YES This */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#5B7B6D] to-[#2D5A4A] text-white border-2 border-[#5B7B6D] shadow-xl">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="font-semibold text-lg mb-4">
                  Supporting the Journey
                </h3>
                <ul className="text-left space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Prevention before problems arise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Sustainable success at every stage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Built by and for medical professionals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Growth-focused support system</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-xl text-slate-600 dark:text-slate-300 italic">
              We don't wait for burnout. We walk with you.
            </p>
          </div>
        </section>

        {/* Who This Is For - Journey Stages */}
        <section className="bg-[#F5F0E8] dark:bg-slate-800 py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Wherever You Are in Your Journey
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Each stage brings unique challenges. You deserve support designed for where you are.
              </p>
            </div>

            <div className="space-y-6">
              {/* Pre-Med */}
              <div className="group p-8 rounded-2xl bg-white dark:bg-slate-700 hover:shadow-2xl transition-all duration-300 border-l-4 border-[#C4A77D]">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-[#C4A77D]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pre-Med Students</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg">
                      Building the foundation. You're navigating prerequisites, MCAT prep, and applications while wondering if you can sustain this pace. Start with habits that will carry you through decades of medicine.
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Students */}
              <div className="group p-8 rounded-2xl bg-white dark:bg-slate-700 hover:shadow-2xl transition-all duration-300 border-l-4 border-[#5B7B6D]">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-[#5B7B6D]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Medical Students</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg">
                      Finding your identity. Between boards, rotations, and residency applications, you're learning who you want to become. Maintain your well-being while mastering your craft.
                    </p>
                  </div>
                </div>
              </div>

              {/* Residents & Fellows */}
              <div className="group p-8 rounded-2xl bg-white dark:bg-slate-700 hover:shadow-2xl transition-all duration-300 border-l-4 border-[#A89070]">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-[#A89070]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[#A89070]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Residents & Fellows</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg">
                      In the deep work. The hours are long, the stakes are real, and self-care feels impossible. You need systems that work with your reality, not against it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Attending Physicians */}
              <div className="group p-8 rounded-2xl bg-white dark:bg-slate-700 hover:shadow-2xl transition-all duration-300 border-l-4 border-[#556B5E]">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-[#556B5E]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[#556B5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Attending Physicians</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg">
                      Leading and sustaining. You've made it, but the journey continues. Maintain longevity, mentor the next generation, and model sustainable excellence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Support You */}
        <section className="bg-white dark:bg-slate-900 py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                How TribeWellMD Supports You
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                A complete ecosystem designed to grow with you—preventive, personalized, and built for the long haul.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Personalized Guidance */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#C4A77D] to-[#A89070] flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Personalized Guidance
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Adaptive tools that meet you where you are in your journey
                </p>
              </div>

              {/* Evidence-Based */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#5B7B6D] to-[#2D5A4A] flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Evidence-Based
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Grounded in learning science and wellness research
                </p>
              </div>

              {/* Community Connection */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#A89070] to-[#8B7355] flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Community Connection
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Connect with peers and mentors who understand your path
                </p>
              </div>

              {/* Long-Term Focus */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#556B5E] to-[#2D5A4A] flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Long-Term Focus
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Building sustainable practices for a lifelong career
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Credibility */}
        <section className="bg-gradient-to-br from-[#F5F0E8] to-[#EBE4D8] dark:from-slate-800 dark:to-slate-700 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12">
              Built for Physicians, by People Who Understand Medicine
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl bg-white/60 dark:bg-slate-900/40 backdrop-blur">
                <div className="text-3xl font-bold text-[#556B5E] dark:text-[#5B7B6D] mb-2">
                  Physician-Informed
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Designed with input from medical professionals at every level
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white/60 dark:bg-slate-900/40 backdrop-blur">
                <div className="text-3xl font-bold text-[#556B5E] dark:text-[#5B7B6D] mb-2">
                  Evidence-Based
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Grounded in learning science and wellness research
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white/60 dark:bg-slate-900/40 backdrop-blur">
                <div className="text-3xl font-bold text-[#556B5E] dark:text-[#5B7B6D] mb-2">
                  Privacy-First
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Your wellness journey is yours—secure and confidential
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final Transformation & CTA */}
        <section
          ref={finalRef}
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-[#F5F0E8] to-[#EBE4D8] dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-96 h-96 bg-[#5B7B6D] rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            {/* ʻUlu transforms to logo */}
            <div className="mb-12 relative h-64 flex items-center justify-center">
              {!showLogo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <UluPlant scrollProgress={0.8} />
                </div>
              )}
              {showLogo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <TribeWellLogo opacity={1} />
                </div>
              )}
            </div>

            <h2 className="font-serif text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Your journey starts here
            </h2>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
              Join a community that believes wellness is not an afterthought—it's the foundation of sustainable excellence.
            </p>

            <Link
              href="/register"
              className="inline-block px-12 py-6 bg-gradient-to-r from-[#556B5E] to-[#2D5A4A] hover:from-[#2D5A4A] hover:to-[#1A3D2F] text-white text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl"
            >
              Sign Up Now
            </Link>

            <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
              Free to start. No credit card required.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
