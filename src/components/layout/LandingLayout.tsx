'use client';

import { LandingHeader, HEADER_HEIGHT } from './LandingHeader';
import { Footer, FOOTER_HEIGHT } from './Footer';

// Re-export height constants for convenience
export { HEADER_HEIGHT, FOOTER_HEIGHT };

interface LandingLayoutProps {
  children: React.ReactNode;
}

/**
 * LandingLayout - Minimal layout for the landing page
 *
 * This layout is intentionally separate from authenticated layouts
 * (ThreeColumnLayout, PageLayout, etc.) to keep the landing page
 * DOM shallow and free from auth-specific wrappers.
 *
 * Structure:
 * - Fixed header (48px)
 * - Main content area (scrollable)
 * - Fixed footer (48px)
 */
export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      {children}
      <Footer variant="landing" />
    </div>
  );
}
