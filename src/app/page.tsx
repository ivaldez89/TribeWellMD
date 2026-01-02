'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Full-screen video background for plant evolution
const FullScreenVideoBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://6mx4ugktbhpecq60.public.blob.vercel-storage.com/Untitled%20design.mp4" type="video/mp4" />
      </video>
      {/* Overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      {/* Fixed Header - isLandingPage hides theme toggle and Get Started button */}
      <Header isLandingPage />

      {/* Main scrollable content area - between fixed header (h-12) and footer (h-12) */}
      <main className="flex-1">
        {/* Section 1: Hero - Full viewport height minus header and footer */}
        <section
          className="relative w-full overflow-hidden flex items-center justify-center"
          style={{ height: 'calc(100vh - 96px)' }}
        >
          {/* Full-bleed video background - no margins, no padding, edge-to-edge */}
          <FullScreenVideoBackground />

          {/* Hero Content - Centered CTA */}
          <div className="relative z-10 text-center px-4">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Connection with <span className="text-[#A8C5B8]">purpose</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg">
              Building well-being through every stage of your medical journey.
              <br />
              <span className="text-lg mt-2 block">For the realities of life in medicine</span>
            </p>

            <Link
              href="/register"
              className="inline-block px-10 py-5 bg-white hover:bg-white/90 text-[#556B5E] text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              Begin Your Journey
            </Link>

            <p className="mt-6 text-sm text-white/70">
              For medical students, residents, and attendings
            </p>
          </div>
        </section>

        {/* Section 2: How TribeWellMD Supports You - White content section */}
        <section className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                How TribeWellMD Supports You
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                A complete ecosystem designed to grow with you—preventive, personalized, and built for the long haul.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Personalized Guidance */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#9b87a3] to-[#7d6b85] flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Personalized Guidance
                </h3>
                <p className="text-slate-600">
                  Adaptive tools that meet you where you are in your journey
                </p>
              </div>

              {/* Evidence-Based */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#9b87a3] to-[#7d6b85] flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Evidence-Based
                </h3>
                <p className="text-slate-600">
                  Grounded in learning science and wellness research
                </p>
              </div>

              {/* Community Connection */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#9b87a3] to-[#7d6b85] flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Community Connection
                </h3>
                <p className="text-slate-600">
                  Connect with peers and mentors who understand your path
                </p>
              </div>

              {/* Long-Term Focus */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#9b87a3] to-[#7d6b85] flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Long-Term Focus
                </h3>
                <p className="text-slate-600">
                  Building sustainable practices for a lifelong career
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Footer */}
      <Footer />
    </div>
  );
}
