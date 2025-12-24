'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useStreak } from '@/hooks/useStreak';
import { useWellness } from '@/hooks/useWellness';
import { useTribes } from '@/hooks/useTribes';
import { useIsAuthenticated } from '@/hooks/useAuth';
import {
  getUserProfile,
  getUserInitials,
  MEDICAL_SPECIALTIES,
  getCurrentUserId,
  type UserProfile
} from '@/lib/storage/profileStorage';
import { uploadAvatar } from '@/lib/storage/supabaseStorage';
import {
  getConnectedUsers,
  getPendingRequestUsers,
  getConnectionCount,
  getPendingRequestCount,
  acceptConnectionRequest,
  removeConnection,
  getConnections,
  getInitials,
  type DemoUser
} from '@/lib/storage/chatStorage';

// Badge icon SVGs
const BadgeIcons: Record<string, React.ReactNode> = {
  flame: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c1.5 2.5 1 5-1 7 2-1 4 0 5 2s0 5-2 6c2-1 3-3 3-5 0-4-3-8-5-10zm-4 10c1 2 0 4-2 5 1 0 2-1 3-2 0 2-1 4-3 5 3 0 6-2 6-5 0-2-2-4-4-3z"/></svg>,
  book: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  users: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  heart: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  handshake: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15l4-4 4 4M17 15l4-4" /></svg>,
  star: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
};

// Achievement badge component
function Badge({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${color} rounded-full text-white text-xs font-medium shadow-sm`}>
      <span>{BadgeIcons[icon] || BadgeIcons.star}</span>
      <span>{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { stats } = useFlashcards();
  const { streakData } = useStreak();
  const { profile: wellnessProfile } = useWellness();
  const { userTribes, primaryTribe } = useTribes();

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connections, setConnections] = useState<DemoUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DemoUser[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [showAllConnections, setShowAllConnections] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadedProfile = getUserProfile();
      setProfile(loadedProfile);
      setConnections(getConnectedUsers());
      setPendingRequests(getPendingRequestUsers());
      setConnectionCount(getConnectionCount());
      setPendingCount(getPendingRequestCount());
      setIsLoading(false);
    }
  }, []);

  // Handle accepting a connection request
  const handleAcceptRequest = (userId: string) => {
    const allConnections = getConnections();
    const request = allConnections.find(
      c => c.status === 'pending' && c.userId === userId
    );
    if (request) {
      acceptConnectionRequest(request.id);
      setConnections(getConnectedUsers());
      setPendingRequests(getPendingRequestUsers());
      setConnectionCount(getConnectionCount());
      setPendingCount(getPendingRequestCount());
    }
  };

  // Handle declining a connection request
  const handleDeclineRequest = (userId: string) => {
    const allConnections = getConnections();
    const request = allConnections.find(
      c => c.status === 'pending' && c.userId === userId
    );
    if (request) {
      removeConnection(request.id);
      setPendingRequests(getPendingRequestUsers());
      setPendingCount(getPendingRequestCount());
    }
  };

// Handle avatar upload to Supabase Storage
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const userId = getCurrentUserId();
    if (!userId) {
      setAvatarError('Please log in to upload an avatar');
      return;
    }

    setAvatarUploading(true);
    setAvatarError(null);

    try {
      const result = await uploadAvatar(file, userId);

      if (result.success && result.url) {
        setProfile({ ...profile, avatar: result.url });
      } else {
        // Fallback to base64 for local storage if Supabase fails
        console.warn('Supabase upload failed, using local storage:', result.error);
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setProfile({ ...profile, avatar: base64 });
          setAvatarError('Photo saved locally (cloud sync unavailable)');
          setTimeout(() => setAvatarError(null), 5000);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setAvatarError('Failed to upload photo. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const initials = getUserInitials();

  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : 'Complete Your Profile';

  // Calculate achievements/badges - using SVG icons instead of emojis
  const badges = [];
  if (streakData && streakData.currentStreak >= 7) {
    badges.push({ icon: 'flame', label: '7+ Day Streak', color: 'from-[#A89070] to-[#8B7355]' });
  }
  if (stats.totalCards >= 100) {
    badges.push({ icon: 'book', label: '100+ Cards', color: 'from-[#5B7B6D] to-[#7FA08F]' });
  }
  if (userTribes.length >= 3) {
    badges.push({ icon: 'users', label: 'Social Butterfly', color: 'from-[#6B8B7D] to-[#8BA89A]' });
  }
  if ((wellnessProfile?.villagePoints?.donated || 0) >= 1000) {
    badges.push({ icon: 'heart', label: 'Philanthropist', color: 'from-[#8B7355] to-[#A89070]' });
  }
  if (connectionCount >= 10) {
    badges.push({ icon: 'handshake', label: 'Networker', color: 'from-[#5B7B6D] to-[#6B8B7D]' });
  }
  // Add default badge if none earned
  if (badges.length === 0) {
    badges.push({ icon: 'star', label: 'Getting Started', color: 'from-[#A89070] to-[#C4A77D]' });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Profile Header - Cover Photo Style */}
        <section className="relative mb-6">
          {/* Cover Photo */}
          <div className="h-40 md:h-56 rounded-t-3xl bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F] relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
              <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* Profile Info Card */}
          <div className="relative bg-white dark:bg-slate-800 rounded-b-3xl shadow-xl px-6 md:px-8 pb-6">
            {/* Avatar - Overlapping cover */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20">
              <div className="relative">
                <div
                  onClick={() => !avatarUploading && fileInputRef.current?.click()}
                  className={`
                    w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden
                    border-4 border-white dark:border-slate-800 shadow-xl
                    cursor-pointer group
                    ${avatarUploading ? 'opacity-70' : ''}
                  `}
                >
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#8B7355] flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                      {initials}
                    </div>
                  )}

                  {/* Upload loading overlay */}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Hover overlay to change photo */}
                  {!avatarUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={avatarUploading}
                />

                {/* Online indicator */}
                {!avatarUploading && (
                  <span className="absolute bottom-2 right-2 w-5 h-5 md:w-6 md:h-6 bg-[#5B7B6D] border-3 border-white dark:border-slate-800 rounded-full" />
                )}

                {/* Avatar error message */}
                {avatarError && (
                  <div className="absolute -bottom-8 left-0 right-0 text-center">
                    <span className="text-xs text-amber-500 dark:text-amber-400">{avatarError}</span>
                  </div>
                )}
              </div>

              {/* Name & Info */}
              <div className="flex-1 pt-2 md:pt-0 md:pb-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {displayName}
                  </h1>
                  <Link
                    href="/profile/settings"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors w-fit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </Link>
                </div>
                {profile?.currentYear && (
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {profile.currentYear} {profile.school ? `at ${profile.school}` : ''}
                  </p>
                )}
                {profile?.bio && (
                  <p className="text-slate-700 dark:text-slate-300 mt-2 max-w-xl">{profile.bio}</p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {badges.map((badge, i) => (
                    <Badge key={i} {...badge} />
                  ))}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="flex gap-6 md:gap-8 pt-4 md:pt-0 md:pb-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{connectionCount}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Connections</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{userTribes.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Groups</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{streakData?.currentStreak || 0}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Day Streak</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - About & Stats */}
          <div className="md:col-span-2 space-y-6">
            {/* Interested Specialties */}
            {profile?.interestedSpecialties && profile.interestedSpecialties.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  Interested Specialties
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interestedSpecialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-4 py-2 bg-gradient-to-r from-[#E8E0D5] to-[#F5F0E8] dark:from-[#3D4A44] dark:to-[#4A5A50] text-[#5B7B6D] dark:text-[#7FA08F] rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Study Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Study Progress
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-[#E8E0D5] to-[#F5F0E8] dark:from-[#3D4A44] dark:to-[#4A5A50] rounded-xl">
                  <p className="text-2xl font-bold text-[#5B7B6D] dark:text-[#7FA08F]">{stats.totalCards}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Total Cards</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#E8E0D5] to-[#F5F0E8] dark:from-[#3D4A44] dark:to-[#4A5A50] rounded-xl">
                  <p className="text-2xl font-bold text-[#5B7B6D] dark:text-[#7FA08F]">{stats.reviewCards}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Mastered</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] dark:from-[#3D3832] dark:to-[#4A4038] rounded-xl">
                  <p className="text-2xl font-bold text-[#8B7355] dark:text-[#C4A77D]">{streakData?.totalXP?.toLocaleString() || 0}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Total XP</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] dark:from-[#3D3832] dark:to-[#4A4038] rounded-xl">
                  <p className="text-2xl font-bold text-[#A89070] dark:text-[#C4A77D]">{wellnessProfile?.villagePoints?.available || 0}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Village Pts</p>
                </div>
              </div>

              {/* Level Progress */}
              {streakData && (
                <div className="mt-6 p-4 bg-[#F5F0E8] dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">Level {streakData.level}</span>
                      <span className="px-2 py-0.5 bg-[#E8E0D5] dark:bg-[#3D4A44] text-[#5B7B6D] dark:text-[#7FA08F] text-xs font-medium rounded-full">
                        {streakData.level >= 10 ? 'Expert' : streakData.level >= 5 ? 'Scholar' : 'Learner'}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {streakData.totalXP % 1000} / 1000 XP
                    </span>
                  </div>
                  <div className="h-3 bg-[#E8E0D5] dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#5B7B6D] to-[#7FA08F] rounded-full transition-all"
                      style={{ width: `${(streakData.totalXP % 1000) / 10}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* My Groups */}
            {userTribes.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    My Groups
                  </h2>
                  <Link
                    href="/groups"
                    className="text-sm text-[#8B7355] dark:text-[#C4A77D] hover:underline font-medium"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {userTribes.slice(0, 4).map((tribe) => (
                    <Link
                      key={tribe.id}
                      href={`/groups/${tribe.id}`}
                      className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tribe.color} flex items-center justify-center text-xl shadow-md`}
                      >
                        {tribe.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-white truncate">{tribe.name}</p>
                          {primaryTribe?.id === tribe.id && (
                            <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded">Primary</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{tribe.memberCount} members</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Impact Stats */}
            <div className="bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                Your Impact
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <p className="text-2xl font-bold">{(wellnessProfile?.villagePoints?.available || 0).toLocaleString()}</p>
                  <p className="text-white/70 text-xs">Village Points</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <p className="text-2xl font-bold">{(wellnessProfile?.villagePoints?.donated || 0).toLocaleString()}</p>
                  <p className="text-white/70 text-xs">Donated</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <p className="text-2xl font-bold">${((wellnessProfile?.villagePoints?.donated || 0) / 1000).toFixed(2)}</p>
                  <p className="text-white/70 text-xs">To Charity</p>
                </div>
              </div>
              <Link
                href="/impact/local"
                className="mt-4 block w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-center rounded-xl font-medium text-sm transition-colors"
              >
                Find Charities to Support
              </Link>
            </div>
          </div>

          {/* Right Column - Connections */}
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] dark:from-[#3D3832] dark:to-[#4A4038] rounded-2xl border border-[#C4A77D] dark:border-[#8B7355] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Requests
                  </h2>
                  <span className="px-2 py-0.5 bg-[#8B7355] text-white text-xs font-bold rounded-full">
                    {pendingCount}
                  </span>
                </div>
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#8B7355] flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.currentYear}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAcceptRequest(user.id)}
                          className="w-8 h-8 rounded-full bg-[#5B7B6D] hover:bg-[#4A6A5C] text-white flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(user.id)}
                          className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connections */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  Your Tribe
                </h2>
                <span className="text-sm font-medium text-[#5B7B6D] dark:text-[#7FA08F]">
                  {connectionCount}
                </span>
              </div>

              {connections.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {(showAllConnections ? connections : connections.slice(0, 5)).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#8B7355] flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          {user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5B7B6D] border-2 border-white dark:border-slate-800 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.specialty || user.currentYear}
                          </p>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-[#E8E0D5] dark:bg-[#3D4A44] hover:bg-[#D8D0C5] dark:hover:bg-[#4D5A54] text-[#5B7B6D] dark:text-[#7FA08F] flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {connections.length > 5 && (
                    <button
                      onClick={() => setShowAllConnections(!showAllConnections)}
                      className="w-full mt-4 py-2 text-sm font-medium text-[#5B7B6D] dark:text-[#7FA08F] hover:text-[#4A6A5C] dark:hover:text-[#8FA8A0] transition-colors"
                    >
                      {showAllConnections ? 'Show Less' : `View All ${connectionCount} Connections`}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">No connections yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start building your tribe!</p>
                </div>
              )}

              <Link
                href="/profile/settings"
                className="mt-4 block w-full px-4 py-2 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5A7A6C] text-white text-center rounded-xl font-medium text-sm transition-all shadow-md"
              >
                Find People to Connect
              </Link>
            </div>

            {/* Social Links */}
            {(profile?.linkedIn || profile?.twitter) && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Connect
                </h2>
                <div className="space-y-3">
                  {profile.linkedIn && (
                    <a
                      href={profile.linkedIn.startsWith('http') ? profile.linkedIn : `https://${profile.linkedIn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">LinkedIn</p>
                        <p className="text-xs text-slate-500 truncate">{profile.linkedIn}</p>
                      </div>
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={`https://twitter.com/${profile.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">X (Twitter)</p>
                        <p className="text-xs text-slate-500 truncate">{profile.twitter}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Settings Link */}
            <Link
              href="/profile/settings"
              className="block p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">Profile Settings</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Edit info, privacy & more</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
