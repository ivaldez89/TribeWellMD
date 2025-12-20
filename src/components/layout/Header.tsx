'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeProvider';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
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

interface HeaderProps {
  stats?: {
    dueToday: number;
    totalCards: number;
  };
}

export function Header({ stats }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-shadow overflow-hidden">
              <img src="/icons/icon.svg" alt="TribeWellMD" className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Tribe</span>
              <span className="text-xl font-bold text-teal-600 dark:text-teal-400">Well</span>
              <span className="text-xl font-light text-indigo-600 dark:text-indigo-400">MD</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/study">Study</NavLink>
            <NavLink href="/cases">Cases</NavLink>
            <NavLink href="/wellness">Wellness</NavLink>
            <NavLink href="/resources">Resources</NavLink>
            <NavLink href="/community">Community</NavLink>
            <NavLink href="/premed">PreMed</NavLink>
          </nav>
          
          {/* Right side: Theme toggle & Stats */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Stats Badge */}
            {stats && stats.dueToday > 0 && (
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
          </div>
        </div>
      </div>
    </header>
  );
}
