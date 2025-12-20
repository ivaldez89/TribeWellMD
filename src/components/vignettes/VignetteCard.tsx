'use client';

import Link from 'next/link';
import type { ClinicalVignette, VignetteProgress } from '@/types';

interface VignetteCardProps {
  vignette: ClinicalVignette;
  progress?: VignetteProgress | null;
}

export function VignetteCard({ vignette, progress }: VignetteCardProps) {
  const isDue = !progress || new Date(progress.nextReview) <= new Date();

  // Calculate mastery percentage
  const masteryPercentage = progress
    ? progress.overallMastery === 'mastered'
      ? 100
      : progress.overallMastery === 'familiar'
        ? 60
        : 30
    : 0;

  // Difficulty colors
  const difficultyStyles = {
    beginner: 'bg-emerald-100 text-emerald-700',
    intermediate: 'bg-amber-100 text-amber-700',
    advanced: 'bg-red-100 text-red-700'
  };

  // Mastery colors
  const masteryColors = {
    mastered: 'from-emerald-500 to-teal-500',
    familiar: 'from-amber-500 to-orange-500',
    learning: 'from-slate-300 to-slate-400'
  };

  // Format last completed date
  const formatLastCompleted = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // System icons (simplified)
  const systemIcons: Record<string, string> = {
    Cardiology: '❤️',
    Neurology: '🧠',
    Pulmonology: '🫁',
    Gastroenterology: '🔥',
    Nephrology: '💧',
    Endocrinology: '⚡',
    'Hematology/Oncology': '🩸',
    'Infectious Disease': '🦠',
    Rheumatology: '🦴',
    Dermatology: '🌡️',
    Psychiatry: '🧘',
    'OB/GYN': '👶',
    Pediatrics: '🧒',
    Surgery: '🔪',
    'Emergency Medicine': '🚨',
    'Preventive Medicine': '🛡️',
    General: '🏥'
  };

  return (
    <Link href={`/cases/${vignette.id}`}>
      <div className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-slate-200 hover:border-indigo-300 transition-all duration-200 overflow-hidden cursor-pointer">
        {/* Header with system indicator */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{systemIcons[vignette.metadata.system] || '🏥'}</span>
              <span className="text-sm font-medium text-slate-700">
                {vignette.metadata.system}
              </span>
            </div>
            {isDue && (
              <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                Due
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">
            {vignette.title}
          </h3>

          {/* Meta info */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyStyles[vignette.metadata.difficulty]}`}>
              {vignette.metadata.difficulty}
            </span>
            <span>•</span>
            <span>~{vignette.metadata.estimatedMinutes} min</span>
          </div>

          {/* Mastery progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>
                {progress ? `${masteryPercentage}% mastery` : 'Not started'}
              </span>
              {progress && progress.completions > 0 && (
                <span>{progress.completions} completion{progress.completions !== 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${
                  progress ? masteryColors[progress.overallMastery] : masteryColors.learning
                } rounded-full transition-all duration-300`}
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Last: {formatLastCompleted(progress?.lastCompleted || null)}</span>
            <div className="flex items-center gap-1 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="font-medium">Start Case</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
