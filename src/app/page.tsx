'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsAuthenticated } from '@/hooks/useAuth';

// CSS custom properties for header/footer heights
const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 48;

// Minimal landing page header - fixed at top
function LandingHeader() {
  const isAuthenticated = useIsAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-[#5B7B6D] dark:bg-[#3d5a4d] text-white shadow-lg">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href={isAuthenticated ? "/home" : "/"} className="flex items-center gap-1.5 group flex-shrink-0">
            <div className="w-7 h-7 rounded-lg shadow-soft group-hover:shadow-soft-md transition-shadow overflow-hidden">
              <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-white">Tribe</span>
              <span className="text-sm font-bold text-[#C4A77D]">Well</span>
              <span className="text-sm font-light text-white/80">MD</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 text-white shadow-soft">Home</Link>
            <Link href="/about" className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">About</Link>
            <Link href="/investors" className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">For Investors</Link>
            <Link href="/partners" className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">For Partners</Link>
          </nav>

          {/* Right side: Sign In only */}
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* Mobile hamburger menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-[#5B7B6D] dark:bg-[#3d5a4d]">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium bg-white/20 text-white">Home</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10">About</Link>
            <Link href="/investors" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10">For Investors</Link>
            <Link href="/partners" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10">For Partners</Link>
            <div className="pt-3 border-t border-white/20 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-4 py-2.5 text-center text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Minimal landing page footer - fixed at bottom
function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-12 bg-[#5B7B6D] dark:bg-[#3d5a4d] text-white shadow-lg">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left - Logo & Copyright */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg overflow-hidden">
                <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-white">TribeWellMD</span>
            </Link>
            <span className="hidden sm:inline text-white/40 text-xs">|</span>
            <span className="hidden sm:inline text-white/60 text-xs">&copy; {currentYear}</span>
          </div>

          {/* Center - Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
            <Link href="/about" className="text-white/70 hover:text-white transition-colors">About</Link>
            <Link href="/impact" className="text-white/70 hover:text-white transition-colors">Impact</Link>
            <Link href="/privacy" className="hidden sm:inline text-white/70 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hidden sm:inline text-white/70 hover:text-white transition-colors">Terms</Link>
            <a href="mailto:hello@tribewellmd.com" className="hidden md:inline text-white/70 hover:text-white transition-colors">Contact</a>
          </div>

          {/* Right - Social Icons */}
          <div className="flex items-center gap-1">
            <a href="https://twitter.com/tribewellmd" target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/70 hover:text-white" aria-label="Twitter">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="https://instagram.com/tribewellmd" target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/70 hover:text-white" aria-label="Instagram">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="https://linkedin.com/company/tribewellmd" target="_blank" rel="noopener noreferrer" className="hidden sm:flex w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 items-center justify-center transition-colors text-white/70 hover:text-white" aria-label="LinkedIn">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            <a href="https://youtube.com/@tribewellmd" target="_blank" rel="noopener noreferrer" className="hidden sm:flex w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 items-center justify-center transition-colors text-white/70 hover:text-white" aria-label="YouTube">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <LandingHeader />

      {/*
        HERO SECTION - Full bleed, normal document flow
        Structure per requirements:
        - position: relative (NOT fixed)
        - width: 100%
        - min-height: calc(100vh - header - footer)
        - margin: 0, padding: 0
        - overflow: hidden
        - Video/img: position absolute, inset 0, object-fit cover
      */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
          marginTop: HEADER_HEIGHT,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Video Background - absolute positioned within hero */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src="https://6mx4ugktbhpecq60.public.blob.vercel-storage.com/Untitled%20design.mp4" type="video/mp4" />
        </video>

        {/* Overlay for text contrast */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.3), rgba(0,0,0,0.4))',
          }}
        />

        {/* Hero Content - Centered CTA */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
            textAlign: 'center',
            padding: '0 16px',
          }}
        >
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Connection with <span className="text-[#A8C5B8]">purpose</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg max-w-2xl">
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

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Main content - white section that scrolls normally */}
      <main>
        {/* Section 2: How TribeWellMD Supports You */}
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

        {/* Bottom padding to account for fixed footer */}
        <div className="h-12 bg-white" />
      </main>

      {/* Fixed Footer */}
      <LandingFooter />
    </div>
  );
}
