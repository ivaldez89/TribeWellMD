'use client';

import Link from 'next/link';
import type { Tribe } from '@/types/tribes';
import { getGoalProgress, getTypeLabel } from '@/lib/storage/tribeStorage';
import { Icons } from '@/components/ui/Icons';

interface TribeCardProps {
  tribe: Tribe;
  isMember?: boolean;
  onJoin?: (tribeId: string) => void;
  hidePoints?: boolean;
  linkPrefix?: string;
}

// Forest theme colors - only these are allowed
const FOREST_THEME_COLORS = [
  'from-[#3D5A4C] to-[#2D4A3C]', // Deep Forest
  'from-[#5B7B6D] to-[#3D5A4C]', // Forest
  'from-[#6B8B7D] to-[#5B7B6D]', // Sage
  'from-[#8B7355] to-[#6B5344]', // Bark
  'from-[#A89070] to-[#8B7355]', // Sand
  'from-[#C4A77D] to-[#A89070]', // Wheat
];

// Map tribe types to forest theme colors (fallback)
const TYPE_COLORS: Record<Tribe['type'], string> = {
  study: 'from-[#A89070] to-[#8B7355]',    // Sand
  specialty: 'from-[#8B7355] to-[#6B5344]', // Bark
  wellness: 'from-[#6B8B7D] to-[#5B7B6D]',  // Sage
  cause: 'from-[#5B7B6D] to-[#3D5A4C]',     // Forest
};

// Validate and get forest theme color
function getForestColor(color: string | undefined, type: Tribe['type']): string {
  if (color && FOREST_THEME_COLORS.includes(color)) {
    return color;
  }
  // Fallback to type-based color
  return TYPE_COLORS[type] || 'from-[#5B7B6D] to-[#3D5A4C]';
}

// Map tribe types to appropriate icons
const typeIcons: Record<Tribe['type'], React.ReactNode> = {
  study: <Icons.Book />,
  specialty: <Icons.Stethoscope />,
  wellness: <Icons.Heart />,
  cause: <Icons.HeartHand />,
};

export function TribeCard({ tribe, isMember = false, onJoin, hidePoints = false, linkPrefix = '/tribes' }: TribeCardProps) {
  const goalProgress = tribe.currentGoal ? getGoalProgress(tribe.currentGoal) : 0;
  const tribeColor = getForestColor(tribe.color, tribe.type);

  // Type badge styles with forest theme colors
  const typeStyles: Record<Tribe['type'], string> = {
    study: 'bg-[#E8E0D5] dark:bg-[#A89070]/20 text-[#6B5344] dark:text-[#C4A77D]',
    specialty: 'bg-[#E8E0D5] dark:bg-[#8B7355]/20 text-[#6B5344] dark:text-[#A89070]',
    wellness: 'bg-[#E8E0D5] dark:bg-[#5B7B6D]/20 text-[#3D5A4C] dark:text-[#6B8B7D]',
    cause: 'bg-[#E8E0D5] dark:bg-[#6B8B7D]/20 text-[#3D5A4C] dark:text-[#7FA08F]',
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onJoin) {
      onJoin(tribe.id);
    }
  };

  return (
    <Link href={`${linkPrefix}/${tribe.id}`}>
      <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl border border-[#D4C4B0]/50 dark:border-slate-700 hover:border-[#8B7355] dark:hover:border-[#A89070] transition-all duration-200 overflow-hidden cursor-pointer">
        {/* Header with gradient */}
        <div className={`px-4 py-4 bg-gradient-to-r ${tribeColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                {typeIcons[tribe.type] || <Icons.Village />}
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

        {/* Content */}
        <div className="p-4">
          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
            {tribe.description}
          </p>

          {/* Type badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeStyles[tribe.type]}`}>
              {getTypeLabel(tribe.type)}
            </span>
            {tribe.rank > 0 && tribe.rank <= 10 && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#C4A77D]/20 dark:bg-[#C4A77D]/20 text-[#8B7355] dark:text-[#C4A77D] flex items-center gap-1">
                <span className="w-3 h-3"><Icons.Trophy /></span>
                #{tribe.rank}
              </span>
            )}
          </div>

          {/* Goal progress - hidden for interest groups */}
          {!hidePoints && tribe.currentGoal && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-medium truncate pr-2">{tribe.currentGoal.title}</span>
                <span className="whitespace-nowrap">{goalProgress}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${tribeColor} rounded-full transition-all duration-300`}
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
                <span>{tribe.currentGoal.currentPoints.toLocaleString()} pts</span>
                <span>{tribe.currentGoal.targetPoints.toLocaleString()} goal</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="text-xs text-slate-400">
              {!hidePoints && tribe.weeklyPoints > 0 && (
                <span className="text-tribe-sage-600 dark:text-tribe-sage-400 font-medium flex items-center gap-1">
                  <span className="w-3 h-3"><Icons.Fire /></span>
                  +{tribe.weeklyPoints} this week
                </span>
              )}
            </div>

            {isMember ? (
              <span className="px-3 py-1 text-xs font-medium bg-[#5B7B6D]/10 dark:bg-[#5B7B6D]/20 text-[#3D5A4C] dark:text-[#6B8B7D] rounded-full flex items-center gap-1">
                <span className="w-3 h-3"><Icons.Check /></span>
                Member
              </span>
            ) : (
              <button
                onClick={handleJoinClick}
                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-[#5B7B6D] to-[#3D5A4C] text-white rounded-full hover:from-[#3D5A4C] hover:to-[#2D4A3C] transition-colors shadow-sm"
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
