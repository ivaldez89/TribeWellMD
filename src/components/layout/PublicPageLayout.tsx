'use client';

import { Header } from './Header';
import { Footer } from '@/components/footer/Footer';

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#E8E0D5] to-[#D4C4B0] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header variant="public" />

      {/* Main content with padding for fixed header/footer */}
      <main className="pt-12 pb-12 min-h-screen">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default PublicPageLayout;
