'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from '@/components/footer/Footer';

/**
 * PageLayout Component
 *
 * Simple wrapper for pages that use Header + main + Footer directly.
 * Ensures footer stays at the bottom when content is short.
 *
 * Uses flex column layout with:
 * - min-h-screen on wrapper
 * - flex-1 on main content area
 */

interface PageLayoutProps {
  children: ReactNode;
  // Optional custom background class (defaults to bg-background)
  className?: string;
  // Whether to include Header (default true)
  showHeader?: boolean;
  // Whether to include Footer (default true)
  showFooter?: boolean;
  // Custom main element className
  mainClassName?: string;
}

export function PageLayout({
  children,
  className = 'bg-background',
  showHeader = true,
  showFooter = true,
  mainClassName = '',
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {showHeader && <Header includeSpacer />}
      <main className={`flex-1 ${mainClassName}`}>
        {children}
      </main>
      {showFooter && <Footer includeSpacer />}
    </div>
  );
}
