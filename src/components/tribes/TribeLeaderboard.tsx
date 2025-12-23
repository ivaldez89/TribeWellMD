'use client';

import { useState } from 'react';
import type { TribeMember } from '@/types/tribes';

interface TribeLeaderboardProps {
  members: TribeMember[];
  currentUserId?: string;
}

type TimeFilter = 'all-time' | 'weekly';

export function TribeLeaderboard({ members, currentUserId = 'current-user' }: TribeLeaderboardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time');

  // Sort members by points
  const sortedMembers = [...members].sort((a, b) => {
    if (timeFilter === 'weekly') {
      return b.weeklyContribution - a.weeklyContribution;
    }
    return b.contributionPoints - a.contributionPoints;
  });

  const getPoints = (member: TribeMember) => {
    return timeFilter === 'weekly' ? member.weeklyContribution : member.contributionPoints;
  };

  const maxPoints = sortedMembers.length > 0 ? getPoints(sortedMembers[0]) : 0;

  const getRankBadge = (index: number) => {
    if (index === 0) return { emoji: '🥇', bg: 'bg-yellow-100', text: 'text-yellow-700' };
    if (index === 1) return { emoji: '🥈', bg: 'bg-slate-100', text: 'text-slate-700' };
    if (index === 2) return { emoji: '🥉', bg: 'bg-amber-100', text: 'text-amber-700' };
    return { emoji: `${index + 1}`, bg: 'bg-slate-50', text: 'text-slate-500' };
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  // Find current user's rank
  const currentUserRank = sortedMembers.findIndex((m) => m.oderId === currentUserId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h3 className="font-semibold text-slate-800">Leaderboard</h3>
          </div>
          <div className="flex bg-white rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setTimeFilter('all-time')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeFilter === 'all-time'
                  ? 'bg-tribe-sage-500 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeFilter === 'weekly'
                  ? 'bg-tribe-sage-500 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </div>

      {/* Current user's rank banner */}
      {currentUserRank >= 0 && (
        <div className="px-4 py-3 bg-tribe-sage-50 border-b border-teal-100">
          <p className="text-sm text-tribe-sage-700">
            You&apos;re ranked <span className="font-bold">#{currentUserRank + 1}</span> with{' '}
            <span className="font-bold">{getPoints(sortedMembers[currentUserRank]).toLocaleString()}</span> points
            {timeFilter === 'weekly' && ' this week'}
          </p>
        </div>
      )}

      {/* Leaderboard list */}
      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
        {sortedMembers.length > 0 ? (
          sortedMembers.map((member, index) => {
            const rank = getRankBadge(index);
            const points = getPoints(member);
            const progressWidth = maxPoints > 0 ? (points / maxPoints) * 100 : 0;

            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 p-4 ${
                  member.oderId === currentUserId ? 'bg-tribe-sage-50/50' : 'hover:bg-slate-50'
                } transition-colors`}
              >
                {/* Rank */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rank.bg} ${rank.text}`}
                >
                  {index < 3 ? rank.emoji : rank.emoji}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-medium text-sm">
                  {member.avatar || getInitials(member.firstName, member.lastName)}
                </div>

                {/* Info with progress bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800 truncate">
                      {member.firstName} {member.lastName}
                      {member.oderId === currentUserId && (
                        <span className="text-slate-400 font-normal"> (you)</span>
                      )}
                    </span>
                    {member.role !== 'member' && (
                      <span
                        className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                          member.role === 'founder'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {member.role === 'founder' ? 'Founder' : 'Mod'}
                      </span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                          : 'bg-gradient-to-r from-teal-400 to-cyan-500'
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="font-bold text-tribe-sage-600 text-lg">
                    {points.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">points</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>No members yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500 text-center">
          Earn points through study and wellness activities
        </p>
      </div>
    </div>
  );
}
