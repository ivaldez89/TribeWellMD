'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

// Core values data
const coreValues = [
  {
    number: '01',
    title: 'Evidence Over Opinion',
    description: 'Every feature is grounded in peer-reviewed research. We build on what science proves works.',
    gradient: 'from-[#5B7B6D] to-[#6B8B7D]',
  },
  {
    number: '02',
    title: 'Community First',
    description: 'We design for collective benefit. Individual success is a stepping stone to community thriving.',
    gradient: 'from-[#8B7355] to-[#A89070]',
  },
  {
    number: '03',
    title: 'Sustainable Growth',
    description: 'No shortcuts, no burnout culture. We optimize for long-term wellbeing, not short-term metrics.',
    gradient: 'from-[#7FA08F] to-[#5B7B6D]',
  },
  {
    number: '04',
    title: 'Radical Transparency',
    description: 'Users know exactly how points convert, where donations go, and how the platform works.',
    gradient: 'from-[#6B8B7D] to-[#7FA08F]',
  },
  {
    number: '05',
    title: 'Purpose-Driven',
    description: 'Every action on the platform can create real-world impact. Progress becomes meaningful.',
    gradient: 'from-[#A89070] to-[#C4A77D]',
  },
];

export default function AboutPage() {
  // Scroll animation refs
  const philosophyRef = useRef<HTMLDivElement>(null);
  const theoryRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const cycleRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);

  const [philosophyVisible, setPhilosophyVisible] = useState(false);
  const [theoryVisible, setTheoryVisible] = useState(false);
  const [valuesVisible, setValuesVisible] = useState(false);
  const [cycleVisible, setCycleVisible] = useState(false);
  const [impactVisible, setImpactVisible] = useState(false);

  // Carousel state
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);


  // Navigate to next/previous card
  const goToCard = useCallback((index: number) => {
    const newIndex = ((index % coreValues.length) + coreValues.length) % coreValues.length;
    setActiveIndex(newIndex);
    // Scroll the card into view
    if (cardRefs.current[newIndex]) {
      cardRefs.current[newIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (isPaused || !valuesVisible) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const newIndex = (prev + 1) % coreValues.length;
        // Scroll to the new card
        setTimeout(() => {
          if (cardRefs.current[newIndex]) {
            cardRefs.current[newIndex]?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center',
            });
          }
        }, 50);
        return newIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, valuesVisible]);


  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === philosophyRef.current) setPhilosophyVisible(true);
          if (entry.target === theoryRef.current) setTheoryVisible(true);
          if (entry.target === valuesRef.current) setValuesVisible(true);
          if (entry.target === cycleRef.current) setCycleVisible(true);
          if (entry.target === impactRef.current) setImpactVisible(true);
        }
      });
    }, observerOptions);

    if (philosophyRef.current) observer.observe(philosophyRef.current);
    if (theoryRef.current) observer.observe(theoryRef.current);
    if (valuesRef.current) observer.observe(valuesRef.current);
    if (cycleRef.current) observer.observe(cycleRef.current);
    if (impactRef.current) observer.observe(impactRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />

      <main>
        {/* Hero Section - Clean White (matching Homepage) */}
        <section className="bg-white dark:bg-slate-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Born From Experience.
              <br />
              <span className="text-shimmer">Built for Change.</span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10">
              TribeWellMD was founded by physicians who lived the paradox: training to heal others while watching themselves and colleagues struggle with burnout, isolation, and a system that treats wellness as an afterthought.
            </p>

            <blockquote className="max-w-2xl mx-auto bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-[#D4C4B0] dark:border-slate-600">
              <p className="text-lg text-slate-700 dark:text-slate-200 italic mb-3">
                &ldquo;We kept asking ourselves: why does becoming a doctor require sacrificing your own health? What if the same tools that help us learn could help us thrive?&rdquo;
              </p>
              <cite className="text-sm text-slate-500 dark:text-slate-400 not-italic">
                — TribeWellMD Founding Team
              </cite>
            </blockquote>
          </div>
        </section>

        {/* Philosophy Quote */}
        <section className="bg-white dark:bg-slate-900" ref={philosophyRef}>
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center transition-all duration-700 ${philosophyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#E8E0D5] to-[#D4C4B0] dark:from-[#C4A77D]/20 dark:to-[#A89070]/20 flex items-center justify-center text-[#8B7355] dark:text-[#C4A77D]">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <blockquote className="text-2xl md:text-3xl font-serif text-slate-800 dark:text-slate-200 max-w-4xl mx-auto mb-6 leading-relaxed">
              &ldquo;Most people believe <span className="text-[#5B7B6D] dark:text-[#7FA08F] font-semibold">individualism</span> and{' '}
              <span className="text-[#8B7355] dark:text-[#C4A77D] font-semibold">community</span> are mutually exclusive.{' '}
              <br className="hidden md:block" />
              Our mission is to show they are{' '}
              <span className="bg-gradient-to-r from-[#5B7B6D] to-[#C4A77D] bg-clip-text text-transparent font-bold">
                mutually reinforcing
              </span>.&rdquo;
            </blockquote>
            <p className="text-slate-500 dark:text-slate-400 italic">
              — TribeWellMD Philosophy
            </p>
          </div>
        </section>

        {/* Theory of Change - Academic Framework */}
        <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700" ref={theoryRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className={`text-center mb-12 transition-all duration-700 ${theoryVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="text-sm font-semibold text-[#8B7355] dark:text-[#C4A77D] uppercase tracking-wider">Evidence-Based Approach</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                Theory of Change
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Our intervention model is grounded in behavioral science, social psychology, and medical education research.
              </p>
            </div>

            {/* Logic Model */}
            <div className={`bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 md:p-10 transition-all duration-700 delay-200 ${theoryVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="grid md:grid-cols-5 gap-4 md:gap-6">
                {/* Input */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-t-4 border-[#5B7B6D] shadow-lg">
                  <span className="text-xs font-bold text-[#5B7B6D] dark:text-[#7FA08F] uppercase tracking-wider">Inputs</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">Platform & Community</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>FSRS algorithm</li>
                    <li>Tribe networks</li>
                    <li>Wellness modules</li>
                    <li>Charity partners</li>
                  </ul>
                </div>

                {/* Activities */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-t-4 border-[#C4A77D] shadow-lg">
                  <span className="text-xs font-bold text-[#A89070] dark:text-[#C4A77D] uppercase tracking-wider">Activities</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">User Engagement</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Daily study sessions</li>
                    <li>Wellness check-ins</li>
                    <li>Peer interactions</li>
                    <li>Point accumulation</li>
                  </ul>
                </div>

                {/* Outputs */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-t-4 border-[#8B4A3C] shadow-lg">
                  <span className="text-xs font-bold text-[#8B4A3C] dark:text-[#C17C6B] uppercase tracking-wider">Outputs</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">Measurable Actions</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Cards reviewed</li>
                    <li>Habits completed</li>
                    <li>Connections made</li>
                    <li>Points donated</li>
                  </ul>
                </div>

                {/* Outcomes */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-t-4 border-[#5D6B5E] shadow-lg">
                  <span className="text-xs font-bold text-[#5D6B5E] dark:text-[#8FA090] uppercase tracking-wider">Outcomes</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">Individual Impact</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Better retention</li>
                    <li>Lower burnout</li>
                    <li>Stronger network</li>
                    <li>Sense of purpose</li>
                  </ul>
                </div>

                {/* Impact */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-t-4 border-[#2D5A4A] shadow-lg">
                  <span className="text-xs font-bold text-[#2D5A4A] dark:text-[#5B7B6D] uppercase tracking-wider">Impact</span>
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
            <div className={`mt-8 grid md:grid-cols-3 gap-6 transition-all duration-700 delay-400 ${theoryVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold text-[#5B7B6D] dark:text-[#7FA08F] mb-2">2.5x</div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Spaced repetition improves long-term retention by 2.5x compared to massed practice
                </p>
                <cite className="text-xs text-slate-500 dark:text-slate-500 mt-2 block">
                  Karpicke & Roediger, Science (2008)
                </cite>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold text-[#C4A77D] dark:text-[#D4B48D] mb-2">40%</div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Social support reduces burnout symptoms by up to 40% in healthcare workers
                </p>
                <cite className="text-xs text-slate-500 dark:text-slate-500 mt-2 block">
                  West et al., JAMA Internal Medicine (2016)
                </cite>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold text-[#8B4A3C] dark:text-[#C17C6B] mb-2">68%</div>
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

        {/* Core Values - Carousel */}
        <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 overflow-hidden" ref={valuesRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className={`text-center mb-12 transition-all duration-700 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="text-sm font-semibold text-[#8B7355] dark:text-[#C4A77D] uppercase tracking-wider">Guiding Principles</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                Core Values
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Five principles that guide every decision we make as we build TribeWellMD.
              </p>
            </div>

            {/* Carousel Container */}
            <div
              className={`relative transition-all duration-700 delay-200 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
            >
              {/* Navigation Arrows */}
              <button
                onClick={() => goToCard(activeIndex - 1)}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-110"
                aria-label="Previous value"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => goToCard(activeIndex + 1)}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-110"
                aria-label="Next value"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Cards Container with Featured Active Card */}
              <div
                className="flex items-center gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-12 md:px-20 py-6"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {coreValues.map((value, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={value.number}
                      ref={(el) => { cardRefs.current[index] = el; }}
                      onClick={() => goToCard(index)}
                      className={`flex-shrink-0 snap-center transition-all duration-500 ease-out cursor-pointer ${
                        isActive
                          ? 'w-[320px] md:w-[420px] scale-100 opacity-100'
                          : 'w-[200px] md:w-[240px] scale-90 opacity-40 hover:opacity-60'
                      }`}
                    >
                      <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 h-full transition-all duration-500 ${
                        isActive ? 'p-6 md:p-8 shadow-xl ring-2 ring-[#C4A77D]/30' : 'p-4 md:p-5'
                      }`}>
                        <div className={`rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white font-bold transition-all duration-500 ${
                          isActive ? 'w-14 h-14 md:w-16 md:h-16 text-xl md:text-2xl mb-4 md:mb-6' : 'w-10 h-10 md:w-12 md:h-12 text-lg mb-3'
                        }`}>
                          {value.number}
                        </div>
                        <h3 className={`font-bold text-slate-900 dark:text-white transition-all duration-500 ${
                          isActive ? 'text-xl md:text-2xl mb-3' : 'text-base md:text-lg mb-2'
                        }`}>{value.title}</h3>
                        <p className={`text-slate-600 dark:text-slate-400 leading-relaxed transition-all duration-500 ${
                          isActive ? 'text-base' : 'text-sm line-clamp-2'
                        }`}>
                          {value.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {coreValues.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToCard(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === activeIndex
                        ? 'w-8 h-2 bg-[#C4A77D]'
                        : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                    }`}
                    aria-label={`Go to value ${index + 1}`}
                  />
                ))}
              </div>

              {/* Auto-rotate indicator */}
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                {isPaused ? 'Paused' : 'Auto-rotating'} • Click cards or use arrows to navigate
              </p>
            </div>
          </div>
        </section>

        {/* The Virtuous Cycle - Core Philosophy */}
        <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-y border-slate-200 dark:border-slate-700" ref={cycleRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className={`text-center mb-12 transition-all duration-700 ${cycleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="text-sm font-semibold text-[#8B7355] dark:text-[#C4A77D] uppercase tracking-wider">Our Philosophy</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                The Virtuous Cycle
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
                Individual achievement and community wellbeing are not opposing forces—they are mutually reinforcing.
              </p>
            </div>

            {/* Three Pillar Cards - Staggered reveal with pastel hover glow */}
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
              {/* Card 1 - Sustained Behavior Change */}
              <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-t-4 border-[#5B7B6D] hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#5B7B6D]/20 dark:hover:shadow-[#5B7B6D]/10 transition-all duration-500 ${cycleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: cycleVisible ? '200ms' : '0ms' }}>
                <div className="w-12 h-12 mb-4 rounded-xl bg-[#E8F0ED] dark:bg-[#5B7B6D]/20 flex items-center justify-center text-[#5B7B6D] dark:text-[#7FA08F]">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h.01" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">Sustained Behavior Change</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                  Real growth comes from consistent, sustainable habits—not cramming or burning out. Evidence-based spaced repetition makes lasting change achievable.
                </p>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#5B7B6D] rounded-full"></span>
                    FSRS-powered spaced repetition
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#5B7B6D] rounded-full"></span>
                    Wellness tracking & habits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#5B7B6D] rounded-full"></span>
                    Progress visualization
                  </li>
                </ul>
              </div>

              {/* Card 2 - Guided Social Connection */}
              <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-t-4 border-[#C4A77D] hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#C4A77D]/20 dark:hover:shadow-[#C4A77D]/10 transition-all duration-500 ${cycleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: cycleVisible ? '350ms' : '0ms' }}>
                <div className="w-12 h-12 mb-4 rounded-xl bg-[#F5F0E8] dark:bg-[#C4A77D]/20 flex items-center justify-center text-[#A89070] dark:text-[#C4A77D]">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">Guided Social Connection</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                  Medicine does not have to be lonely. Connect with mentors who have walked your path and peers who understand your struggles.
                </p>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#C4A77D] rounded-full"></span>
                    Mentorship matching
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#C4A77D] rounded-full"></span>
                    Study groups & tribes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#C4A77D] rounded-full"></span>
                    Shared accountability
                  </li>
                </ul>
              </div>

              {/* Card 3 - Altruistic Contributions */}
              <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-t-4 border-[#8B4A3C] hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#8B4A3C]/20 dark:hover:shadow-[#8B4A3C]/10 transition-all duration-500 ${cycleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: cycleVisible ? '500ms' : '0ms' }}>
                <div className="w-12 h-12 mb-4 rounded-xl bg-[#F5E8E5] dark:bg-[#8B4A3C]/20 flex items-center justify-center text-[#8B4A3C] dark:text-[#C17C6B]">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">Altruistic Contributions</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                  Your achievements matter beyond your own success. Progress converts to real donations—giving creates purpose that fuels continued growth.
                </p>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#8B4A3C] rounded-full"></span>
                    Progress becomes donations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#8B4A3C] rounded-full"></span>
                    Community impact tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#8B4A3C] rounded-full"></span>
                    Purpose-driven motivation
                  </li>
                </ul>
              </div>
            </div>

            {/* The Cycle Explanation */}
            <div className={`mt-10 bg-gradient-to-r from-[#5B7B6D] to-[#2D5A4A] rounded-2xl p-6 md:p-8 text-white transition-all duration-700 ${cycleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: cycleVisible ? '650ms' : '0ms' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">How It Works Together</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    These three pillars are not separate—they reinforce each other. When you achieve your personal goals, you contribute to the community. When the community supports you, you are more likely to succeed. And when your success creates real-world impact through charitable giving, it creates meaning that drives you to keep growing.{' '}
                    <span className="font-semibold">Giving back creates meaning and purpose, which fuels continued personal growth.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Find Charities CTA */}
        <section className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Decorative elements */}
            <div className="relative inline-block mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#5B7B6D]/20 via-[#C4A77D]/20 to-[#5B7B6D]/20 blur-2xl rounded-full" />
              <div className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#5B7B6D] to-[#2D5A4A] flex items-center justify-center shadow-xl shadow-[#5B7B6D]/30">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Make Your Impact Local
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Discover verified charities in your community. Your Village Points can create real change right where you live and study.
            </p>

            {/* Main CTA Button */}
            <Link
              href="/impact/local"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#5B7B6D] via-[#4A6B5D] to-[#2D5A4A] hover:from-[#4A6B5D] hover:via-[#3D5E4D] hover:to-[#234A3A] text-white font-bold text-lg rounded-2xl shadow-xl shadow-[#5B7B6D]/30 hover:shadow-[#5B7B6D]/50 hover:scale-105 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Find Local Charities
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Inspirational Quote */}
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xl md:text-2xl font-serif italic text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
                &ldquo;Transform your medical journey into community purpose.&rdquo;
              </p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Every study session. Every wellness check-in. Every connection made.
              </p>
            </div>
          </div>
        </section>

        {/* Commitment to Impact */}
        <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900" ref={impactRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div>
                <span className="text-sm font-semibold text-[#8B7355] dark:text-[#C4A77D] uppercase tracking-wider">Our Commitment</span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-6">
                  Impact Over Profit
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                  Unlike traditional EdTech that optimizes for engagement metrics and ad revenue, TribeWellMD is structured to maximize positive outcomes for medical learners.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F0ED] dark:bg-[#5B7B6D]/20 flex items-center justify-center text-[#5B7B6D] dark:text-[#7FA08F] flex-shrink-0 mt-0.5">
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
                    <div className="w-8 h-8 rounded-lg bg-[#E8F0ED] dark:bg-[#5B7B6D]/20 flex items-center justify-center text-[#5B7B6D] dark:text-[#7FA08F] flex-shrink-0 mt-0.5">
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
                    <div className="w-8 h-8 rounded-lg bg-[#E8F0ED] dark:bg-[#5B7B6D]/20 flex items-center justify-center text-[#5B7B6D] dark:text-[#7FA08F] flex-shrink-0 mt-0.5">
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
              <div className="bg-gradient-to-br from-[#5B7B6D] to-[#2D5A4A] rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6">Our Vision for Impact</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">1M+</div>
                    <div className="text-[#D4C4B0] text-sm">Medical learners served</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">$10M+</div>
                    <div className="text-[#D4C4B0] text-sm">Charitable donations enabled</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">50%</div>
                    <div className="text-[#D4C4B0] text-sm">Reduction in reported burnout</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">100K+</div>
                    <div className="text-[#D4C4B0] text-sm">Meaningful peer connections</div>
                  </div>
                </div>
                <p className="mt-6 text-[#D4C4B0] text-sm italic text-center">
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
                  className="px-8 py-4 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-bold rounded-xl hover:from-[#B89B78] hover:to-[#9A8565] transition-all shadow-lg hover:scale-105"
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
