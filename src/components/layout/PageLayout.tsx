'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from '@/components/footer/Footer';

/**
 * ContentPageLayout Component (also exported as PageLayout)
 *
 * Unified layout wrapper for all non-study, non-video pages.
 * Composes the unified Header, main content, and Footer.
 *
 * Structure:
 * - Fixed header (48px) with spacer
 * - Main content area (flex-1, scrollable)
 * - Fixed footer (48px) with spacer
 *
 * Use this layout instead of directly importing Header/Footer in pages.
 */

export interface ContentPageLayoutProps {
  children: ReactNode;
  /**
   * Header/Footer variant:
   * - 'public': For landing/marketing pages
   * - 'auth': For authenticated pages (auto-detected if omitted)
   */
  variant?: 'public' | 'auth';
  /**
   * Max width constraint for main content
   * - 'md': max-w-3xl
   * - 'lg': max-w-4xl
   * - 'xl': max-w-5xl
   * - '7xl': max-w-7xl (default, matches header)
   * - 'full': no max-width constraint
   */
  maxWidth?: 'md' | 'lg' | 'xl' | '7xl' | 'full';
  /**
   * Additional className for the root wrapper
   */
  className?: string;
  /**
   * Additional className for the main content area
   */
  mainClassName?: string;
  /**
   * Whether to include Header (default true)
   */
  showHeader?: boolean;
  /**
   * Whether to include Footer (default true)
   */
  showFooter?: boolean;
}

const maxWidthClasses = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  '7xl': 'max-w-7xl',
  full: '',
};

export function ContentPageLayout({
  children,
  variant,
  maxWidth = '7xl',
  className = '',
  mainClassName = '',
  showHeader = true,
  showFooter = true,
}: ContentPageLayoutProps) {
  const maxWidthClass = maxWidthClasses[maxWidth];

  return (
    <div className={`min-h-screen flex flex-col bg-background ${className}`}>
      {showHeader && <Header variant={variant} includeSpacer />}
      <main className={`flex-1 ${maxWidthClass} mx-auto w-full px-4 sm:px-6 lg:px-8 ${mainClassName}`}>
        {children}
      </main>
      {showFooter && <Footer includeSpacer />}
    </div>
  );
}

// Legacy alias for backward compatibility
export const PageLayout = ContentPageLayout;
export type PageLayoutProps = ContentPageLayoutProps;
