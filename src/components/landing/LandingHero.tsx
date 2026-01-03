'use client';

import Link from 'next/link';
import { HEADER_HEIGHT, FOOTER_HEIGHT } from '@/components/layout/LandingLayout';

const VIDEO_URL = 'https://6mx4ugktbhpecq60.public.blob.vercel-storage.com/Untitled%20design.mp4';

export function LandingHero() {
  return (
    <section className="relative w-full min-h-screen m-0 p-0 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Overlay for text contrast */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/50 via-black/40 to-black/50" />

      {/* Hero Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 sm:px-8"
        style={{ paddingTop: HEADER_HEIGHT, paddingBottom: FOOTER_HEIGHT }}
      >
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl max-w-4xl">
          Study smart. Stay well. <span className="text-landing-hero-accent">Together.</span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 drop-shadow-lg max-w-2xl leading-relaxed">
          One place where your learning and well-being reinforce each other.
          <br className="hidden sm:block" />
          <span className="text-base sm:text-lg mt-2 block text-white/80">No more choosing. No more guilt.</span>
        </p>

        <Link
          href="/register"
          className="inline-block px-8 sm:px-10 py-4 sm:py-5 bg-white hover:bg-white/95 text-primary text-base sm:text-lg font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-xl shadow-lg"
        >
          Begin Your Journey
        </Link>

        <p className="mt-4 sm:mt-6 text-sm text-white/60">
          For medical students, residents, and attendings
        </p>

        {/* Scroll indicator - subtle pulse, not distracting */}
        <div
          className="absolute left-1/2 -translate-x-1/2 opacity-40 hover:opacity-60 transition-opacity"
          style={{ bottom: FOOTER_HEIGHT + 16 }}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
