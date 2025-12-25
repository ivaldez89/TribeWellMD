'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThreeColumnLayout, CARD_STYLES, ThreeColumnLayoutSkeleton } from '@/components/layout/ThreeColumnLayout';
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
import { ChatBubbleIcon } from '@/components/icons/MedicalIcons';

// Reflection type for My Journey
interface Reflection {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  visibility: 'private' | 'village' | 'connections';
  prompt?: string;
  likes?: number;
  comments?: number;
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

// Sample reflections for demo (10 entries for scrolling)
const SAMPLE_REFLECTIONS: Reflection[] = [
  {
    id: 'sample-1',
    content: "Just finished my first week of rotations in the ER. The adrenaline is real, but so is the exhaustion. Grateful for the attending who took time to teach us proper suturing techniques today. Small wins matter.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    visibility: 'village',
    prompt: "How did medicine feel for you today?",
    likes: 24,
    comments: 5
  },
  {
    id: 'sample-2',
    content: "Milestone: Passed Step 1! After months of studying, sleepless nights, and too much coffee, I finally did it. This journey is tough but moments like these remind me why I started.",
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    visibility: 'connections',
    prompt: "Mark a milestone or turning point in your journey.",
    likes: 156,
    comments: 32
  },
  {
    id: 'sample-3',
    content: "Had a patient thank me today for simply listening. Sometimes the most powerful medicine isn't a prescription - it's presence. Need to remember this on the hard days.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    visibility: 'village',
    prompt: "What's one moment from today you want to remember?",
    likes: 89,
    comments: 12
  },
  {
    id: 'sample-4',
    content: "Struggling with imposter syndrome lately. Everyone around me seems so confident while I'm still questioning if I belong here. Talked to a senior resident who said they still feel this way sometimes. It helps to know I'm not alone.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    visibility: 'private',
    prompt: "What's been challenging you most this week?",
    likes: 0,
    comments: 0
  },
  {
    id: 'sample-5',
    content: "Study group session was incredibly productive today. We tackled cardiology together and finally made sense of heart murmurs. The power of learning together cannot be overstated.",
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    visibility: 'connections',
    prompt: "What's something you're proud of right now?",
    likes: 45,
    comments: 8
  },
  {
    id: 'sample-6',
    content: "Attended a wellness workshop through TribeWellMD today. Learning to balance medicine with mental health is just as important as learning pathophysiology. Self-care isn't selfish.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    visibility: 'village',
    likes: 67,
    comments: 14
  },
  {
    id: 'sample-7',
    content: "First time leading morning rounds today. Nervous doesn't begin to describe it, but the team was supportive. Growth happens outside our comfort zone.",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    visibility: 'connections',
    prompt: "What did you learn about yourself recently?",
    likes: 78,
    comments: 19
  },
  {
    id: 'sample-8',
    content: "Donated my earned wellness points to the village charity today. It feels amazing knowing that my study efforts are also helping others. Medicine is about community.",
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    visibility: 'village',
    likes: 112,
    comments: 23
  },
  {
    id: 'sample-9',
    content: "Watched my first surgery today - a laparoscopic cholecystectomy. The precision and teamwork in the OR was incredible. Thinking surgery might be calling my name.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    visibility: 'connections',
    prompt: "How did medicine feel for you today?",
    likes: 93,
    comments: 27
  },
  {
    id: 'sample-10',
    content: "One month into medical school. Looking back at my first day photos and realizing how much has changed. The fear has transformed into excitement. Still scared, but now I know that's okay.",
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    visibility: 'village',
    prompt: "Mark a milestone or turning point in your journey.",
    likes: 201,
    comments: 45
  }
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
    createdAt: new Date(),
    likes: 0,
    comments: 0
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

      // Load reflections and combine with samples
      const userReflections = getReflections();
      setReflections([...userReflections, ...SAMPLE_REFLECTIONS]);

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
      <ThreeColumnLayout
        isLoading={true}
        loadingContent={<ThreeColumnLayoutSkeleton />}
      >
        <div />
      </ThreeColumnLayout>
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

  // Format time ago for reflections
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    if (days < 30) return `${Math.floor(days / 7)}w`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format numbers (like 1.2k)
  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  // Mobile Header
  const mobileHeader = (
    <div className={CARD_STYLES.containerWithPadding}>
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Link href="/profile/settings">
          <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#5B7B6D]/20 shadow-md bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F]">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                {initials}
              </div>
            )}
          </div>
        </Link>

        {/* Name & Role */}
        <div className="flex-1 min-w-0">
          <Link href="/profile/settings" className="hover:underline">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{displayName}</h2>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{getRoleLabel()}</p>
        </div>

        {/* Stats - compact */}
        <div className="flex gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-[#5B7B6D] dark:text-[#7FA08F]">{connectionCount}</p>
            <p className="text-[10px] text-slate-400">Friends</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#C4A77D] dark:text-[#D4B78D]">{streakData?.currentStreak || 0}</p>
            <p className="text-[10px] text-slate-400">Streak</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Left Sidebar
  const leftSidebar = (
    <>
      {/* Profile Card */}
      <div className={CARD_STYLES.container + ' overflow-hidden'}>
        {/* Cover gradient */}
        <div className="h-20 bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#C4A77D]" />

        {/* Avatar & Name */}
        <div className="px-4 pb-4 -mt-10">
          <Link href="/profile/settings" className="block">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F]">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
            </div>
          </Link>
          <Link href="/profile/settings" className="block mt-3 hover:underline">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{displayName}</h2>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">{getRoleLabel()}</p>
          {profile?.school && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{profile.school}</p>
          )}
        </div>

        {/* Stats */}
        <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-[#5B7B6D] dark:text-[#7FA08F]">{connectionCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Connections</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#C4A77D] dark:text-[#D4B78D]">{streakData?.currentStreak || 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Day Streak</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#8B7355] dark:text-[#A89070]">{stats.reviewCards || 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reviewed</p>
          </div>
        </div>
      </div>

      {/* Quick Links - Study Tools */}
      <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-3')}>
        <h3 className="font-semibold text-slate-900 dark:text-white px-3 py-2 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          Study Tools
        </h3>
        <nav className="space-y-1">
          <Link href="/flashcards" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#C4A77D]">Flashcards</span>
          </Link>

          <Link href="/cases" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#5B7B6D]">Cases</span>
          </Link>

          <Link href="/progress/rapid-review" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-orange-500">Rapid Review</span>
          </Link>

          <Link href="/progress/rooms" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#A89070] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#8B7355]">Study Group</span>
          </Link>
        </nav>
      </div>

      {/* Wellness */}
      <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-3')}>
        <h3 className="font-semibold text-slate-900 dark:text-white px-3 py-2 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          Wellness
        </h3>
        <nav className="space-y-1">
          <Link href="/wellness" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7FA08F] to-[#9FBFAF] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#7FA08F]">Daily Check-In</span>
          </Link>

          <Link href="/wellness/journey" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#5B7B6D]">My Journey</span>
          </Link>

          <Link href="/wellness/impact" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#C4A77D]">Social Impact</span>
          </Link>

          <Link href="/groups?filter=wellness" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6B8B7D] to-[#8BA89A] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#6B8B7D]">Wellness Groups</span>
          </Link>
        </nav>
      </div>

      {/* Community */}
      <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-3')}>
        <h3 className="font-semibold text-slate-900 dark:text-white px-3 py-2 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          Community
        </h3>
        <nav className="space-y-1">
          <Link href="/village" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#6B8B7D] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#5B7B6D]">My Village</span>
          </Link>

          <Link href="/groups" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#A89070] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#8B7355]">Explore Groups</span>
          </Link>

          <Link href="/connections" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#C4A77D]">Connections</span>
          </Link>

          <Link href="/leaderboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-amber-500">Leaderboard</span>
          </Link>
        </nav>
      </div>

      {/* Groups */}
      {userTribes.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Your Groups</h3>
            <Link href="/groups" className="text-sm text-[#5B7B6D] hover:underline">See all</Link>
          </div>
          <div className="space-y-2">
            {userTribes.slice(0, 3).map((tribe) => (
              <Link
                key={tribe.id}
                href={`/groups/${tribe.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tribe.color || 'from-orange-400 to-amber-500'} flex items-center justify-center text-lg`}>
                  <span className="text-lg">{tribe.icon || ''}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{tribe.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tribe.memberCount} members</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {profile?.interestedSpecialties && profile.interestedSpecialties.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interestedSpecialties.map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1.5 bg-gradient-to-r from-[#E8E0D5] to-[#F5F0E8] dark:from-[#3D4A44] dark:to-[#4A5A50] text-[#5B7B6D] dark:text-[#7FA08F] rounded-full text-sm font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Right Sidebar
  const rightSidebar = (
    <>
      {/* Daily Prompt */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <ChatBubbleIcon className="w-5 h-5 text-[#5B7B6D]" />
          Daily Prompt
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
          &ldquo;{REFLECTION_PROMPTS[currentPromptIndex]}&rdquo;
        </p>
        <button
          onClick={() => setShowReflectionForm(true)}
          className="mt-3 w-full py-2 text-sm font-medium text-[#5B7B6D] hover:bg-[#5B7B6D]/10 rounded-lg transition-colors"
        >
          Write a reflection
        </button>
      </div>

      {/* Connections */}
      {connections.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Connections</h3>
            <Link href="/connections" className="text-sm text-[#5B7B6D] hover:underline">See all</Link>
          </div>
          <div className="space-y-3">
            {connections.slice(0, 5).map((connection) => {
              const fullName = `${connection.firstName} ${connection.lastName}`;
              return (
                <div key={connection.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#5B7B6D] to-[#8B7355]">
                      {connection.avatar ? (
                        <img src={connection.avatar} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {connection.firstName[0]}{connection.lastName[0]}
                        </div>
                      )}
                    </div>
                    {connection.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{fullName}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Study Stats */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">This Week</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Cards reviewed</span>
            <span className="font-semibold text-[#5B7B6D]">{stats.reviewCards || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Current streak</span>
            <span className="font-semibold text-[#C4A77D]">{streakData?.currentStreak || 0} days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Weekly goal</span>
            <span className="font-semibold text-pink-500">
              {wellnessProfile?.weeklyGoal ? Math.round((wellnessProfile.weeklyGoal.completed / wellnessProfile.weeklyGoal.minutes) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <ThreeColumnLayout
      mobileHeader={mobileHeader}
      leftSidebar={leftSidebar}
      rightSidebar={rightSidebar}
    >
      {/* Reflection Form Modal */}
      {showReflectionForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create Reflection</h3>
              <button
                onClick={() => {
                  setShowReflectionForm(false);
                  setNewReflectionContent('');
                  setSelectedImage(null);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {/* User info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F]">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{displayName}</p>
                  <select
                    value={reflectionVisibility}
                    onChange={(e) => setReflectionVisibility(e.target.value as 'private' | 'village' | 'connections')}
                    className="text-xs bg-slate-100 dark:bg-slate-700 border-0 rounded px-2 py-1 text-slate-600 dark:text-slate-400"
                  >
                    <option value="private">Only me</option>
                    <option value="village">My Village</option>
                    <option value="connections">My Connections</option>
                  </select>
                </div>
              </div>

              {/* Prompt */}
              <div className="mb-4 p-3 bg-gradient-to-r from-[#5B7B6D]/10 to-[#C4A77D]/10 dark:from-[#5B7B6D]/20 dark:to-[#C4A77D]/20 rounded-xl border border-[#5B7B6D]/20">
                <p className="text-sm text-[#5B7B6D] dark:text-[#7FA08F] italic">
                  &ldquo;{REFLECTION_PROMPTS[currentPromptIndex]}&rdquo;
                </p>
              </div>

              {/* Text Input */}
              <textarea
                value={newReflectionContent}
                onChange={(e) => setNewReflectionContent(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-0 py-2 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
                rows={4}
                autoFocus
              />

              {/* Selected Image Preview */}
              {selectedImage && (
                <div className="mt-3 relative inline-block">
                  <img src={selectedImage} alt="Selected" className="max-h-48 rounded-xl" />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-slate-900/80 text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Add Photo Button */}
              <div className="mt-4 p-3 border border-slate-200 dark:border-slate-600 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Add to your reflection</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-4 pb-4">
              <button
                onClick={handleAddReflection}
                disabled={!newReflectionContent.trim() && !selectedImage}
                className="w-full py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6A5C] hover:to-[#5B7B6D] disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Card */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex-shrink-0">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {initials}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowReflectionForm(true)}
            className="flex-1 text-left px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
          >
            What&apos;s on your mind, {profile?.firstName || 'there'}?
          </button>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => {
              setShowReflectionForm(true);
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Photo
          </button>
          <button
            onClick={() => setShowReflectionForm(true)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            <svg className="w-5 h-5 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Milestone
          </button>
          <button
            onClick={() => setShowReflectionForm(true)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Reflect
          </button>
        </div>
      </div>

      {/* Journey Header */}
      <div className="flex items-center gap-2 px-2">
        <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Journey</h2>
      </div>

      {/* Reflections Feed */}
      {reflections.map((reflection) => (
        <article
          key={reflection.id}
          className={CARD_STYLES.container + ' overflow-hidden'}
        >
          {/* Post Header */}
          <div className="p-4 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#5B7B6D] to-[#8B7355]">
                  {profile?.avatar && !reflection.id.startsWith('sample') ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                      {initials}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{displayName}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatTimeAgo(reflection.createdAt)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      {reflection.visibility === 'private' ? (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : reflection.visibility === 'village' ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                      {reflection.visibility === 'private' ? 'Only me' : reflection.visibility === 'village' ? 'Village' : 'Connections'}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>

            {/* Prompt if present */}
            {reflection.prompt && (
              <p className="mt-3 text-sm text-[#5B7B6D] dark:text-[#7FA08F] italic">
                &ldquo;{reflection.prompt}&rdquo;
              </p>
            )}

            {/* Content */}
            <p className="mt-3 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {reflection.content}
            </p>
          </div>

          {/* Image if present */}
          {reflection.imageUrl && (
            <div className="mt-3">
              <img
                src={reflection.imageUrl}
                alt="Reflection"
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Engagement Stats */}
          {(reflection.likes !== undefined && reflection.likes > 0) && (
            <div className="px-4 py-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  <span className="w-5 h-5 rounded-full bg-[#5B7B6D] flex items-center justify-center text-white text-xs">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </span>
                </div>
                <span>{formatNumber(reflection.likes)}</span>
              </div>
              {reflection.comments !== undefined && reflection.comments > 0 && (
                <span>{formatNumber(reflection.comments)} comments</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-around">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400 font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="hidden sm:inline">Support</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400 font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="hidden sm:inline">Comment</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400 font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </article>
      ))}

      {/* End of feed */}
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p className="text-sm">You&apos;re all caught up!</p>
      </div>
    </ThreeColumnLayout>
  );
}
