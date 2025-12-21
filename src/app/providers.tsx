'use client';

import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { SpotifyProvider } from '@/contexts/SpotifyContext';
import { PersistentSpotifyPlayer } from '@/components/music/PersistentSpotifyPlayer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SpotifyProvider>
        {children}
        <PersistentSpotifyPlayer />
        <ServiceWorkerRegistration />
      </SpotifyProvider>
    </ThemeProvider>
  );
}
