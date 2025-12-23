'use client';

import { useState } from 'react';
import type { TribeMember } from '@/types/tribes';
import { formatTribeTime } from '@/lib/storage/tribeStorage';

interface TribeMemberListProps {
  members: TribeMember[];
  currentUserId?: string;
}

export function TribeMemberList({ members, currentUserId = 'current-user' }: TribeMemberListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'founder' | 'moderator' | 'member'>('all');

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Sort: online first, then by role, then by contribution points
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    // Current user first
    if (a.oderId === currentUserId) return -1;
    if (b.oderId === currentUserId) return 1;

    // Online status
    if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;

    // Role priority
    const rolePriority = { founder: 0, moderator: 1, member: 2 };
    if (rolePriority[a.role] !== rolePriority[b.role]) {
      return rolePriority[a.role] - rolePriority[b.role];
    }

    // Contribution points
    return b.contributionPoints - a.contributionPoints;
  });

  const getRoleBadge = (role: TribeMember['role']) => {
    const styles = {
      founder: 'bg-amber-100 text-amber-700',
      moderator: 'bg-blue-100 text-blue-700',
      member: 'bg-slate-100 text-slate-600',
    };
    const labels = {
      founder: 'Founder',
      moderator: 'Mod',
      member: 'Member',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Search and filter */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'founder', 'moderator', 'member'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                roleFilter === role
                  ? 'bg-tribe-sage-100 text-tribe-sage-700 font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}s
            </button>
          ))}
        </div>
      </div>

      {/* Member count */}
      <div className="px-4 py-2 bg-slate-50 text-sm text-slate-600 border-b border-slate-200">
        {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
        {roleFilter !== 'all' && ` (${roleFilter}s)`}
      </div>

      {/* Member list */}
      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {sortedMembers.length > 0 ? (
          sortedMembers.map((member) => (
            <div
              key={member.id}
              className={`flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors ${
                member.oderId === currentUserId ? 'bg-tribe-sage-50/50' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-medium text-sm">
                  {member.avatar || getInitials(member.firstName, member.lastName)}
                </div>
                {member.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-tribe-sage-500 border-2 border-white rounded-full" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 truncate">
                    {member.firstName} {member.lastName}
                    {member.oderId === currentUserId && (
                      <span className="text-slate-400 font-normal"> (you)</span>
                    )}
                  </span>
                  {getRoleBadge(member.role)}
                </div>
                <p className="text-sm text-slate-500">
                  Joined {formatTribeTime(member.joinedAt)}
                </p>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="font-semibold text-tribe-sage-600">
                  {member.contributionPoints.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">points</p>
                {member.weeklyContribution > 0 && (
                  <p className="text-xs text-tribe-sage-500">
                    +{member.weeklyContribution} this week
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>No members found</p>
          </div>
        )}
      </div>
    </div>
  );
}
