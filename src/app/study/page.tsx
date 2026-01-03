'use client';

import Link from 'next/link';
import { ContentPageLayout } from '@/components/layout/PageLayout';
import { CARD_STYLES } from '@/components/layout/ThreeColumnLayout';
import { useFlashcards } from '@/hooks/useFlashcards';

// Icon component for study modes
function StudyIcon({ name }: { name: string }) {
  switch (name) {
    case 'flashcards':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'qbank':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'cases':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'bolt':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'users':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

// Reusable StudyCard component
function StudyCard({
  href,
  title,
  subtitle,
  meta,
  icon,
  accent,
  primary = false,
}: {
  href: string;
  title: string;
  subtitle: string;
  meta?: string;
  icon: string;
  accent: 'sand' | 'sage' | 'forest' | 'amber' | 'clay';
  primary?: boolean;
}) {
  const accentClasses = {
    sand: 'bg-[#C4A77D]/20 text-[#7B5E3B]',
    sage: 'bg-[#5B7B6D]/20 text-[#3D5A4C]',
    forest: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    clay: 'bg-[#D4B78D]/30 text-[#7B5E3B]',
  };

  return (
    <Link
      href={href}
      className={`${CARD_STYLES.containerWithPadding} block transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-[#C4A77D]/30 ${
        primary ? 'ring-2 ring-[#C4A77D]/40' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accentClasses[accent]}`}>
          <StudyIcon name={icon} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>

          {meta && (
            <p className="mt-1 text-xs text-[#7B5E3B] dark:text-[#C4A77D] font-medium">
              {meta}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function StudyHubPage() {
  const { stats } = useFlashcards();
  const dueCount = stats?.dueToday || 0;

  return (
    <ContentPageLayout maxWidth="7xl" mainClassName="flex items-start justify-center px-4 py-8 lg:py-12">
      <div className="w-full max-w-4xl">
        {/* Subtle background panel */}
        <div className="bg-surface-muted/30 dark:bg-surface-muted/10 rounded-3xl p-6 sm:p-8 lg:p-10">
          {/* Page Header - Centered */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              Study
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Choose how you want to study right now.
            </p>
          </div>

          {/* Study Mode Grid - Centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Flashcards (Primary) */}
            <StudyCard
              href="/flashcards"
              title="Flashcards"
              subtitle="Spaced repetition"
              meta={dueCount > 0 ? `${dueCount} cards due` : undefined}
              icon="flashcards"
              accent="sand"
              primary
            />

            {/* QBank */}
            <StudyCard
              href="/qbank"
              title="QBank"
              subtitle="Practice questions"
              icon="qbank"
              accent="sage"
            />

            {/* Cases */}
            <StudyCard
              href="/cases"
              title="Cases"
              subtitle="Clinical reasoning"
              icon="cases"
              accent="forest"
            />

            {/* Rapid Review */}
            <StudyCard
              href="/study/rapid-review"
              title="Rapid Review"
              subtitle="Text-to-speech"
              icon="bolt"
              accent="amber"
            />

            {/* Study Groups */}
            <StudyCard
              href="/progress/rooms"
              title="Study Groups"
              subtitle="Learn together"
              icon="users"
              accent="clay"
            />
          </div>
        </div>
      </div>
    </ContentPageLayout>
  );
}
