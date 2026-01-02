'use client';

import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SpotifyProvider } from '@/contexts/SpotifyContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { SceneProvider } from '@/contexts/SceneContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SpotifyProvider>
        <AudioProvider>
          <SceneProvider>
            {children}
          </SceneProvider>
        </AudioProvider>
      </SpotifyProvider>
    </ThemeProvider>
  );
}
