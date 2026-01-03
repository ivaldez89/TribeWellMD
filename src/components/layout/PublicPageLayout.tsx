'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { ThemeToggleSimple } from '@/components/theme/ThemeProvider';
import { Footer } from './Footer';

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

          {/* Right side: Theme toggle + Sign In */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle */}
            <ThemeToggleSimple variant="greenHeader" />

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

      <Footer />
    </div>
  );
}

export default PublicPageLayout;
