'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from '@/components/footer/Footer';

/**
 * ThreeColumnLayout Component
 *
 * Shared layout for all top-level pages (Home, Flashcards, Tools, Wellness, Community).
 * Uses semantic token bg-background for the page background.
 *
 * Layout structure:
 * - Left sidebar (hidden on mobile, 72px width on desktop)
 * - Center column (full width on mobile, max-width 2xl on desktop)
 * - Right sidebar (hidden on mobile/tablet, 64px width on xl screens)
 */

// Card styling constant - reusable across all pages
// Uses semantic tokens from Forest Theme
export const CARD_STYLES = {
  container: 'bg-surface dark:bg-surface rounded-2xl shadow-card dark:shadow-card border border-border dark:border-border',
  containerWithPadding: 'bg-surface dark:bg-surface rounded-2xl p-4 shadow-card dark:shadow-card border border-border dark:border-border',
};

interface ThreeColumnLayoutProps {
  // Mobile header card content (shown only on mobile, above the three columns)
  mobileHeader?: ReactNode;
  // Left sidebar content (hidden on mobile)
  leftSidebar?: ReactNode;
  // Main center content
  children: ReactNode;
  // Right sidebar content (hidden on mobile/tablet)
  rightSidebar?: ReactNode;
  // Optional loading state content
  loadingContent?: ReactNode;
  // Whether the page is loading
  isLoading?: boolean;
}

export function ThreeColumnLayout({
  mobileHeader,
  leftSidebar,
  children,
  rightSidebar,
  loadingContent,
  isLoading = false,
}: ThreeColumnLayoutProps) {
  if (isLoading && loadingContent) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          {loadingContent}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-4 lg:py-6 w-full">
        {/* Mobile Header Card (visible only on mobile) */}
        {mobileHeader && (
          <div className="lg:hidden mb-4">
            {mobileHeader}
          </div>
        )}

        <div className="flex gap-6">
          {/* Left Sidebar - Desktop only */}
          {leftSidebar && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-20 space-y-4">
                {leftSidebar}
              </div>
            </aside>
          )}

          {/* Center Column - Main Content */}
          <div className="flex-1 w-full lg:max-w-2xl space-y-4">
            {children}
          </div>

          {/* Right Sidebar - XL screens only */}
          {rightSidebar && (
            <aside className="hidden xl:block w-64 flex-shrink-0">
              <div className="sticky top-20 space-y-4">
                {rightSidebar}
              </div>
            </aside>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * Loading skeleton for the three-column layout
 */
export function ThreeColumnLayoutSkeleton() {
  return (
    <div className="animate-pulse flex gap-6">
      <div className="hidden lg:block w-72 space-y-4">
        <div className="h-96 bg-surface-muted dark:bg-surface-muted rounded-2xl" />
        <div className="h-48 bg-surface-muted dark:bg-surface-muted rounded-2xl" />
      </div>
      <div className="flex-1 space-y-4">
        <div className="h-32 bg-surface-muted dark:bg-surface-muted rounded-2xl" />
        <div className="h-64 bg-surface-muted dark:bg-surface-muted rounded-2xl" />
        <div className="h-64 bg-surface-muted dark:bg-surface-muted rounded-2xl" />
      </div>
    </div>
  );
}
