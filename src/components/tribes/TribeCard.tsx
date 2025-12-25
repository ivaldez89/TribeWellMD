'use client';

import Link from 'next/link';
import type { Tribe } from '@/types/tribes';
import { getGoalProgress, getTypeLabel } from '@/lib/storage/tribeStorage';
import { Icons } from '@/components/ui/Icons';

/**
 * TribeCard Component
 *
 * Uses SEMANTIC color tokens - no hardcoded hex values.
 * All colors come from CSS variables via Tailwind classes.
 *
 * Gradient mappings use the raw palette colors (forest-*, sand-*, etc.)
 * which are defined in tailwind.config.ts but should ONLY be used
 * for gradient definitions, not general styling.
 */

interface TribeCardProps {
  tribe: Tribe;
  isMember?: boolean;
  onJoin?: (tribeId: string) => void;
  hidePoints?: boolean;
  linkPrefix?: string;
}

// Gradient classes using raw palette (allowed for gradients only)
// These map to the Forest Theme color palette
const GRADIENT_CLASSES = {
  forest: 'from-forest-600 to-forest-700',
  sage: 'from-sage-500 to-sage-600',
  earth: 'from-earth-500 to-earth-600',
  sand: 'from-sand-600 to-sand-700',
  teal: 'from-teal-600 to-teal-700',
  burgundy: 'from-burgundy-500 to-burgundy-600',
} as const;

type GradientKey = keyof typeof GRADIENT_CLASSES;

// Map tribe types to gradient styles
const TYPE_GRADIENTS: Record<Tribe['type'], GradientKey> = {
  study: 'sand',
  specialty: 'earth',
  wellness: 'sage',
  cause: 'forest',
};

// Map tribe types to icons
const TYPE_ICONS: Record<Tribe['type'], React.ReactNode> = {
  study: <Icons.Book />,
  specialty: <Icons.Stethoscope />,
  wellness: <Icons.Heart />,
  cause: <Icons.HeartHand />,
};

// Get gradient class for a tribe
function getTribeGradient(tribe: Tribe): string {
  // If tribe has a stored gradient key, use it
  const gradientKey = TYPE_GRADIENTS[tribe.type];
  return GRADIENT_CLASSES[gradientKey];
}

export function TribeCard({
  tribe,
  isMember = false,
  onJoin,
  hidePoints = false,
  linkPrefix = '/tribes'
}: TribeCardProps) {
  const goalProgress = tribe.currentGoal ? getGoalProgress(tribe.currentGoal) : 0;
  const gradientClass = getTribeGradient(tribe);

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onJoin) {
      onJoin(tribe.id);
    }
  };

  return (
    <Link href={`${linkPrefix}/${tribe.id}`}>
      <div className="group card hover:border-secondary overflow-hidden cursor-pointer">
        {/* Header with gradient - uses raw palette for gradient effect */}
        <div className={`px-4 py-4 bg-gradient-to-r ${gradientClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                {TYPE_ICONS[tribe.type] || <Icons.Village />}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm drop-shadow-sm">
                  {tribe.name}
                </h3>
                <span className="text-xs text-white/80">
                  {tribe.memberCount} member{tribe.memberCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {tribe.visibility === 'private' && (
              <span className="px-2 py-0.5 text-xs font-medium bg-white/20 text-white rounded-full backdrop-blur-sm flex items-center gap-1">
                <Icons.Lock />
                Private
              </span>
            )}
          </div>
        </div>

        {/* Content - uses semantic tokens */}
        <div className="p-4">
          {/* Description */}
          <p className="text-sm text-content-secondary mb-3 line-clamp-2">
            {tribe.description}
          </p>

          {/* Type badge - uses semantic tokens */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary-light text-content-secondary">
              {getTypeLabel(tribe.type)}
            </span>
            {tribe.rank > 0 && tribe.rank <= 10 && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-warning-light text-content-secondary flex items-center gap-1">
                <span className="w-3 h-3"><Icons.Trophy /></span>
                #{tribe.rank}
              </span>
            )}
          </div>

          {/* Goal progress */}
          {!hidePoints && tribe.currentGoal && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-content-muted mb-1">
                <span className="font-medium truncate pr-2">{tribe.currentGoal.title}</span>
                <span className="whitespace-nowrap">{goalProgress}%</span>
              </div>
              <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-300`}
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-content-muted mt-1">
                <span>{tribe.currentGoal.currentPoints.toLocaleString()} pts</span>
                <span>{tribe.currentGoal.targetPoints.toLocaleString()} goal</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border-light">
            <div className="text-xs text-content-muted">
              {!hidePoints && tribe.weeklyPoints > 0 && (
                <span className="text-success font-medium flex items-center gap-1">
                  <span className="w-3 h-3"><Icons.Fire /></span>
                  +{tribe.weeklyPoints} this week
                </span>
              )}
            </div>

            {isMember ? (
              <span className="px-3 py-1 text-xs font-medium bg-primary-light text-primary rounded-full flex items-center gap-1">
                <span className="w-3 h-3"><Icons.Check /></span>
                Member
              </span>
            ) : (
              <button
                onClick={handleJoinClick}
                className="px-3 py-1.5 text-xs font-medium bg-primary hover:bg-primary-hover text-primary-foreground rounded-full transition-colors shadow-sm"
              >
                Join Group
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
