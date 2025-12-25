'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ForestThemeToggle } from '@/components/theme/ThemeProvider';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { useIsAuthenticated } from '@/hooks/useAuth';

/**
 * Header Component
 *
 * Uses SEMANTIC color tokens - no hardcoded hex values.
 * All colors reference CSS variables via Tailwind classes.
 */

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
          ? 'bg-white/20 text-primary-foreground shadow-soft dark:bg-white/20 dark:text-white'
          : 'text-content-secondary dark:text-primary-foreground/80 hover:text-primary dark:hover:text-white hover:bg-primary-light dark:hover:bg-white/10'
        }
      `}
    >
      {children}
    </Link>
  );
}

interface IconNavLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  matchPrefix?: boolean;
}

function IconNavLink({ href, label, icon, activeIcon, matchPrefix }: IconNavLinkProps) {
  const pathname = usePathname();
  const isActive = matchPrefix
    ? pathname === href || pathname.startsWith(href + '/') || pathname.startsWith(href + '?')
    : pathname === href;

  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center justify-center px-5 py-1 min-w-[60px]"
    >
      {/* Hover background */}
      <div className={`
        absolute inset-x-1 inset-y-0 rounded-xl transition-all duration-200
        ${isActive
          ? 'bg-transparent'
          : 'group-hover:bg-primary-light dark:group-hover:bg-white/10'
        }
      `} />

      {/* Icon */}
      <div className={`
        relative z-10 w-7 h-7 flex items-center justify-center transition-colors duration-200
        ${isActive
          ? 'text-primary dark:text-white'
          : 'text-content-muted dark:text-primary-foreground/70 group-hover:text-primary dark:group-hover:text-white'
        }
      `}>
        {isActive && activeIcon ? activeIcon : icon}
      </div>

      {/* Label - only shows on hover */}
      <span className="relative z-10 text-[10px] font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto group-hover:mt-0.5 text-primary dark:text-white">
        {label}
      </span>
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
            ? 'bg-primary text-primary-foreground shadow-soft'
            : 'text-content-secondary hover:text-primary hover:bg-primary-light'
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
          <div className="bg-surface rounded-xl shadow-soft-lg border border-border-light py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 border-l-2 border-transparent hover:border-primary hover:bg-primary-light transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <span className="block text-sm font-medium text-content">{item.label}</span>
                {item.description && (
                  <span className="block text-xs text-content-muted mt-0.5">{item.description}</span>
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
  { label: 'Flashcards', href: '/progress', description: 'Study sessions & Pomodoro timer' },
  { label: 'Study Rooms', href: '/progress/rooms', description: 'Collaborative study with chat & timers' },
  { label: 'Clinical Cases', href: '/cases', description: 'Interactive patient scenarios' },
  { label: 'AI Generator', href: '/generate', description: 'Create flashcards with AI' },
  { label: 'Rapid Review', href: '/progress/rapid-review', description: 'Quick concept review' },
  { label: 'Card Library', href: '/library', description: 'QBank-linked cards' },
  { label: 'Resources', href: '/resources', description: 'Visual guides & infographics' },
];

const toolsDropdownItems: DropdownItem[] = [
  { label: 'Dashboard', href: '/dashboard', description: 'Your unified calendar & tasks hub' },
];

const wellnessDropdownItems: DropdownItem[] = [
  { label: 'Wellness Hub', href: '/wellness', description: 'Your wellness center' },
  { label: 'My Journey', href: '/wellness?tab=journey', description: 'Daily challenges & wellness journeys' },
  { label: 'Social Skills', href: '/wellness?tab=skills', description: 'Build interpersonal skills' },
  { label: 'Village Points', href: '/wellness?tab=impact', description: 'Donate points to causes' },
];

const communityDropdownItems: DropdownItem[] = [
  { label: 'My Village', href: '/village', description: 'Your charity community' },
  { label: 'Connections', href: '/connections', description: 'Build meaningful relationships' },
  { label: 'My Impact', href: '/my-impact', description: 'Track your charitable contributions' },
  { label: 'My Groups', href: '/groups', description: 'Your interest communities' },
  { label: 'PreMed', href: '/premed', description: 'Resources for pre-med students' },
  { label: 'How It Works', href: '/impact', description: 'Village Points & charitable giving' },
  { label: 'Find Charities', href: '/impact/local', description: 'Discover local nonprofits' },
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
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface dark:bg-primary backdrop-blur-md border-b border-border-light shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/home" : "/"} className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-soft group-hover:shadow-soft-md transition-shadow overflow-hidden">
              <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-base sm:text-xl font-bold text-content dark:text-primary-foreground">Tribe</span>
              <span className="text-base sm:text-xl font-bold text-primary dark:text-white">Well</span>
              <span className="text-base sm:text-xl font-light text-info dark:text-primary-foreground">MD</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Home */}
                <IconNavLink
                  href="/home"
                  label="Home"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  }
                  activeIcon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                    </svg>
                  }
                />
                {/* Flashcards */}
                <IconNavLink
                  href="/flashcards"
                  label="Flashcards"
                  matchPrefix
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  }
                  activeIcon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                    </svg>
                  }
                />
                {/* Tools */}
                <IconNavLink
                  href="/tasks"
                  label="Tools"
                  matchPrefix
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                    </svg>
                  }
                  activeIcon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" />
                    </svg>
                  }
                />
                {/* Wellness */}
                <IconNavLink
                  href="/wellness"
                  label="Wellness"
                  matchPrefix
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  }
                  activeIcon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  }
                />
                {/* Community */}
                <IconNavLink
                  href="/village"
                  label="Community"
                  matchPrefix
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  }
                  activeIcon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                      <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                    </svg>
                  }
                />
              </>
            ) : (
              <>
                <NavLink href="/">Home</NavLink>
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

            {/* Forest Theme Demo Toggle */}
            <ForestThemeToggle />

            {/* Stats Badge - only when authenticated */}
            {isAuthenticated && stats && stats.dueToday > 0 && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-warning-light dark:bg-white/20 border border-warning dark:border-white/30 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning dark:bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-warning dark:bg-white"></span>
                  </span>
                  <span className="text-sm font-medium text-content-secondary dark:text-primary-foreground">
                    {stats.dueToday} due
                  </span>
                </div>

                <Link
                  href="/flashcards"
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-primary dark:bg-white/20 text-primary-foreground shadow-soft hover:shadow-soft-md transition-shadow"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </>
            )}

            {/* Show Profile Dropdown when authenticated, Login/Register when not */}
            {isAuthenticated === null ? (
              <div className="w-9 h-9" />
            ) : isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-content-secondary dark:text-primary-foreground/80 hover:text-primary dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary dark:bg-white dark:text-primary hover:bg-primary-hover dark:hover:bg-white/90 rounded-lg shadow-soft hover:shadow-soft-md transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-content-secondary dark:text-primary-foreground hover:bg-surface-muted dark:hover:bg-white/10 transition-colors"
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
        <div className="md:hidden border-t border-border-light dark:border-white/20 bg-surface dark:bg-primary">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <MobileNavLink href="/home" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>

                {/* Study Section */}
                <div className="pt-2 border-t border-border-light dark:border-white/20">
                  <p className="px-4 py-1 text-xs font-semibold text-content-muted dark:text-primary-foreground/60 uppercase tracking-wider">Study</p>
                  <MobileNavLink href="/flashcards" onClick={() => setMobileMenuOpen(false)}>Flashcards</MobileNavLink>
                  <MobileNavLink href="/cases" onClick={() => setMobileMenuOpen(false)}>Clinical Cases</MobileNavLink>
                  <MobileNavLink href="/generate" onClick={() => setMobileMenuOpen(false)}>AI Generator</MobileNavLink>
                  <MobileNavLink href="/import" onClick={() => setMobileMenuOpen(false)}>Import Cards</MobileNavLink>
                </div>

                {/* Tools Section */}
                <div className="pt-2 border-t border-border-light dark:border-white/20">
                  <p className="px-4 py-1 text-xs font-semibold text-content-muted dark:text-primary-foreground/60 uppercase tracking-wider">Tools</p>
                  <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                </div>

                {/* Wellness Section */}
                <div className="pt-2 border-t border-border-light dark:border-white/20">
                  <p className="px-4 py-1 text-xs font-semibold text-content-muted dark:text-primary-foreground/60 uppercase tracking-wider">Wellness</p>
                  <MobileNavLink href="/wellness" onClick={() => setMobileMenuOpen(false)}>Wellness Hub</MobileNavLink>
                  <MobileNavLink href="/wellness?tab=journey" onClick={() => setMobileMenuOpen(false)}>My Journey</MobileNavLink>
                  <MobileNavLink href="/wellness?tab=skills" onClick={() => setMobileMenuOpen(false)}>Social Skills</MobileNavLink>
                </div>

                {/* Community Section */}
                <div className="pt-2 border-t border-border-light dark:border-white/20">
                  <p className="px-4 py-1 text-xs font-semibold text-content-muted dark:text-primary-foreground/60 uppercase tracking-wider">Community</p>
                  <MobileNavLink href="/village" onClick={() => setMobileMenuOpen(false)}>My Village</MobileNavLink>
                  <MobileNavLink href="/connections" onClick={() => setMobileMenuOpen(false)}>Connections</MobileNavLink>
                  <MobileNavLink href="/my-impact" onClick={() => setMobileMenuOpen(false)}>My Impact</MobileNavLink>
                  <MobileNavLink href="/groups" onClick={() => setMobileMenuOpen(false)}>My Groups</MobileNavLink>
                  <MobileNavLink href="/premed" onClick={() => setMobileMenuOpen(false)}>PreMed</MobileNavLink>
                  <MobileNavLink href="/impact" onClick={() => setMobileMenuOpen(false)}>How It Works</MobileNavLink>
                  <MobileNavLink href="/impact/local" onClick={() => setMobileMenuOpen(false)}>Find Charities</MobileNavLink>
                </div>
              </>
            ) : (
              <>
                <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
                <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileNavLink>
                <MobileNavLink href="/investors" onClick={() => setMobileMenuOpen(false)}>For Investors</MobileNavLink>
                <MobileNavLink href="/partners" onClick={() => setMobileMenuOpen(false)}>For Partners</MobileNavLink>
                <div className="pt-4 border-t border-border dark:border-white/20 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-sm font-medium text-content-secondary dark:text-primary-foreground border border-border dark:border-white/30 rounded-lg hover:bg-surface-muted dark:hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-sm font-medium text-primary-foreground dark:text-primary bg-primary dark:bg-white hover:bg-primary-hover dark:hover:bg-white/90 rounded-lg shadow-soft transition-all"
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
    {/* Spacer to prevent content from hiding behind fixed header */}
    <div className="h-16" />
    </>
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
          ? 'bg-primary dark:bg-white/20 text-primary-foreground'
          : 'text-content dark:text-primary-foreground hover:bg-primary-light dark:hover:bg-white/10'
        }
      `}
    >
      {children}
    </Link>
  );
}
