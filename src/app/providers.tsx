'use client';

import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { SpotifyProvider } from '@/contexts/SpotifyContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SpotifyProvider>
        {children}
        <ServiceWorkerRegistration />
      </SpotifyProvider>
    </ThemeProvider>
  );
}
