'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import {
  SharedPomodoroTimer,
  ParticipantsSidebar,
  SessionChat,
  InviteParticipants,
} from '@/components/study-room';
import { useStudyRoom } from '@/hooks/useStudyRoom';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/storage/profileStorage';
import { createClient } from '@/lib/supabase/client';
import { joinStudySession } from '@/lib/storage/studyRoomStorage';

// Study tool options
type StudyTool = 'flashcards' | 'rapid-review' | 'cases' | 'none';

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

  // UI state
  const [timerCollapsed, setTimerCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [chatMuted, setChatMuted] = useState(false);
  const [activeTool, setActiveTool] = useState<StudyTool>('none');
  const [showInviteModal, setShowInviteModal] = useState(false);

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
  if (isLoading || !userId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tribe-sage-500" />
          </div>
        </main>
      </div>
    );
  }

  // Error or not found
  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {error || 'Room not found'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                This study room may have ended or doesn&apos;t exist.
              </p>
              <Link
                href="/study/rooms"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-tribe-sage-500 hover:bg-tribe-sage-600 text-white font-medium rounded-xl transition-colors"
              >
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
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Study Session Ended
              </h2>
              <Link href="/study/rooms" className="inline-flex items-center gap-2 px-5 py-2.5 bg-tribe-sage-500 hover:bg-tribe-sage-600 text-white font-medium rounded-xl transition-colors">
                Find Another Room
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render study tool content
  const renderStudyTool = () => {
    switch (activeTool) {
      case 'flashcards':
        return (
          <div className="h-full">
            <iframe
              src="/study/flashcards"
              className="w-full h-full border-0 rounded-lg"
              title="Flashcards"
            />
          </div>
        );
      case 'rapid-review':
        return (
          <div className="h-full">
            <iframe
              src="/study/rapid-review"
              className="w-full h-full border-0 rounded-lg"
              title="Rapid Review"
            />
          </div>
        );
      case 'cases':
        return (
          <div className="h-full">
            <iframe
              src="/cases"
              className="w-full h-full border-0 rounded-lg"
              title="Clinical Cases"
            />
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Choose a Study Tool
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
              Select a study method to use during this session. Your progress will be tracked.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
              <button
                onClick={() => setActiveTool('flashcards')}
                className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="font-medium text-slate-900 dark:text-white">Flashcards</span>
              </button>

              <button
                onClick={() => setActiveTool('rapid-review')}
                className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-medium text-slate-900 dark:text-white">Rapid Review</span>
              </button>

              <button
                onClick={() => setActiveTool('cases')}
                className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="font-medium text-slate-900 dark:text-white">Cases</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-full mx-auto flex items-center justify-between">
          {/* Left: Room info */}
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
              <h1 className="font-semibold text-slate-900 dark:text-white">{session.name}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{participants.filter(p => p.isOnline).length} online</span>
                {session.inviteCode && (
                  <>
                    <span>•</span>
                    <span>Code: {session.inviteCode}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center: Study tool tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTool('none')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTool === 'none'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTool('flashcards')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTool === 'flashcards'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setActiveTool('rapid-review')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTool === 'rapid-review'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Rapid Review
            </button>
            <button
              onClick={() => setActiveTool('cases')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTool === 'cases'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cases
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 text-sm font-medium bg-tribe-sage-500 hover:bg-tribe-sage-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite
            </button>
            {isHost && (
              <button
                onClick={handleEndRoom}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                End Session
              </button>
            )}
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Timer + Study Tool Area */}
        <div className="flex-1 flex flex-col min-w-0 p-4 gap-4">
          {/* Timer (collapsible) */}
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
            collapsed={timerCollapsed}
            onToggleCollapse={() => setTimerCollapsed(!timerCollapsed)}
          />

          {/* Study Tool Area */}
          <div className="flex-1 min-h-0">
            {renderStudyTool()}
          </div>
        </div>

        {/* Right Sidebar: Participants + Chat */}
        <div className={`${chatCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 flex flex-col border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-300`}>
          {/* Collapsed sidebar */}
          {chatCollapsed ? (
            <div className="flex flex-col items-center py-4 gap-4">
              <button
                onClick={() => setChatCollapsed(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Expand Sidebar"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>

              {/* Mini participant avatars */}
              <div className="flex flex-col gap-2">
                {participants.filter(p => p.isOnline).slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="w-8 h-8 rounded-full bg-tribe-sage-100 dark:bg-tribe-sage-900/30 flex items-center justify-center text-xs font-medium text-tribe-sage-700 dark:text-tribe-sage-300"
                    title={p.displayName}
                  >
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                ))}
                {participants.filter(p => p.isOnline).length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
                    +{participants.filter(p => p.isOnline).length - 5}
                  </div>
                )}
              </div>

              {/* Unread indicator */}
              {!chatMuted && messages.length > 0 && (
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          ) : (
            <>
              {/* Sidebar Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-900 dark:text-white">Chat & Participants</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setChatMuted(!chatMuted)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      chatMuted
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                    title={chatMuted ? 'Unmute' : 'Mute'}
                  >
                    {chatMuted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setChatCollapsed(true)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Collapse Sidebar"
                  >
                    <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Participants */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <ParticipantsSidebar
                  participants={participants}
                  currentUserId={userId}
                  isConnected={isConnected}
                />
              </div>

              {/* Chat */}
              <div className="flex-1 min-h-0">
                <SessionChat
                  messages={messages}
                  currentUserId={userId}
                  onSendMessage={sendMessage}
                  isConnected={isConnected}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Leave Study Room?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You can rejoin this room later using the invite code.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Participants Modal */}
      {showInviteModal && session && (
        <InviteParticipants
          sessionId={sessionId}
          inviteCode={session.inviteCode}
          isHost={isHost}
          currentUserId={userId}
          currentUserName={userDisplayName}
          participantUserIds={participants.map(p => p.userId)}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
