'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsAuthenticated } from '@/hooks/useAuth';

// Header for public pages (same as landing page header)
function PublicHeader() {
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
            <Link href="/" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${pathname === '/' ? 'bg-white/20 text-white shadow-soft' : 'text-white/80 hover:text-white hover:bg-white/10 transition-all'}`}>Home</Link>
            <Link href="/about" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${pathname === '/about' ? 'bg-white/20 text-white shadow-soft' : 'text-white/80 hover:text-white hover:bg-white/10 transition-all'}`}>About</Link>
            <Link href="/pricing" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${pathname === '/pricing' ? 'bg-white/20 text-white shadow-soft' : 'text-white/80 hover:text-white hover:bg-white/10 transition-all'}`}>Pricing</Link>
            <Link href="/investors" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${pathname === '/investors' ? 'bg-white/20 text-white shadow-soft' : 'text-white/80 hover:text-white hover:bg-white/10 transition-all'}`}>For Investors</Link>
            <Link href="/partners" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${pathname === '/partners' ? 'bg-white/20 text-white shadow-soft' : 'text-white/80 hover:text-white hover:bg-white/10 transition-all'}`}>For Partners</Link>
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
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${pathname === '/' ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Home</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${pathname === '/about' ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>About</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${pathname === '/pricing' ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Pricing</Link>
            <Link href="/investors" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${pathname === '/investors' ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>For Investors</Link>
            <Link href="/partners" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${pathname === '/partners' ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>For Partners</Link>
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

// Footer for public pages (same as landing page footer)
function PublicFooter() {
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

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#E8E0D5] to-[#D4C4B0] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <PublicHeader />

      {/* Main content with padding for fixed header/footer */}
      <main className="pt-12 pb-12 min-h-screen">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}

export default PublicPageLayout;
