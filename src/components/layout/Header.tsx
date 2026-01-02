'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggleSimple } from '@/components/theme/ThemeProvider';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { useIsAuthenticated, signOut as legacySignOut } from '@/hooks/useAuth';
import { signOut as supabaseSignOut } from '@/lib/supabase/auth';
import { PomodoroTimer } from '@/components/study/PomodoroTimer';
import { LabReferencePanel } from '@/components/study/LabReferencePanel';
import { MessengerPanel } from '@/components/chat/ChatBubble';
import { MusicPanel } from '@/components/panels/MusicPanel';

// Panel types for unified state management
// NOTE: Scene panel is NOT included here - it's only available in StudyLayout
type PanelType = 'labs' | 'messages' | 'music' | null;

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
        px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-white/20 text-white shadow-soft'
          : 'text-white/80 hover:text-white hover:bg-white/10'
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
      className="group relative flex flex-col items-center justify-center px-3 py-0.5 min-w-[50px]"
    >
      {/* Hover background */}
      <div className={`
        absolute inset-x-1 inset-y-0 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-white/20'
          : 'group-hover:bg-white/10'
        }
      `} />

      {/* Icon */}
      <div className={`
        relative z-10 w-5 h-5 flex items-center justify-center transition-colors duration-200
        ${isActive
          ? 'text-white'
          : 'text-white/70 group-hover:text-white'
        }
      `}>
        {isActive && activeIcon ? activeIcon : icon}
      </div>

      {/* Label - only shows on hover */}
      <span className="relative z-10 text-[9px] font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto text-white">
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
  { label: 'QBank', href: '/qbank', description: 'Practice question bank' },
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
  /** Hide theme toggle and Get Started button (for landing page) */
  isLandingPage?: boolean;
}

export function Header({ stats, isLandingPage = false }: HeaderProps) {
  const isAuthenticated = useIsAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  // Unified panel state - only one panel can be open at a time
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  // Toggle a panel (closes others, toggles if same)
  const togglePanel = (panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  // Close any open panel
  const closePanel = () => setActivePanel(null);

  // Close mobile menu and panels when route changes
  const pathname = usePathname();
  useEffect(() => {
    setMobileMenuOpen(false);
    setActivePanel(null);
    setAccountMenuOpen(false);
  }, [pathname]);

  // Handle sign out
  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    legacySignOut();
    await supabaseSignOut();
  };

  // Close account menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountMenuOpen &&
        accountMenuRef.current &&
        accountButtonRef.current &&
        !accountMenuRef.current.contains(event.target as Node) &&
        !accountButtonRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [accountMenuOpen]);

  // Close account menu on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && accountMenuOpen) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [accountMenuOpen]);

  // Keyboard shortcuts for panels: L=Labs, M=Messages, S=Music
  // NOTE: Scene (B) shortcut is only in StudyLayout, not global header
  useEffect(() => {
    if (!isAuthenticated) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      if (key === 'l') {
        e.preventDefault();
        togglePanel('labs');
      }

      if (key === 'm') {
        e.preventDefault();
        togglePanel('messages');
      }

      if (key === 's') {
        e.preventDefault();
        togglePanel('music');
      }

      if (e.key === 'Escape') {
        closePanel();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  return (
    <>
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

          {/* Navigation - consistent gap spacing */}
          <nav className="hidden md:flex items-center gap-1.5">
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
                {/* Study */}
                <IconNavLink
                  href="/study"
                  label="Study"
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
                {/* Calendar */}
                <IconNavLink
                  href="/calendar"
                  label="Calendar"
                  matchPrefix
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  }
                  activeIcon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
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

          {/* Right side: Study Tools, Streak, Theme toggle, Stats & Profile/Auth */}
          {/* Same gap-1.5 as navigation for visual symmetry */}
          <div className="flex items-center gap-1.5">
            {/* Study Tools - only show when authenticated */}
            {isAuthenticated && (
              <>
                {/* Pomodoro Timer */}
                <PomodoroTimer variant="header" />

                {/* Messages button */}
                <button
                  onClick={() => togglePanel('messages')}
                  className={`group relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    activePanel === 'messages'
                      ? 'bg-[#C4A77D] text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Messages (M)
                  </span>
                </button>

                {/* Labs Reference button */}
                <button
                  onClick={() => togglePanel('labs')}
                  className={`group relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    activePanel === 'labs'
                      ? 'bg-[#C4A77D] text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Labs (L)
                  </span>
                </button>

                {/* Music button */}
                <button
                  onClick={() => togglePanel('music')}
                  className={`group relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    activePanel === 'music'
                      ? 'bg-[#C4A77D] text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Music (S)
                  </span>
                </button>

                {/* Streak counter */}
                <StreakCounter variant="compact" />
              </>
            )}

            {/* Theme Toggle - hidden on landing page */}
            {!isLandingPage && <ThemeToggleSimple variant="greenHeader" />}

            {/* Stats Badge - only when authenticated */}
            {isAuthenticated && stats && stats.dueToday > 0 && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-white/20 border border-white/30 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C4A77D] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C4A77D]"></span>
                  </span>
                  <span className="text-xs font-medium text-white">
                    {stats.dueToday} due
                  </span>
                </div>

                <Link
                  href="/flashcards"
                  className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </>
            )}

            {/* Account Menu - only when authenticated */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  ref={accountButtonRef}
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Account menu"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="true"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>

                {/* Account Dropdown */}
                {accountMenuOpen && (
                  <div
                    ref={accountMenuRef}
                    className="absolute top-full right-0 mt-2 w-[180px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[110]"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      role="menuitem"
                    >
                      Account
                    </Link>
                    <Link
                      href="/profile/settings"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      role="menuitem"
                    >
                      Settings
                    </Link>
                    <div className="border-t border-slate-200 dark:border-slate-700" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Login/Register when not authenticated - Get Started hidden on landing page */}
            {isAuthenticated === false && (
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                {!isLandingPage && (
                  <Link
                    href="/register"
                    className="px-3 py-1.5 text-xs font-medium text-[#5B7B6D] bg-white hover:bg-white/90 rounded-lg shadow-soft transition-all"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            )}

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
            {isAuthenticated ? (
              <>
                <MobileNavLink href="/home" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>

                {/* Study Section */}
                <div className="pt-2 border-t border-white/20">
                  <p className="px-4 py-1 text-xs font-semibold text-white/60 uppercase tracking-wider">Study</p>
                  <MobileNavLink href="/study" onClick={() => setMobileMenuOpen(false)}>Study Hub</MobileNavLink>
                  <MobileNavLink href="/flashcards" onClick={() => setMobileMenuOpen(false)}>Flashcards</MobileNavLink>
                  <MobileNavLink href="/qbank" onClick={() => setMobileMenuOpen(false)}>QBank</MobileNavLink>
                  <MobileNavLink href="/cases" onClick={() => setMobileMenuOpen(false)}>Cases</MobileNavLink>
                  <MobileNavLink href="/study/rapid-review" onClick={() => setMobileMenuOpen(false)}>Rapid Review</MobileNavLink>
                </div>

                {/* Calendar Section */}
                <div className="pt-2 border-t border-white/20">
                  <p className="px-4 py-1 text-xs font-semibold text-white/60 uppercase tracking-wider">Calendar</p>
                  <MobileNavLink href="/calendar" onClick={() => setMobileMenuOpen(false)}>Calendar</MobileNavLink>
                </div>

                {/* Wellness Section */}
                <div className="pt-2 border-t border-white/20">
                  <p className="px-4 py-1 text-xs font-semibold text-white/60 uppercase tracking-wider">Wellness</p>
                  <MobileNavLink href="/wellness" onClick={() => setMobileMenuOpen(false)}>Wellness Hub</MobileNavLink>
                  <MobileNavLink href="/wellness?tab=journey" onClick={() => setMobileMenuOpen(false)}>My Journey</MobileNavLink>
                  <MobileNavLink href="/wellness?tab=skills" onClick={() => setMobileMenuOpen(false)}>Social Skills</MobileNavLink>
                </div>

                {/* Community Section */}
                <div className="pt-2 border-t border-white/20">
                  <p className="px-4 py-1 text-xs font-semibold text-white/60 uppercase tracking-wider">Community</p>
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
                <div className="pt-3 border-t border-white/20 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2.5 text-center text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  {!isLandingPage && (
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-2.5 text-center text-sm font-medium text-[#5B7B6D] bg-white hover:bg-white/90 rounded-lg shadow-soft transition-all"
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>

    {/* Right-side panels - only one can be open at a time */}
    {/* NOTE: ScenePanel is only available in StudyLayout, not global header */}
    {isAuthenticated && (
      <>
        <LabReferencePanel isOpen={activePanel === 'labs'} onClose={closePanel} />
        <MessengerPanel isOpen={activePanel === 'messages'} onClose={closePanel} />
        <MusicPanel isOpen={activePanel === 'music'} onClose={closePanel} />
      </>
    )}

    {/* Spacer to prevent content from hiding behind fixed header */}
    <div className="h-12" />
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
        block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-white/20 text-white'
          : 'text-white/80 hover:text-white hover:bg-white/10'
        }
      `}
    >
      {children}
    </Link>
  );
}
