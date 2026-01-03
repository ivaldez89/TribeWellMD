'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsAuthenticated } from '@/hooks/useAuth';

// Height constant for layout calculations
export const HEADER_HEIGHT = 48;

export function LandingHeader() {
  const isAuthenticated = useIsAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-landing-header text-white shadow-lg">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href={isAuthenticated ? "/home" : "/"} className="flex items-center gap-1.5 group flex-shrink-0">
            <div className="w-7 h-7 rounded-lg shadow-soft group-hover:shadow-soft-md transition-shadow overflow-hidden">
              <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-white">Tribe</span>
              <span className="text-sm font-bold text-landing-logo-accent">Well</span>
              <span className="text-sm font-light text-white/80">MD</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 text-white shadow-soft">Home</Link>
            <Link href="/about" className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">About</Link>
            <Link href="/pricing" className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">Pricing</Link>
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
        <div className="md:hidden border-t border-white/20 bg-landing-header">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium bg-white/20 text-white">Home</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10">About</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10">Pricing</Link>
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
