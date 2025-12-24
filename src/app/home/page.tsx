'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Icons } from '@/components/ui/Icons';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useStreak } from '@/hooks/useStreak';
import { useWellness } from '@/hooks/useWellness';
import { useTribes } from '@/hooks/useTribes';
import { useIsAuthenticated } from '@/hooks/useAuth';
import {
  getUserProfile,
  getUserInitials,
  getCurrentVillageId,
  type UserProfile
} from '@/lib/storage/profileStorage';
import {
  getConnectedUsers,
  getConnectionCount,
  type DemoUser
} from '@/lib/storage/chatStorage';
import { getCharityById } from '@/data/charities';

// Reflection type for My Journey
interface Reflection {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  visibility: 'private' | 'village' | 'connections';
  prompt?: string;
}

// Reflection prompts that rotate
const REFLECTION_PROMPTS = [
  "What's one moment from today you want to remember?",
  "What did you learn about yourself recently?",
  "What's been challenging you most this week?",
  "What's something you're proud of right now?",
  "How did medicine feel for you today?",
  "Mark a milestone or turning point in your journey.",
];

// Get stored reflections
function getReflections(): Reflection[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tribewellmd_reflections');
  if (stored) {
    const reflections = JSON.parse(stored);
    return reflections.map((r: Reflection) => ({
      ...r,
      createdAt: new Date(r.createdAt)
    }));
  }
  return [];
}

// Save reflection
function saveReflection(reflection: Omit<Reflection, 'id' | 'createdAt'>): Reflection {
  const reflections = getReflections();
  const newReflection: Reflection = {
    ...reflection,
    id: `reflection-${Date.now()}`,
    createdAt: new Date()
  };
  reflections.unshift(newReflection);
  localStorage.setItem('tribewellmd_reflections', JSON.stringify(reflections));
  return newReflection;
}

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { stats } = useFlashcards();
  const { streakData } = useStreak();
  const { profile: wellnessProfile } = useWellness();
  const { userTribes } = useTribes();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connections, setConnections] = useState<DemoUser[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [villageCharity, setVillageCharity] = useState<{ shortName: string; id: string } | null>(null);

  // My Journey state
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [newReflectionContent, setNewReflectionContent] = useState('');
  const [reflectionVisibility, setReflectionVisibility] = useState<'private' | 'village' | 'connections'>('private');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load user data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadedProfile = getUserProfile();
      setProfile(loadedProfile);

      setConnections(getConnectedUsers());
      setConnectionCount(getConnectionCount());

      // Load reflections
      setReflections(getReflections());

      // Rotate prompt daily
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      setCurrentPromptIndex(dayOfYear % REFLECTION_PROMPTS.length);

      // Get current village
      const villageId = getCurrentVillageId();
      if (villageId) {
        const charity = getCharityById(villageId);
        if (charity) {
          setVillageCharity({ shortName: charity.shortName, id: villageId });
        }
      }

      setIsLoading(false);
    }
  }, []);

  // Handle adding a reflection
  const handleAddReflection = () => {
    if (!newReflectionContent.trim() && !selectedImage) return;

    const reflection = saveReflection({
      content: newReflectionContent.trim(),
      imageUrl: selectedImage || undefined,
      visibility: reflectionVisibility,
      prompt: REFLECTION_PROMPTS[currentPromptIndex]
    });

    setReflections([reflection, ...reflections]);
    setNewReflectionContent('');
    setSelectedImage(null);
    setShowReflectionForm(false);
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const initials = getUserInitials();

  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#C4A77D] dark:bg-slate-900">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-[#B89B78]/50 dark:bg-slate-800 rounded-3xl" />
            <div className="h-96 bg-[#B89B78]/50 dark:bg-slate-800 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : 'Complete Your Profile';

  // Get role label
  const getRoleLabel = () => {
    if (profile?.role) return profile.role;
    if (profile?.currentYear) return profile.currentYear;
    return 'Medicine Tribe Member';
  };

  // Get location (using school as location)
  const getLocation = () => {
    if (profile?.school) return profile.school;
    return '';
  };

  // Format time ago for reflections
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#C4A77D] dark:bg-slate-900">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* ===== MEMBER OVERVIEW SECTION ===== */}
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
              <Link href="/profile" className="relative group">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#8B7355] flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-2 right-2 w-5 h-5 md:w-6 md:h-6 bg-[#5B7B6D] border-3 border-white dark:border-slate-800 rounded-full" />
              </Link>

              {/* Name & Basic Info */}
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
                <p className="text-slate-600 dark:text-slate-400 mt-1">{getRoleLabel()}</p>
                {getLocation() && (
                  <p className="text-slate-500 dark:text-slate-500 text-sm mt-0.5 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {getLocation()}
                  </p>
                )}
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

            {/* Extended Profile Info */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Interests */}
                {profile?.interestedSpecialties && profile.interestedSpecialties.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interestedSpecialties.slice(0, 4).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1 bg-gradient-to-r from-[#E8E0D5] to-[#F5F0E8] dark:from-[#3D4A44] dark:to-[#4A5A50] text-[#5B7B6D] dark:text-[#7FA08F] rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups */}
                {userTribes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Groups</h3>
                    <div className="flex flex-wrap gap-2">
                      {userTribes.slice(0, 3).map((tribe) => (
                        <Link
                          key={tribe.id}
                          href={`/groups/${tribe.id}`}
                          className="px-3 py-1 bg-[#F5EFE6] dark:bg-slate-700 hover:bg-[#E8DFD0] dark:hover:bg-slate-600 text-[#6B5344] dark:text-slate-300 rounded-full text-sm font-medium transition-colors"
                        >
                          {tribe.name}
                        </Link>
                      ))}
                      {userTribes.length > 3 && (
                        <Link
                          href="/groups"
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-sm"
                        >
                          +{userTribes.length - 3} more
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Village */}
                {villageCharity && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Village</h3>
                    <Link
                      href={`/village/${villageCharity.id}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#5B7B6D]/10 to-[#6B8B7D]/10 dark:from-[#5B7B6D]/20 dark:to-[#6B8B7D]/20 text-[#5B7B6D] dark:text-[#7FA08F] rounded-lg text-sm font-medium hover:from-[#5B7B6D]/20 hover:to-[#6B8B7D]/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {villageCharity.shortName}
                    </Link>
                  </div>
                )}

                {/* External Links */}
                {(profile?.linkedIn || profile?.twitter) && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Connect</h3>
                    <div className="flex gap-2">
                      {profile.linkedIn && (
                        <a
                          href={profile.linkedIn.startsWith('http') ? profile.linkedIn : `https://${profile.linkedIn}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                      {profile.twitter && (
                        <a
                          href={`https://twitter.com/${profile.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===== MY JOURNEY SECTION ===== */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  My Journey
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  A personal space to reflect, share moments, and mark milestones in your journey through medicine.
                </p>
              </div>
              <button
                onClick={() => setShowReflectionForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-medium rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Reflection
              </button>
            </div>
          </div>

          {/* Reflection Form */}
          {showReflectionForm && (
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              {/* Prompt */}
              <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  "{REFLECTION_PROMPTS[currentPromptIndex]}"
                </p>
              </div>

              {/* Text Input */}
              <textarea
                value={newReflectionContent}
                onChange={(e) => setNewReflectionContent(e.target.value)}
                placeholder="Write your reflection..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#5B7B6D] text-slate-900 dark:text-white placeholder:text-slate-400"
                rows={4}
                autoFocus
              />

              {/* Selected Image Preview */}
              {selectedImage && (
                <div className="mt-3 relative inline-block">
                  <img src={selectedImage} alt="Selected" className="max-h-40 rounded-xl" />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Add Photo */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Visibility Selector */}
                  <select
                    value={reflectionVisibility}
                    onChange={(e) => setReflectionVisibility(e.target.value as 'private' | 'village' | 'connections')}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7B6D]"
                  >
                    <option value="private">Private</option>
                    <option value="village">My Village</option>
                    <option value="connections">My Connections</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowReflectionForm(false);
                      setNewReflectionContent('');
                      setSelectedImage(null);
                    }}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddReflection}
                    disabled={!newReflectionContent.trim() && !selectedImage}
                    className="px-4 py-2 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl transition-all shadow-md"
                  >
                    Save Reflection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reflections List */}
          <div className="p-6">
            {reflections.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E8E0D5] to-[#F5F0E8] dark:from-[#3D4A44] dark:to-[#4A5A50] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#8B7355] dark:text-[#A89070]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  You haven&apos;t added any reflections yet.
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                  This is your space to capture moments, milestones, and thoughts as you move through medicine.
                </p>
                <button
                  onClick={() => setShowReflectionForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] text-white font-medium rounded-xl transition-all shadow-md"
                >
                  Add Your First Reflection
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {reflections.map((reflection) => (
                  <div
                    key={reflection.id}
                    className="p-5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600"
                  >
                    {/* Reflection Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B7B6D] to-[#8B7355] flex items-center justify-center text-white font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{displayName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{formatTimeAgo(reflection.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        reflection.visibility === 'private'
                          ? 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                          : reflection.visibility === 'village'
                            ? 'bg-[#5B7B6D]/10 text-[#5B7B6D]'
                            : 'bg-[#8B7355]/10 text-[#8B7355]'
                      }`}>
                        {reflection.visibility === 'private' ? 'Private' : reflection.visibility === 'village' ? 'Village' : 'Connections'}
                      </span>
                    </div>

                    {/* Prompt if present */}
                    {reflection.prompt && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-2">
                        "{reflection.prompt}"
                      </p>
                    )}

                    {/* Content */}
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {reflection.content}
                    </p>

                    {/* Image if present */}
                    {reflection.imageUrl && (
                      <div className="mt-4">
                        <img
                          src={reflection.imageUrl}
                          alt="Reflection"
                          className="max-h-64 rounded-xl object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
