'use client';

import Link from 'next/link';
import type { Tribe } from '@/types/tribes';
import { getTypeLabel } from '@/lib/storage/tribeStorage';

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
  return TYPE_COLORS[type] || 'from-[#5B7B6D] to-[#3D5A4C]';
}

interface TribeHeaderProps {
  tribe: Tribe;
  isMember: boolean;
  isPrimary?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
  onSetPrimary?: () => void;
  hidePoints?: boolean;
  label?: 'Tribe' | 'Group';
}

export function TribeHeader({
  tribe,
  isMember,
  isPrimary = false,
  onJoin,
  onLeave,
  onSetPrimary,
  hidePoints = false,
  label = 'Tribe',
}: TribeHeaderProps) {
  const tribeColor = getForestColor(tribe.color, tribe.type);

  return (
    <div className={`bg-gradient-to-r ${tribeColor} rounded-2xl overflow-hidden`}>
      {/* Back button */}
      <div className="px-4 py-3 bg-black/10">
        <Link
          href={label === 'Group' ? '/groups' : '/tribes'}
          className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {label === 'Group' ? 'Groups' : 'Tribes'}
        </Link>
      </div>

      {/* Main header content */}
      <div className="px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Tribe info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl md:text-5xl shadow-lg">
              {tribe.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{tribe.name}</h1>
                {tribe.visibility === 'private' && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-white/20 text-white rounded-full">
                    Private
                  </span>
                )}
                {isPrimary && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-[#C4A77D] text-[#3D5A4C] rounded-full">
                    Primary
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm md:text-base mb-2">{tribe.description}</p>
              <div className="flex items-center gap-3 text-white/90 text-sm">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {tribe.memberCount} member{tribe.memberCount !== 1 ? 's' : ''}
                </span>
                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {getTypeLabel(tribe.type)}
                </span>
                {tribe.rank > 0 && (
                  <>
                    <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                    <span className="flex items-center gap-1">
                      <span className="text-lg">🏆</span>
                      #{tribe.rank} on leaderboard
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start">
            {isMember ? (
              <>
                {!isPrimary && onSetPrimary && (
                  <button
                    onClick={onSetPrimary}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Set as Primary
                  </button>
                )}
                <button
                  onClick={onLeave}
                  className="px-4 py-2 bg-white/20 hover:bg-[#6B5344]/50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Leave {label}
                </button>
              </>
            ) : (
              <button
                onClick={onJoin}
                className="px-6 py-2 bg-white text-slate-800 rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg"
              >
                Join {label}
              </button>
            )}
          </div>
        </div>

        {/* Mission statement */}
        <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
          <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Mission</p>
          <p className="text-white text-sm md:text-base">{tribe.mission}</p>
        </div>

        {/* Stats row - simplified for Groups (no points) */}
        {hidePoints ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <p className="text-2xl font-bold text-white">{tribe.memberCount}</p>
              <p className="text-xs text-white/70">Members</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <p className="text-2xl font-bold text-white">{tribe.maxMembers}</p>
              <p className="text-xs text-white/70">Max Capacity</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <p className="text-2xl font-bold text-white">{tribe.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-white/70">Total Points</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <p className="text-2xl font-bold text-white">+{tribe.weeklyPoints.toLocaleString()}</p>
              <p className="text-xs text-white/70">This Week</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <p className="text-2xl font-bold text-white">{tribe.memberCount}/{tribe.maxMembers}</p>
              <p className="text-xs text-white/70">Members</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
