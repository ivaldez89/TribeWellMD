import type { Metadata, Viewport } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import { Providers } from './providers';
import { ChatBubble } from '@/components/chat/ChatBubble';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0d9488',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'TribeWellMD - Your Tribe Through Medical School',
  description: 'The complete platform for medical students: study tools, wellness resources, mentorship, and community. Study smart. Stay well. Find your tribe.',
  keywords: ['medical student', 'USMLE', 'Step 2 CK', 'medical education', 'flashcards', 'wellness', 'mentorship', 'residency', 'medical school'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TribeWellMD',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
        <Providers>
          {children}
          <ChatBubble />
        </Providers>
      </body>
    </html>
  );
}
