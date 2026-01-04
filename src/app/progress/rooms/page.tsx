'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThreeColumnLayout, CARD_STYLES, ThreeColumnLayoutSkeleton } from '@/components/layout/ThreeColumnLayout';
import { CreateRoomModal } from '@/components/study-room';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { useStudyRooms } from '@/hooks/useStudyRoom';
import { StarIcon, BookOpenIcon } from '@/components/icons/MedicalIcons';
import {
  createStudySession,
  joinStudySession,
  getSessionByInviteCode,
  getDemoSessions,
} from '@/lib/storage/studyRoomStorage';
import { getUserProfile } from '@/lib/storage/profileStorage';
import { createClient } from '@/lib/supabase/client';
import { StudySession, CreateSessionData, formatTimerDisplay } from '@/types/studyRoom';
import { LightbulbIcon } from '@/components/icons/MedicalIcons';

export default function StudyRoomsPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Get user info
  const [userId, setUserId] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }

      const profile = getUserProfile();
      if (profile?.firstName && profile?.lastName) {
        setUserDisplayName(`${profile.firstName} ${profile.lastName}`);
      } else {
        setUserDisplayName('Anonymous');
      }
    };
    fetchUser();
  }, []);

  // Get rooms
  const { publicRooms, myRooms, isLoading, refresh } = useStudyRooms(userId || undefined);

  // Demo rooms for non-authenticated users
  const [demoRooms, setDemoRooms] = useState<StudySession[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setDemoRooms(getDemoSessions());
    }
  }, [isAuthenticated]);

  const handleCreateRoom = async (data: CreateSessionData) => {
    if (!userId) {
      console.error('No user ID - user may not be authenticated');
      alert('Please log in to create a room');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating room with userId:', userId, 'displayName:', userDisplayName);
      const { session, error } = await createStudySession(data, userId, userDisplayName);

      if (error) {
        console.error('Error creating room:', error);
        alert(`Failed to create room: ${error}`);
        return;
      }

      if (session) {
        console.log('Room created successfully:', session.id);
        setShowCreateModal(false);
        router.push(`/progress/room/${session.id}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim() || !userId) return;

    setIsJoining(true);
    setJoinError(null);

    try {
      const session = await getSessionByInviteCode(joinCode.trim().toUpperCase());

      if (!session) {
        setJoinError('Room not found. Check the invite code.');
        return;
      }

      const { success, error } = await joinStudySession(
        session.id,
        userId,
        userDisplayName
      );

      if (!success) {
        setJoinError(error || 'Failed to join room');
        return;
      }

      router.push(`/progress/room/${session.id}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinRoom = async (sessionId: string) => {
    if (!userId) {
      router.push('/login');
      return;
    }

    const { success } = await joinStudySession(sessionId, userId, userDisplayName);
    if (success) {
      router.push(`/progress/room/${sessionId}`);
    }
  };

  const displayRooms = isAuthenticated ? publicRooms : demoRooms;

  // Mobile Header
  const mobileHeader = (
    <div className={CARD_STYLES.containerWithPadding}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Pocket Time</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{displayRooms.length} active rooms</p>
          </div>
        </div>
        <button
          onClick={() => (isAuthenticated ? setShowCreateModal(true) : router.push('/login'))}
          className="p-2 bg-[#5B7B6D] text-white rounded-xl"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );

  // Left Sidebar
  const leftSidebar = (
    <>
      {/* Header Card */}
      <div className={CARD_STYLES.container + ' overflow-hidden'}>
        <div className="h-16 bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#7FA08F] flex items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Pocket Time</h2>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-2 text-center mb-4">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#5B7B6D]">{displayRooms.length}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Active</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#C4A77D]">{myRooms.length}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">My Rooms</p>
            </div>
          </div>

          <button
            onClick={() => (isAuthenticated ? setShowCreateModal(true) : router.push('/login'))}
            className="w-full py-2.5 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6B5D] hover:to-[#5B7B6D] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Room
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-3')}>
        <h3 className="font-semibold text-slate-900 dark:text-white px-3 py-2 text-sm">Quick Links</h3>
        <nav className="space-y-1">
          <Link href="/flashcards" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#C4A77D]">Flashcards</span>
          </Link>

          <Link href="/progress/rapid-review" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-orange-500">Rapid Review</span>
          </Link>

          <Link href="/calendar" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#A89070] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#8B7355]">Calendar</span>
          </Link>
        </nav>
      </div>

      {/* My Rooms (if any) */}
      {isAuthenticated && myRooms.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <StarIcon className="w-5 h-5 text-[#C4A77D]" />
            My Active Rooms
          </h3>
          <div className="space-y-2">
            {myRooms.slice(0, 3).map((room) => (
              <button
                key={room.id}
                onClick={() => router.push(`/progress/room/${room.id}`)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
                  <BookOpenIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{room.name}</p>
                  <p className="text-xs text-slate-500">{room.participantCount || 1} members</p>
                </div>
                {room.timerIsRunning && (
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Right Sidebar
  const rightSidebar = (
    <>
      {/* Join by Code */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Join by Code</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase());
              setJoinError(null);
            }}
            placeholder="Enter 6-letter code"
            maxLength={6}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B7B6D] uppercase tracking-widest font-mono text-center"
          />
          <button
            onClick={handleJoinByCode}
            disabled={joinCode.length < 6 || isJoining || !isAuthenticated}
            className="w-full py-2.5 bg-[#C4A77D] hover:bg-[#A89070] disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
          {joinError && (
            <p className="text-sm text-red-500">{joinError}</p>
          )}
          {!isAuthenticated && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <Link href="/login" className="text-[#5B7B6D] hover:underline">Sign in</Link> to join rooms
            </p>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <LightbulbIcon className="w-5 h-5 text-[#F5D76E]" />
          How It Works
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#5B7B6D] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <p className="text-sm text-slate-600 dark:text-slate-400">Start or join Pocket Time</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#5B7B6D] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <p className="text-sm text-slate-600 dark:text-slate-400">Use shared Pomodoro timers</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#5B7B6D] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
            <p className="text-sm text-slate-600 dark:text-slate-400">Chat and stay accountable</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Study Tips</h3>
        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-[#5B7B6D]">Pro tip:</span> Share your room&apos;s invite code with study partners!
          </p>
        </div>
      </div>
    </>
  );

  if (isLoading) {
    return (
      <ThreeColumnLayout
        isLoading={true}
        loadingContent={<ThreeColumnLayoutSkeleton />}
      >
        <div />
      </ThreeColumnLayout>
    );
  }

  return (
    <ThreeColumnLayout
      mobileHeader={mobileHeader}
      leftSidebar={leftSidebar}
      rightSidebar={rightSidebar}
    >
      {/* Page Header */}
      <div className={CARD_STYLES.containerWithPadding}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Public Rooms</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Join a room to study together with shared timers
            </p>
          </div>
          <button
            onClick={() => refresh()}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Refresh rooms"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      {displayRooms.length === 0 ? (
        <div className={CARD_STYLES.containerWithPadding + ' text-center py-8'}>
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No active rooms</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Be the first to start Pocket Time!</p>
          <button
            onClick={() => (isAuthenticated ? setShowCreateModal(true) : router.push('/login'))}
            className="px-5 py-2 bg-[#5B7B6D] hover:bg-[#4A6A5C] text-white font-medium rounded-xl transition-colors"
          >
            Create Room
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayRooms.map((room) => (
            <RoomCard key={room.id} room={room} onJoin={() => handleJoinRoom(room.id)} />
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRoom}
        isCreating={isCreating}
      />
    </ThreeColumnLayout>
  );
}

// Room Card Component
function RoomCard({
  room,
  onJoin,
  isMember = false,
}: {
  room: StudySession;
  onJoin: () => void;
  isMember?: boolean;
}) {
  return (
    <div className={CARD_STYLES.container + ' overflow-hidden'}>
      {/* Header with gradient */}
      <div className="h-2 bg-gradient-to-r from-[#C4A77D] to-[#A89070]" />

      <div className="p-4">
        {/* Title & Status */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate flex-1">
            {room.name}
          </h3>
          {room.timerIsRunning && (
            <span className="ml-2 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          {/* Participants */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{room.participantCount || 1}/{room.maxParticipants}</span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{room.timerSessionsCompleted} completed</span>
          </div>

          {/* Timer display if running */}
          {room.timerIsRunning && (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-mono text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatTimerDisplay(room.timerRemaining)}</span>
            </div>
          )}
        </div>

        {/* Join Button */}
        <button
          onClick={onJoin}
          className={`w-full py-2.5 font-medium rounded-xl transition-colors ${
            isMember
              ? 'bg-[#C4A77D] hover:bg-[#A89070] text-white'
              : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white'
          }`}
        >
          {isMember ? 'Continue Studying' : 'Join Room'}
        </button>
      </div>
    </div>
  );
}
