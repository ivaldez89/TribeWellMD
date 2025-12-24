'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TribeCard } from '@/components/tribes/TribeCard';
import { CreateTribeModal } from '@/components/tribes/CreateTribeModal';
import { useTribes } from '@/hooks/useTribes';
import { Icons } from '@/components/ui/Icons';
import type { Tribe, TribeType, SocialCause, TribeFilter } from '@/types/tribes';

// Forest theme colors - only these are allowed
const FOREST_THEME_COLORS = [
  'from-[#3D5A4C] to-[#2D4A3C]', // Deep Forest
  'from-[#5B7B6D] to-[#3D5A4C]', // Forest
  'from-[#6B8B7D] to-[#5B7B6D]', // Sage
  'from-[#8B7355] to-[#6B5344]', // Bark
  'from-[#A89070] to-[#8B7355]', // Sand
  'from-[#C4A77D] to-[#A89070]', // Wheat
];

// Map group types to forest theme colors (fallback)
const TYPE_COLORS: Record<TribeType, string> = {
  study: 'from-[#A89070] to-[#8B7355]',    // Sand
  specialty: 'from-[#8B7355] to-[#6B5344]', // Bark
  wellness: 'from-[#6B8B7D] to-[#5B7B6D]',  // Sage
  cause: 'from-[#5B7B6D] to-[#3D5A4C]',     // Forest
};

// Validate and get forest theme color
function getForestColor(color: string | undefined, type: TribeType): string {
  if (color && FOREST_THEME_COLORS.includes(color)) {
    return color;
  }
  return TYPE_COLORS[type] || 'from-[#5B7B6D] to-[#3D5A4C]';
}

type SortOption = 'popular' | 'newest' | 'points' | 'alphabetical';

export default function GroupsPage() {
  const {
    tribes,
    userTribes,
    isLoading,
    createTribe,
    joinTribe,
    checkMembership,
    canJoinMore,
    maxTribesPerUser,
    searchTribes,
  } = useTribes();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TribeType | 'all'>('all');
  const [causeFilter, setCauseFilter] = useState<SocialCause | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // Filter and sort groups
  const filteredGroups = useMemo(() => {
    const filter: TribeFilter = {
      search: searchQuery,
      types: typeFilter !== 'all' ? [typeFilter] : [],
      causes: causeFilter !== 'all' ? [causeFilter] : [],
      visibility: 'public',
      sortBy,
    };
    return searchTribes(filter);
  }, [searchQuery, typeFilter, causeFilter, sortBy, searchTribes]);

  const handleJoinGroup = (groupId: string) => {
    if (!canJoinMore()) {
      alert(`You can only be a member of ${maxTribesPerUser} groups`);
      return;
    }
    const result = joinTribe(groupId, { firstName: 'You', lastName: '' });
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleCreateGroup = (data: Parameters<typeof createTribe>[0]) => {
    createTribe(data);
    setShowCreateModal(false);
  };

  // Calculate total from user's groups (no points displayed for interest groups)
  const totalMembers = userTribes.reduce((acc, t) => acc + (t.memberCount || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-[#D4C4B0]/50 dark:bg-slate-800 rounded-3xl"></div>
            <div className="h-16 bg-[#D4C4B0]/50 dark:bg-slate-800 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-[#D4C4B0]/50 dark:bg-slate-800 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900 relative">
      {/* Subtle organic pattern overlay on sides */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#D4C4B0]/30 to-transparent" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#D4C4B0]/30 to-transparent" />
      </div>

      <Header />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <section className="mb-8 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F] p-8 md:p-10 shadow-2xl shadow-[#3D5A4C]/20">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#F5EFE6]/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left side - Title & Description */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                  <span className="w-5 h-5"><Icons.Users /></span>
                  <span>Connect with like-minded peers</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  Explore <span className="text-[#F5EFE6]">Groups</span>
                </h1>

                <p className="text-white/80 text-lg max-w-lg mb-6">
                  Join interest-based communities to connect with peers in your specialty, study focus, or wellness interests.
                </p>

                {/* User's groups summary */}
                {userTribes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-white/60 text-sm self-center mr-1">Your Groups ({userTribes.length}/{maxTribesPerUser})</span>
                    {userTribes.map((group) => (
                      <Link
                        key={group.id}
                        href={`/groups/${group.id}`}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-sm font-medium text-white transition-colors flex items-center gap-1.5"
                      >
                        <span className="w-4 h-4"><Icons.Users /></span>
                        <span>{group.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Right side - Stats & Create Button */}
              <div className="flex flex-col items-end gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-white text-[#3D5A4C] rounded-xl font-semibold hover:bg-[#F5EFE6] transition-colors shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Group
                </button>

                {/* Stats cards - simplified for interest groups (no points) */}
                {userTribes.length > 0 && (
                  <div className="flex gap-3">
                    <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                      <p className="text-2xl font-bold text-white">{userTribes.length}</p>
                      <p className="text-white/60 text-xs">Groups Joined</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                      <p className="text-2xl font-bold text-white">{totalMembers}</p>
                      <p className="text-white/60 text-xs">Group Members</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md shadow-[#3D5A4C]/5 border border-[#D4C4B0]/50 dark:border-slate-700 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B5344]/50 dark:text-slate-400"
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
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFE6] dark:bg-slate-700 border border-[#D4C4B0]/50 dark:border-slate-600 rounded-xl text-[#3D5A4C] dark:text-white placeholder-[#6B5344]/50 dark:placeholder-slate-400 focus:ring-2 focus:ring-[#5B7B6D] focus:border-[#5B7B6D] transition-colors"
                  />
                </div>
              </div>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TribeType | 'all')}
                className="px-4 py-2.5 bg-[#F5EFE6] dark:bg-slate-700 border border-[#D4C4B0]/50 dark:border-slate-600 rounded-xl text-[#3D5A4C] dark:text-white focus:ring-2 focus:ring-[#5B7B6D] focus:border-[#5B7B6D]"
              >
                <option value="all">All Types</option>
                <option value="study">Study Group</option>
                <option value="specialty">Specialty</option>
                <option value="wellness">Wellness</option>
                <option value="cause">Social Cause</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2.5 bg-[#F5EFE6] dark:bg-slate-700 border border-[#D4C4B0]/50 dark:border-slate-600 rounded-xl text-[#3D5A4C] dark:text-white focus:ring-2 focus:ring-[#5B7B6D] focus:border-[#5B7B6D]"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#6B5344]/80 dark:text-slate-400">
            {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} found
          </p>
          {(searchQuery || typeFilter !== 'all' || causeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setCauseFilter('all');
              }}
              className="text-sm text-[#5B7B6D] dark:text-[#6B8B7D] hover:text-[#3D5A4C] dark:hover:text-[#7FA08F] font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Groups Grid */}
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredGroups.map((group) => (
              <TribeCard
                key={group.id}
                tribe={group}
                isMember={checkMembership(group.id)}
                onJoin={handleJoinGroup}
                hidePoints={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0]/50 dark:border-slate-700 mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F5EFE6] dark:bg-slate-700 flex items-center justify-center text-[#6B5344]/50 dark:text-slate-400">
              <Icons.Search />
            </div>
            <h3 className="text-xl font-semibold text-[#3D5A4C] dark:text-white mb-2">No groups found</h3>
            <p className="text-[#6B5344]/70 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Try adjusting your filters or create your own group to get started!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] text-white rounded-xl font-medium hover:from-[#4A6B5D] hover:to-[#5B7B6D] transition-colors shadow-lg shadow-[#5B7B6D]/25"
            >
              Create a Group
            </button>
          </div>
        )}

        {/* Popular Groups Section (no points/leaderboard for interest groups) */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-md shadow-[#3D5A4C]/5 border border-[#D4C4B0]/50 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-[#D4C4B0]/50 dark:border-slate-700 bg-gradient-to-r from-[#8B7355] to-[#A89070]">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-lg text-white">
                <Icons.Star />
              </div>
              Popular Groups
            </h2>
          </div>
          <div className="divide-y divide-[#E8DFD0] dark:divide-slate-700">
            {tribes
              .filter((t) => t.visibility === 'public')
              .sort((a, b) => b.memberCount - a.memberCount)
              .slice(0, 5)
              .map((group, index) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-[#F5EFE6] dark:hover:bg-slate-700/50 transition-colors"
                >
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? 'bg-gradient-to-br from-[#C4A77D] to-[#8B7355] text-white shadow-lg shadow-[#8B7355]/25'
                        : index === 1
                        ? 'bg-gradient-to-br from-[#A89070] to-[#8B7355] text-white'
                        : index === 2
                        ? 'bg-gradient-to-br from-[#6B8B7D] to-[#5B7B6D] text-white'
                        : 'bg-[#F5EFE6] dark:bg-slate-700 text-[#6B5344] dark:text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getForestColor(group.color, group.type)} flex items-center justify-center shadow-md text-white`}>
                    <Icons.Users />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#3D5A4C] dark:text-white truncate">{group.name}</p>
                    <p className="text-sm text-[#6B5344]/70 dark:text-slate-400">{group.memberCount} members</p>
                  </div>
                  <svg className="w-5 h-5 text-[#D4C4B0] dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
          </div>
        </section>

        {/* Quick Action */}
        <div className="mt-8 text-center">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6B5D] hover:to-[#5B7B6D] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#5B7B6D]/25"
          >
            <Icons.Users />
            Back to Community Hub
          </Link>
        </div>
      </main>

      <Footer />

      {/* Create Group Modal */}
      <CreateTribeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
}
