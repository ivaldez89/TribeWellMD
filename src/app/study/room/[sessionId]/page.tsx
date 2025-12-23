'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import {
  SharedPomodoroTimer,
  ParticipantsSidebar,
  SessionChat,
  StudyToolsPanel,
} from '@/components/study-room';
import { useStudyRoom } from '@/hooks/useStudyRoom';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/storage/profileStorage';
import { createClient } from '@/lib/supabase/client';
import { joinStudySession } from '@/lib/storage/studyRoomStorage';

export default function StudyRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const isAuthenticated = useIsAuthenticated();

  const [userId, setUserId] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>();
  const [hasJoined, setHasJoined] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Load user info
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
      if (profile?.avatar) {
        setUserAvatarUrl(profile.avatar);
      }
    };
    fetchUser();
  }, []);

  // Auto-join on load
  useEffect(() => {
    const doJoin = async () => {
      if (userId && sessionId && !hasJoined) {
        const { success } = await joinStudySession(sessionId, userId, userDisplayName, userAvatarUrl);
        if (success) {
          setHasJoined(true);
        }
      }
    };
    doJoin();
  }, [userId, sessionId, userDisplayName, userAvatarUrl, hasJoined]);

  // Use the study room hook
  const {
    session,
    participants,
    messages,
    isLoading,
    error,
    isConnected,
    isHost,
    timerMode,
    timerDuration,
    timerRemaining,
    timerIsRunning,
    timerProgress,
    pomodorosCompleted,
    sendMessage,
    startTimer,
    pauseTimer,
    resetTimer,
    switchTimerMode,
    setDuration,
    leaveRoom,
    endRoom,
    formatTime,
  } = useStudyRoom({
    sessionId,
    userId: userId || '',
    userDisplayName,
    userAvatarUrl,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Handle leave room
  const handleLeave = async () => {
    await leaveRoom();
    router.push('/study/rooms');
  };

  // Handle end room (host only)
  const handleEndRoom = async () => {
    await endRoom();
    router.push('/study/rooms');
  };

  // Loading state
  if (isLoading || isAuthenticated === null || !userId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading study room...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {error || 'Room not found'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                This study room may have ended or doesn't exist.
              </p>
              <Link
                href="/study/rooms"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Rooms
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Session ended
  if (session.status === 'ended') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Study Session Ended
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                This study room has been closed by the host.
              </p>
              <Link
                href="/study/rooms"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-colors"
              >
                Find Another Room
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      {/* Room Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back + Room Info */}
            <div className="flex items-center gap-4">
              <Link
                href="/study/rooms"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>

              <div>
                <h1 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  {session.name}
                  {isHost && (
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                      Host
                    </span>
                  )}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}
                    />
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </span>
                  <span>•</span>
                  <span>{participants.filter((p) => p.isOnline).length} online</span>
                </p>
              </div>
            </div>

            {/* Right: Timer display + Actions */}
            <div className="flex items-center gap-3">
              {/* Compact timer */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <span className={`text-lg font-mono font-bold ${timerIsRunning ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                  {formatTime(timerRemaining)}
                </span>
                {timerIsRunning && (
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Leave button */}
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
              >
                Leave
              </button>

              {/* End session (host only) */}
              {isHost && (
                <button
                  onClick={handleEndRoom}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  End Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Timer + Tools */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer */}
            <SharedPomodoroTimer
              mode={timerMode}
              remaining={timerRemaining}
              duration={timerDuration}
              isRunning={timerIsRunning}
              progress={timerProgress}
              sessionsCompleted={pomodorosCompleted}
              isHost={isHost}
              onStart={startTimer}
              onPause={pauseTimer}
              onReset={resetTimer}
              onModeChange={switchTimerMode}
              onDurationChange={setDuration}
              formatTime={formatTime}
            />

            {/* Study Tools */}
            <StudyToolsPanel />

            {/* Chat (mobile - shows below tools) */}
            <div className="lg:hidden">
              <SessionChat
                messages={messages}
                currentUserId={userId}
                onSendMessage={sendMessage}
                isConnected={isConnected}
              />
            </div>
          </div>

          {/* Right Column: Participants + Chat */}
          <div className="space-y-6">
            {/* Participants */}
            <ParticipantsSidebar
              participants={participants}
              currentUserId={userId}
              isConnected={isConnected}
            />

            {/* Chat (desktop) */}
            <div className="hidden lg:block">
              <SessionChat
                messages={messages}
                currentUserId={userId}
                onSendMessage={sendMessage}
                isConnected={isConnected}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Leave Study Room?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You can rejoin anytime while the session is active.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl transition-colors"
              >
                Stay
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
