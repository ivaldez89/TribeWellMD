'use client';

import { LandingLayout } from '@/components/layout/LandingLayout';
import { LandingHero, LandingFeatures } from '@/components/landing';

export default function HomePage() {
  return (
    <LandingLayout>
      <LandingHero />
      <main>
        <LandingFeatures />
        {/* Bottom padding to account for fixed footer */}
        <div className="h-12 bg-surface" />
      </main>
    </LandingLayout>
  );
}
