'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { CreateRoomModal } from '@/components/study-room';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { useStudyRooms } from '@/hooks/useStudyRoom';
import {
  createStudySession,
  joinStudySession,
  getSessionByInviteCode,
  getDemoSessions,
} from '@/lib/storage/studyRoomStorage';
import { getUserProfile } from '@/lib/storage/profileStorage';
import { createClient } from '@/lib/supabase/client';
import { StudySession, CreateSessionData, formatTimerDisplay } from '@/types/studyRoom';

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

  return (
    <div className="min-h-screen bg-[#E8DFD0] dark:bg-slate-900 relative">
      {/* Subtle organic pattern overlay on sides */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#D4C4B0]/30 to-transparent" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#D4C4B0]/30 to-transparent" />
      </div>
      <Header />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3D5A4C] dark:text-white flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-[#5B7B6D] to-[#6B8B7D] rounded-xl text-white shadow-lg shadow-[#5B7B6D]/25">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </span>
              Study Rooms
            </h1>
            <p className="text-[#6B5344]/80 dark:text-[#C4A77D] mt-1">
              Join a room to study together with shared timers and chat
            </p>
          </div>

          <button
            onClick={() => (isAuthenticated ? setShowCreateModal(true) : router.push('/login'))}
            className="px-5 py-2.5 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] hover:from-[#4A6B5D] hover:to-[#5B7B6D] text-white font-medium rounded-xl transition-all shadow-md shadow-[#5B7B6D]/25 hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Room
          </button>
        </div>

        {/* Join by Code */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0] dark:border-[#C4A77D]/30 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#8B7355] dark:text-[#C4A77D] mb-1">
                Join by Invite Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setJoinError(null);
                  }}
                  placeholder="Enter 6-letter code"
                  maxLength={6}
                  className="flex-1 px-4 py-2.5 bg-[#E8E0D5] dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white placeholder-[#A89070] focus:outline-none focus:ring-2 focus:ring-[#C4A77D] uppercase tracking-widest font-mono"
                />
                <button
                  onClick={handleJoinByCode}
                  disabled={joinCode.length < 6 || isJoining || !isAuthenticated}
                  className="px-5 py-2.5 bg-[#C4A77D] hover:bg-[#A89070] disabled:bg-[#D4C4B0] dark:disabled:bg-slate-600 text-white font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  {isJoining ? 'Joining...' : 'Join'}
                </button>
              </div>
              {joinError && (
                <p className="text-sm text-red-500 mt-1">{joinError}</p>
              )}
              {!isAuthenticated && (
                <p className="text-xs text-[#A89070] dark:text-[#C4A77D] mt-1">
                  <Link href="/login" className="text-[#5B7B6D] hover:underline dark:text-[#C4A77D]">
                    Sign in
                  </Link>{' '}
                  to join rooms
                </p>
              )}
            </div>
          </div>
        </div>

        {/* My Rooms */}
        {isAuthenticated && myRooms.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-[#C4A77D]">★</span>
              My Active Rooms
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={() => router.push(`/progress/room/${room.id}`)}
                  isMember
                />
              ))}
            </div>
          </section>
        )}

        {/* Public Rooms */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Public Rooms
          </h2>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0] dark:border-[#C4A77D]/30 p-5 animate-pulse"
                >
                  <div className="h-6 bg-[#E8E0D5] dark:bg-slate-700 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-[#E8E0D5] dark:bg-slate-700 rounded w-1/2 mb-4" />
                  <div className="h-10 bg-[#E8E0D5] dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : displayRooms.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0] dark:border-[#C4A77D]/30 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F0E8] dark:bg-[#5B7B6D]/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#A89070] dark:text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                No active rooms
              </h3>
              <p className="text-[#8B7355] dark:text-[#C4A77D] mb-4">
                Be the first to create a study room!
              </p>
              <button
                onClick={() => (isAuthenticated ? setShowCreateModal(true) : router.push('/login'))}
                className="px-5 py-2 bg-[#C4A77D] hover:bg-[#A89070] text-white font-medium rounded-xl transition-colors"
              >
                Create Room
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayRooms.map((room) => (
                <RoomCard key={room.id} room={room} onJoin={() => handleJoinRoom(room.id)} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRoom}
        isCreating={isCreating}
      />
    </div>
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0] dark:border-[#C4A77D]/30 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header with gradient */}
      <div className="h-2 bg-gradient-to-r from-[#C4A77D] to-[#A89070]" />

      <div className="p-5">
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
          <p className="text-sm text-[#8B7355] dark:text-[#C4A77D] mb-3 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          {/* Participants */}
          <div className="flex items-center gap-1.5 text-[#8B7355] dark:text-[#C4A77D]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{room.participantCount || 1}/{room.maxParticipants}</span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-[#8B7355] dark:text-[#C4A77D]">
            <span>🍅</span>
            <span>{room.timerSessionsCompleted} completed</span>
          </div>

          {/* Timer display if running */}
          {room.timerIsRunning && (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-mono text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
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
              : 'bg-[#E8E0D5] dark:bg-slate-700 hover:bg-[#D4C4B0] dark:hover:bg-slate-600 text-[#8B7355] dark:text-white'
          }`}
        >
          {isMember ? 'Continue Studying' : 'Join Room'}
        </button>
      </div>
    </div>
  );
}
