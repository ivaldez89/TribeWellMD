'use client';

import { createClient } from '@/lib/supabase/client';
import {
  StudySession,
  SessionParticipant,
  SessionMessage,
  CreateSessionData,
  TimerMode,
  TIMER_DURATIONS,
  generateInviteCode,
  transformSessionRow,
  transformParticipantRow,
  transformMessageRow,
  type StudySessionRow,
  type SessionParticipantRow,
  type SessionMessageRow,
} from '@/types/studyRoom';

// Storage keys for localStorage fallback
const SESSIONS_KEY = 'tribewellmd_study_sessions';
const PARTICIPANTS_KEY = 'tribewellmd_session_participants';
const MESSAGES_KEY = 'tribewellmd_session_messages';

// ============================================
// SUPABASE OPERATIONS
// ============================================

// Create a new study session
export async function createStudySession(
  data: CreateSessionData,
  userId: string,
  userDisplayName: string
): Promise<{ session: StudySession | null; error: string | null }> {
  const supabase = createClient();

  const inviteCode = data.isPrivate ? generateInviteCode() : null;

  const { data: sessionData, error } = await supabase
    .from('study_sessions')
    .insert({
      name: data.name,
      description: data.description || null,
      host_id: userId,
      is_private: data.isPrivate || false,
      max_participants: data.maxParticipants || 10,
      invite_code: inviteCode,
      timer_mode: 'focus',
      timer_duration: TIMER_DURATIONS.focus,
      timer_remaining: TIMER_DURATIONS.focus,
      timer_is_running: false,
      timer_sessions_completed: 0,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    return { session: null, error: error.message };
  }

  // Auto-join as host
  const { error: joinError } = await supabase
    .from('session_participants')
    .insert({
      session_id: sessionData.id,
      user_id: userId,
      display_name: userDisplayName,
      role: 'host',
      status: 'active',
      is_online: true,
    });

  if (joinError) {
    console.error('Error joining as host:', joinError);
  }

  // Add system message
  await supabase.from('session_messages').insert({
    session_id: sessionData.id,
    sender_id: userId,
    sender_name: 'System',
    content: `${userDisplayName} created the study room`,
    message_type: 'system',
  });

  return { session: transformSessionRow(sessionData), error: null };
}

// Get a session by ID
export async function getStudySession(
  sessionId: string
): Promise<StudySession | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) {
    console.error('Error fetching session:', error);
    return null;
  }

  return transformSessionRow(data as StudySessionRow);
}

// Get session by invite code
export async function getSessionByInviteCode(
  inviteCode: string
): Promise<StudySession | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return null;
  }

  return transformSessionRow(data as StudySessionRow);
}

// Get active public sessions
export async function getActivePublicSessions(): Promise<StudySession[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('status', 'active')
    .eq('is_private', false)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data.map((row) => transformSessionRow(row as StudySessionRow));
}

// Get user's sessions (where they're a participant)
export async function getUserSessions(userId: string): Promise<StudySession[]> {
  const supabase = createClient();

  // Get session IDs where user is a participant
  const { data: participantData, error: participantError } = await supabase
    .from('session_participants')
    .select('session_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (participantError || !participantData || participantData.length === 0) {
    return [];
  }

  const sessionIds = participantData.map((p) => p.session_id);

  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .in('id', sessionIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => transformSessionRow(row as StudySessionRow));
}

// Join a session
export async function joinStudySession(
  sessionId: string,
  userId: string,
  userDisplayName: string,
  avatarUrl?: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  // Check if session exists and is active
  const session = await getStudySession(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }
  if (session.status !== 'active') {
    return { success: false, error: 'Session has ended' };
  }

  // Check if already a participant
  const { data: existing } = await supabase
    .from('session_participants')
    .select('id, status')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Re-activate if they left
    if (existing.status === 'left') {
      await supabase
        .from('session_participants')
        .update({ status: 'active', is_online: true })
        .eq('id', existing.id);
    }
    return { success: true, error: null };
  }

  // Check max participants
  const { count } = await supabase
    .from('session_participants')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('status', 'active');

  if (count && count >= session.maxParticipants) {
    return { success: false, error: 'Session is full' };
  }

  // Join
  const { error } = await supabase.from('session_participants').insert({
    session_id: sessionId,
    user_id: userId,
    display_name: userDisplayName,
    avatar_url: avatarUrl || null,
    role: 'participant',
    status: 'active',
    is_online: true,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Add system message
  await supabase.from('session_messages').insert({
    session_id: sessionId,
    sender_id: userId,
    sender_name: 'System',
    content: `${userDisplayName} joined the room`,
    message_type: 'system',
  });

  return { success: true, error: null };
}

// Leave a session
export async function leaveStudySession(
  sessionId: string,
  userId: string,
  userDisplayName: string
): Promise<void> {
  const supabase = createClient();

  await supabase
    .from('session_participants')
    .update({ status: 'left', is_online: false })
    .eq('session_id', sessionId)
    .eq('user_id', userId);

  // Add system message
  await supabase.from('session_messages').insert({
    session_id: sessionId,
    sender_id: userId,
    sender_name: 'System',
    content: `${userDisplayName} left the room`,
    message_type: 'system',
  });
}

// End a session (host only)
export async function endStudySession(
  sessionId: string,
  hostId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  const session = await getStudySession(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }
  if (session.hostId !== hostId) {
    return { success: false, error: 'Only the host can end the session' };
  }

  const { error } = await supabase
    .from('study_sessions')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Mark all participants as left
  await supabase
    .from('session_participants')
    .update({ status: 'left', is_online: false })
    .eq('session_id', sessionId);

  return { success: true, error: null };
}

// Get participants for a session
export async function getSessionParticipants(
  sessionId: string
): Promise<SessionParticipant[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('session_participants')
    .select('*')
    .eq('session_id', sessionId)
    .neq('status', 'left')
    .order('joined_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => transformParticipantRow(row as SessionParticipantRow));
}

// Get messages for a session
export async function getSessionMessages(
  sessionId: string,
  limit: number = 100
): Promise<SessionMessage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('session_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((row) => transformMessageRow(row as SessionMessageRow));
}

// Send a chat message
export async function sendSessionMessage(
  sessionId: string,
  userId: string,
  userDisplayName: string,
  content: string,
  avatarUrl?: string
): Promise<SessionMessage | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('session_messages')
    .insert({
      session_id: sessionId,
      sender_id: userId,
      sender_name: userDisplayName,
      sender_avatar: avatarUrl || null,
      content: content.trim(),
      type: 'message',
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error sending message:', error);
    return null;
  }

  return transformMessageRow(data as SessionMessageRow);
}

// Update timer state
export async function updateSessionTimer(
  sessionId: string,
  updates: {
    timerMode?: TimerMode;
    timerDuration?: number;
    timerRemaining?: number;
    timerIsRunning?: boolean;
    timerStartedAt?: string | null;
    timerSessionsCompleted?: number;
  }
): Promise<void> {
  const supabase = createClient();

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.timerMode !== undefined) dbUpdates.timer_mode = updates.timerMode;
  if (updates.timerDuration !== undefined) dbUpdates.timer_duration = updates.timerDuration;
  if (updates.timerRemaining !== undefined) dbUpdates.timer_remaining = updates.timerRemaining;
  if (updates.timerIsRunning !== undefined) dbUpdates.timer_is_running = updates.timerIsRunning;
  if (updates.timerStartedAt !== undefined) dbUpdates.timer_started_at = updates.timerStartedAt;
  if (updates.timerSessionsCompleted !== undefined)
    dbUpdates.timer_sessions_completed = updates.timerSessionsCompleted;

  await supabase.from('study_sessions').update(dbUpdates).eq('id', sessionId);
}

// Update participant online status
export async function updateParticipantOnlineStatus(
  sessionId: string,
  oderId: string,
  isOnline: boolean
): Promise<void> {
  const supabase = createClient();

  await supabase
    .from('session_participants')
    .update({
      is_online: isOnline,
      last_seen_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('user_id', oderId);
}

// ============================================
// LOCAL STORAGE FALLBACK (for demo/offline)
// ============================================

// Get demo sessions from localStorage
export function getDemoSessions(): StudySession[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading demo sessions:', e);
  }

  // Return sample demo sessions
  const demoSessions: StudySession[] = [
    {
      id: 'demo-1',
      name: 'Cardiology Review',
      description: 'Reviewing heart anatomy and pathology',
      hostId: 'demo-host',
      hostName: 'Dr. Smith',
      status: 'active',
      maxParticipants: 10,
      isPrivate: false,
      inviteCode: null,
      timerMode: 'focus',
      timerDuration: TIMER_DURATIONS.focus,
      timerRemaining: TIMER_DURATIONS.focus,
      timerIsRunning: false,
      timerStartedAt: null,
      timerSessionsCompleted: 2,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      endedAt: null,
      participantCount: 3,
    },
    {
      id: 'demo-2',
      name: 'Step 1 Prep - Biochem',
      description: 'Metabolic pathways and enzymes',
      hostId: 'demo-host-2',
      hostName: 'Sarah M.',
      status: 'active',
      maxParticipants: 8,
      isPrivate: false,
      inviteCode: null,
      timerMode: 'focus',
      timerDuration: TIMER_DURATIONS.focus,
      timerRemaining: 1200,
      timerIsRunning: true,
      timerStartedAt: new Date(Date.now() - 300000).toISOString(),
      timerSessionsCompleted: 1,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date().toISOString(),
      endedAt: null,
      participantCount: 5,
    },
  ];

  localStorage.setItem(SESSIONS_KEY, JSON.stringify(demoSessions));
  return demoSessions;
}

// Save demo sessions
export function saveDemoSessions(sessions: StudySession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// ============================================
// USER SEARCH FOR INVITES
// ============================================

export interface SearchableUser {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

// Search users by name or email for inviting to a session
export async function searchUsersForInvite(
  query: string,
  excludeUserIds: string[] = []
): Promise<SearchableUser[]> {
  if (!query || query.length < 2) return [];

  const supabase = createClient();

  // Search in auth.users via RPC or a profiles table
  // For now, we'll search session_participants for known users
  const { data, error } = await supabase
    .from('session_participants')
    .select('user_id, display_name, avatar_url')
    .ilike('display_name', `%${query}%`)
    .limit(10);

  if (error || !data) {
    return [];
  }

  // Deduplicate by user_id and exclude specified users
  const seen = new Set<string>();
  const users: SearchableUser[] = [];

  for (const row of data) {
    if (!seen.has(row.user_id) && !excludeUserIds.includes(row.user_id)) {
      seen.add(row.user_id);
      users.push({
        id: row.user_id,
        displayName: row.display_name,
        avatarUrl: row.avatar_url || undefined,
      });
    }
  }

  return users;
}

// Invite a user to a session (sends them a notification/adds them)
export async function inviteUserToSession(
  sessionId: string,
  userId: string,
  invitedByName: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  // Check if user is already a participant
  const { data: existing } = await supabase
    .from('session_participants')
    .select('id, status')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single();

  if (existing && existing.status === 'active') {
    return { success: false, error: 'User is already in this session' };
  }

  // For now, we'll add them as a pending invite (they'll see it when they next check)
  // In a full implementation, this would send a push notification or email

  // Add system message about the invite
  await supabase.from('session_messages').insert({
    session_id: sessionId,
    sender_id: 'system',
    sender_name: 'System',
    content: `${invitedByName} invited a user to join`,
    message_type: 'system',
  });

  return { success: true, error: null };
}
