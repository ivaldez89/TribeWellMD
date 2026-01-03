'use client';

import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';

// GlobalUI - renders app-wide UI elements that persist across all pages
//
// NOTE: Scene backgrounds are intentionally NOT rendered here.
// Scenes are study-only and rendered via StudyLayout component.
// This prevents scenes from appearing on non-study pages
// (Home, Community, Wellness, Profile, etc.)

export function GlobalUI() {
  return (
    <>
      {/* Email verification banner - shown when user email is not verified */}
      <EmailVerificationBanner />
    </>
  );
}
