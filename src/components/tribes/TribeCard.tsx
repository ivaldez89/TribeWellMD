'use client';

import Link from 'next/link';
import type { Tribe } from '@/types/tribes';
import { getGoalProgress, getTypeLabel } from '@/lib/storage/tribeStorage';
import { Icons } from '@/components/ui/Icons';

interface TribeCardProps {
  tribe: Tribe;
  isMember?: boolean;
  onJoin?: (tribeId: string) => void;
}

// Map tribe types to appropriate icons
const typeIcons: Record<Tribe['type'], React.ReactNode> = {
  study: <Icons.Book />,
  specialty: <Icons.Stethoscope />,
  wellness: <Icons.Heart />,
  cause: <Icons.HeartHand />,
};

export function TribeCard({ tribe, isMember = false, onJoin }: TribeCardProps) {
  const goalProgress = tribe.currentGoal ? getGoalProgress(tribe.currentGoal) : 0;

  // Type badge styles with dark mode support
  const typeStyles: Record<Tribe['type'], string> = {
    study: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    specialty: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    wellness: 'bg-tribe-sage-100 dark:bg-tribe-sage-900/30 text-tribe-sage-700 dark:text-tribe-sage-300',
    cause: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onJoin) {
      onJoin(tribe.id);
    }
  };

  return (
    <Link href={`/tribes/${tribe.id}`}>
      <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-200 overflow-hidden cursor-pointer">
        {/* Header with gradient */}
        <div className={`px-4 py-4 bg-gradient-to-r ${tribe.color}`}>
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
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                <span className="w-3 h-3"><Icons.Trophy /></span>
                #{tribe.rank}
              </span>
            )}
          </div>

          {/* Goal progress */}
          {tribe.currentGoal && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-medium truncate pr-2">{tribe.currentGoal.title}</span>
                <span className="whitespace-nowrap">{goalProgress}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${tribe.color} rounded-full transition-all duration-300`}
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
              {tribe.weeklyPoints > 0 && (
                <span className="text-tribe-sage-600 dark:text-tribe-sage-400 font-medium flex items-center gap-1">
                  <span className="w-3 h-3"><Icons.Fire /></span>
                  +{tribe.weeklyPoints} this week
                </span>
              )}
            </div>

            {isMember ? (
              <span className="px-3 py-1 text-xs font-medium bg-tribe-sage-100 dark:bg-tribe-sage-900/30 text-tribe-sage-700 dark:text-tribe-sage-300 rounded-full flex items-center gap-1">
                <span className="w-3 h-3"><Icons.Check /></span>
                Member
              </span>
            ) : (
              <button
                onClick={handleJoinClick}
                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:from-amber-600 hover:to-orange-600 transition-colors shadow-sm"
              >
                Join Tribe
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
