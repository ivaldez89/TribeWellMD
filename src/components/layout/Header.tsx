'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeProvider';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { useIsAuthenticated } from '@/hooks/useAuth';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ href, children, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-emerald-600 text-white shadow-md'
          : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        }
      `}
    >
      {children}
    </Link>
  );
}

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface NavDropdownProps {
  label: string;
  href: string;
  items: DropdownItem[];
}

function NavDropdown({ label, href, items }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className={`
          flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${isActive
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
          }
        `}
      >
        {label}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>

      {isOpen && (
        <div className="absolute top-full left-0 pt-1 w-64 z-[110]">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 border-l-2 border-transparent hover:border-teal-500 hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent dark:hover:from-teal-900/20 dark:hover:to-transparent transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <span className="block text-sm font-medium text-slate-900 dark:text-white">{item.label}</span>
                {item.description && (
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Dropdown menu configurations
const studyDropdownItems: DropdownItem[] = [
  { label: 'Clinical Cases', href: '/cases', description: 'Interactive patient scenarios' },
  { label: 'Rapid Review', href: '/study/rapid-review', description: 'Quick concept review' },
  { label: 'Progress', href: '/study/progress', description: 'Track your learning' },
  { label: 'Card Library', href: '/library', description: 'QBank-linked cards' },
  { label: 'Resources', href: '/resources', description: 'Visual guides & infographics' },
];

const wellnessDropdownItems: DropdownItem[] = [
  { label: 'My Journey', href: '/wellness?tab=journey', description: 'Daily challenges & wellness journeys' },
  { label: 'Social Skills', href: '/wellness?tab=skills', description: 'App-taught interpersonal skills' },
  { label: 'Social Impact', href: '/wellness?tab=impact', description: 'Donate points to causes' },
];

const communityDropdownItems: DropdownItem[] = [
  { label: 'Tribes', href: '/tribes', description: 'Join group communities' },
  { label: 'PreMed', href: '/premed', description: 'Resources for pre-med students' },
];

interface HeaderProps {
  stats?: {
    dueToday: number;
    totalCards: number;
  };
}

export function Header({ stats }: HeaderProps) {
  const isAuthenticated = useIsAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  const pathname = usePathname();
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 backdrop-blur-md border-b border-teal-100 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-shadow overflow-hidden">
              <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-slate-900 dark:text-white">Tribe</span>
              <span className="text-xl font-bold text-teal-600 dark:text-teal-400">Well</span>
              <span className="text-xl font-light text-indigo-600 dark:text-indigo-400">MD</span>
            </div>
          </Link>

          {/* Navigation - different for logged in vs logged out */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            {isAuthenticated ? (
              <>
                <NavDropdown label="Study" href="/study" items={studyDropdownItems} />
                <NavDropdown label="Wellness" href="/wellness" items={wellnessDropdownItems} />
                <NavDropdown label="Community" href="/community" items={communityDropdownItems} />
              </>
            ) : (
              <>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/investors">For Investors</NavLink>
                <NavLink href="/partners">For Partners</NavLink>
              </>
            )}
          </nav>

          {/* Right side: Streak, Theme toggle, Stats & Profile/Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Only show streak counter when authenticated */}
            {isAuthenticated && <StreakCounter variant="compact" />}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Stats Badge - only when authenticated */}
            {isAuthenticated && stats && stats.dueToday > 0 && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {stats.dueToday} due
                  </span>
                </div>

                <Link
                  href="/study/flashcards"
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </>
            )}

            {/* Show Profile Dropdown when authenticated, Login/Register when not */}
            {isAuthenticated === null ? (
              // Loading state - show nothing to prevent flash
              <div className="w-9 h-9" />
            ) : isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-lg shadow-md shadow-teal-500/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        <div className="md:hidden border-t border-teal-100 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
                <MobileNavLink href="/study" onClick={() => setMobileMenuOpen(false)}>Study</MobileNavLink>
                <MobileNavLink href="/cases" onClick={() => setMobileMenuOpen(false)}>Clinical Cases</MobileNavLink>
                <MobileNavLink href="/library" onClick={() => setMobileMenuOpen(false)}>Card Library</MobileNavLink>
                <MobileNavLink href="/wellness" onClick={() => setMobileMenuOpen(false)}>Wellness</MobileNavLink>
                <MobileNavLink href="/tribes" onClick={() => setMobileMenuOpen(false)}>Tribes</MobileNavLink>
                <MobileNavLink href="/community" onClick={() => setMobileMenuOpen(false)}>Community</MobileNavLink>
              </>
            ) : (
              <>
                <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
                <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileNavLink>
                <MobileNavLink href="/investors" onClick={() => setMobileMenuOpen(false)}>For Investors</MobileNavLink>
                <MobileNavLink href="/partners" onClick={() => setMobileMenuOpen(false)}>For Partners</MobileNavLink>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-lg shadow-md transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// Mobile navigation link component
function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-emerald-600 text-white'
          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }
      `}
    >
      {children}
    </Link>
  );
}
