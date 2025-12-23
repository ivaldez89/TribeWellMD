'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  StudySession,
  SessionParticipant,
  SessionMessage,
  TimerMode,
  TimerBroadcast,
  TIMER_DURATIONS,
  transformSessionRow,
  transformParticipantRow,
  transformMessageRow,
  type StudySessionRow,
  type SessionParticipantRow,
  type SessionMessageRow,
} from '@/types/studyRoom';
import {
  getStudySession,
  getSessionParticipants,
  getSessionMessages,
  sendSessionMessage,
  updateSessionTimer,
  updateParticipantOnlineStatus,
  leaveStudySession,
  endStudySession,
} from '@/lib/storage/studyRoomStorage';

interface UseStudyRoomOptions {
  sessionId: string;
  userId: string;
  userDisplayName: string;
  userAvatarUrl?: string;
}

interface UseStudyRoomReturn {
  // State
  session: StudySession | null;
  participants: SessionParticipant[];
  messages: SessionMessage[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;

  // User role
  isHost: boolean;
  currentParticipant: SessionParticipant | null;

  // Timer state (computed from session)
  timerMode: TimerMode;
  timerDuration: number;
  timerRemaining: number;
  timerIsRunning: boolean;
  timerProgress: number;
  pomodorosCompleted: number;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  switchTimerMode: (mode: TimerMode) => Promise<void>;
  setDuration: (mode: TimerMode, minutes: number) => Promise<void>;
  leaveRoom: () => Promise<void>;
  endRoom: () => Promise<void>;

  // Utilities
  formatTime: (seconds: number) => string;
}

export function useStudyRoom(options: UseStudyRoomOptions): UseStudyRoomReturn {
  const { sessionId, userId, userDisplayName, userAvatarUrl } = options;

  const [session, setSession] = useState<StudySession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Local timer state for smooth countdown
  const [localTimerRemaining, setLocalTimerRemaining] = useState(TIMER_DURATIONS.focus);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Computed values
  const isHost = session?.hostId === userId;
  const currentParticipant = participants.find((p) => p.userId === userId) || null;
  const timerMode = session?.timerMode || 'focus';
  const timerIsRunning = session?.timerIsRunning || false;
  const pomodorosCompleted = session?.timerSessionsCompleted || 0;
  const timerDuration = session?.timerDuration || TIMER_DURATIONS.focus;
  const timerProgress =
    timerDuration > 0 ? Math.round(((timerDuration - localTimerRemaining) / timerDuration) * 100) : 0;

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [sessionData, participantsData, messagesData] = await Promise.all([
          getStudySession(sessionId),
          getSessionParticipants(sessionId),
          getSessionMessages(sessionId),
        ]);

        if (!sessionData) {
          setError('Study room not found');
          setIsLoading(false);
          return;
        }

        setSession(sessionData);
        setParticipants(participantsData);
        setMessages(messagesData);
        setLocalTimerRemaining(sessionData.timerRemaining);
      } catch (e) {
        console.error('Error loading study room:', e);
        setError('Failed to load study room');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      loadData();
    }
  }, [sessionId]);

  // Set up Realtime subscriptions
  useEffect(() => {
    if (!sessionId || !userId) return;

    const channel = supabase.channel(`study_room:${sessionId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Presence sync
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const onlineUserIds = Object.keys(state);

      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          isOnline: onlineUserIds.includes(p.userId),
        }))
      );
    });

    // Timer broadcasts
    channel.on('broadcast', { event: 'timer' }, ({ payload }) => {
      const timerPayload = payload as TimerBroadcast;

      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timerMode: timerPayload.mode,
          timerDuration: timerPayload.duration,
          timerRemaining: timerPayload.remaining,
          timerIsRunning: timerPayload.isRunning,
          timerSessionsCompleted: timerPayload.sessionsCompleted,
        };
      });

      setLocalTimerRemaining(timerPayload.remaining);
    });

    // New messages (postgres_changes)
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'session_messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        const newMessage = transformMessageRow(payload.new as SessionMessageRow);
        setMessages((prev) => [...prev, newMessage]);
      }
    );

    // Session updates (postgres_changes)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'study_sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        const updatedSession = transformSessionRow(payload.new as StudySessionRow);
        setSession(updatedSession);
        setLocalTimerRemaining(updatedSession.timerRemaining);
      }
    );

    // Participant updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'session_participants',
        filter: `session_id=eq.${sessionId}`,
      },
      async () => {
        // Refresh participants list
        const updatedParticipants = await getSessionParticipants(sessionId);
        setParticipants(updatedParticipants);
      }
    );

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);

        // Track presence
        await channel.track({
          userId,
          displayName: userDisplayName,
          avatarUrl: userAvatarUrl,
          onlineAt: new Date().toISOString(),
        });

        // Update online status in DB
        await updateParticipantOnlineStatus(sessionId, userId, true);
      }
    });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [sessionId, userId, userDisplayName, userAvatarUrl, supabase]);

  // Local timer countdown
  useEffect(() => {
    if (timerIsRunning && localTimerRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setLocalTimerRemaining((prev) => {
          if (prev <= 1) {
            // Timer complete - will be handled by broadcast from host
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerIsRunning, localTimerRemaining]);

  // Send message action
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !sessionId) return;

      // Optimistic update
      const optimisticMessage: SessionMessage = {
        id: `temp-${Date.now()}`,
        sessionId,
        senderId: userId,
        senderName: userDisplayName,
        senderAvatar: userAvatarUrl || null,
        content: content.trim(),
        type: 'message',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Actually send
      await sendSessionMessage(sessionId, userId, userDisplayName, content, userAvatarUrl);
    },
    [sessionId, userId, userDisplayName, userAvatarUrl]
  );

  // Timer actions (host only)
  const broadcastTimerUpdate = useCallback(
    (type: TimerBroadcast['type'], updates: Partial<TimerBroadcast>) => {
      if (!channelRef.current || !isHost) return;

      const payload: TimerBroadcast = {
        type,
        mode: updates.mode || timerMode,
        remaining: updates.remaining ?? localTimerRemaining,
        duration: updates.duration || timerDuration,
        isRunning: updates.isRunning ?? timerIsRunning,
        sessionsCompleted: updates.sessionsCompleted ?? pomodorosCompleted,
        triggeredBy: userId,
        timestamp: new Date().toISOString(),
      };

      channelRef.current.send({
        type: 'broadcast',
        event: 'timer',
        payload,
      });
    },
    [isHost, timerMode, localTimerRemaining, timerDuration, timerIsRunning, pomodorosCompleted, userId]
  );

  const startTimer = useCallback(async () => {
    if (!isHost || !sessionId) return;

    const now = new Date().toISOString();

    await updateSessionTimer(sessionId, {
      timerIsRunning: true,
      timerStartedAt: now,
    });

    broadcastTimerUpdate('timer_start', {
      isRunning: true,
    });
  }, [isHost, sessionId, broadcastTimerUpdate]);

  const pauseTimer = useCallback(async () => {
    if (!isHost || !sessionId) return;

    await updateSessionTimer(sessionId, {
      timerIsRunning: false,
      timerRemaining: localTimerRemaining,
      timerStartedAt: null,
    });

    broadcastTimerUpdate('timer_pause', {
      isRunning: false,
      remaining: localTimerRemaining,
    });
  }, [isHost, sessionId, localTimerRemaining, broadcastTimerUpdate]);

  const resetTimer = useCallback(async () => {
    if (!isHost || !sessionId) return;

    const duration = TIMER_DURATIONS[timerMode];

    await updateSessionTimer(sessionId, {
      timerRemaining: duration,
      timerIsRunning: false,
      timerStartedAt: null,
    });

    setLocalTimerRemaining(duration);

    broadcastTimerUpdate('timer_reset', {
      remaining: duration,
      isRunning: false,
    });
  }, [isHost, sessionId, timerMode, broadcastTimerUpdate]);

  const switchTimerMode = useCallback(
    async (mode: TimerMode) => {
      if (!isHost || !sessionId) return;

      const duration = TIMER_DURATIONS[mode];

      await updateSessionTimer(sessionId, {
        timerMode: mode,
        timerDuration: duration,
        timerRemaining: duration,
        timerIsRunning: false,
        timerStartedAt: null,
      });

      setLocalTimerRemaining(duration);

      broadcastTimerUpdate('timer_mode_change', {
        mode,
        duration,
        remaining: duration,
        isRunning: false,
      });
    },
    [isHost, sessionId, broadcastTimerUpdate]
  );

  // Set custom duration for a mode
  const setDuration = useCallback(
    async (mode: TimerMode, minutes: number) => {
      if (!isHost || !sessionId) return;

      const durationSeconds = minutes * 60;

      // If we're changing the current mode, update the timer
      if (mode === timerMode) {
        await updateSessionTimer(sessionId, {
          timerDuration: durationSeconds,
          timerRemaining: durationSeconds,
          timerIsRunning: false,
          timerStartedAt: null,
        });

        setLocalTimerRemaining(durationSeconds);

        broadcastTimerUpdate('timer_reset', {
          duration: durationSeconds,
          remaining: durationSeconds,
          isRunning: false,
        });
      }
    },
    [isHost, sessionId, timerMode, broadcastTimerUpdate]
  );

  // Leave room action
  const leaveRoom = useCallback(async () => {
    if (!sessionId) return;

    // Update online status
    await updateParticipantOnlineStatus(sessionId, userId, false);
    await leaveStudySession(sessionId, userId, userDisplayName);

    // Unsubscribe from channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
  }, [sessionId, userId, userDisplayName]);

  // End room action (host only)
  const endRoom = useCallback(async () => {
    if (!isHost || !sessionId) return;

    await endStudySession(sessionId, userId);

    // Unsubscribe from channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
  }, [isHost, sessionId, userId]);

  return {
    // State
    session,
    participants,
    messages,
    isLoading,
    error,
    isConnected,

    // User role
    isHost,
    currentParticipant,

    // Timer state
    timerMode,
    timerDuration,
    timerRemaining: localTimerRemaining,
    timerIsRunning,
    timerProgress,
    pomodorosCompleted,

    // Actions
    sendMessage,
    startTimer,
    pauseTimer,
    resetTimer,
    switchTimerMode,
    setDuration,
    leaveRoom,
    endRoom,

    // Utilities
    formatTime,
  };
}

// Hook for listing rooms (simpler, no realtime)
export function useStudyRooms(userId?: string) {
  const [publicRooms, setPublicRooms] = useState<StudySession[]>([]);
  const [myRooms, setMyRooms] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Get public rooms
      const { data: publicData } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('status', 'active')
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (publicData) {
        setPublicRooms(publicData.map((row) => transformSessionRow(row as StudySessionRow)));
      }

      // Get user's rooms if logged in
      if (userId) {
        const { data: participantData } = await supabase
          .from('session_participants')
          .select('session_id')
          .eq('user_id', userId)
          .neq('status', 'left');

        if (participantData && participantData.length > 0) {
          const sessionIds = participantData.map((p) => p.session_id);

          const { data: myData } = await supabase
            .from('study_sessions')
            .select('*')
            .in('id', sessionIds)
            .eq('status', 'active');

          if (myData) {
            setMyRooms(myData.map((row) => transformSessionRow(row as StudySessionRow)));
          }
        }
      }
    } catch (e) {
      console.error('Error loading rooms:', e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    publicRooms,
    myRooms,
    isLoading,
    refresh,
  };
}
