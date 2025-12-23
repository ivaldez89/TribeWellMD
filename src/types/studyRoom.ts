// Study Room Types for TribeWellMD
// Collaborative study sessions with real-time chat, shared Pomodoro, and presence

export type SessionStatus = 'active' | 'ended' | 'scheduled';
export type ParticipantRole = 'host' | 'participant';
export type ParticipantStatus = 'active' | 'away' | 'left';
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type SessionMessageType = 'message' | 'system' | 'achievement';

// Timer durations in seconds
export const TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,       // 25 minutes
  shortBreak: 5 * 60,   // 5 minutes
  longBreak: 15 * 60,   // 15 minutes
};

// Timer mode labels for UI
export const TIMER_MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

// Study session (room)
export interface StudySession {
  id: string;
  name: string;
  description: string | null;
  hostId: string;
  hostName?: string;
  status: SessionStatus;
  maxParticipants: number;
  isPrivate: boolean;
  inviteCode: string | null;

  // Timer state
  timerMode: TimerMode;
  timerDuration: number;
  timerRemaining: number;
  timerIsRunning: boolean;
  timerStartedAt: string | null;
  timerSessionsCompleted: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;

  // Computed/joined fields
  participantCount?: number;
}

// Participant in a session
export interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: ParticipantRole;
  status: ParticipantStatus;
  isOnline: boolean;
  focusTimeSeconds: number;
  pomodorosCompleted: number;
  joinedAt: string;
  lastSeenAt: string;
}

// Chat message in a session
export interface SessionMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  type: SessionMessageType;
  createdAt: string;
}

// Form data for creating a session
export interface CreateSessionData {
  name: string;
  description?: string;
  isPrivate?: boolean;
  maxParticipants?: number;
}

// Session with participants (for room view)
export interface StudySessionWithParticipants extends StudySession {
  participants: SessionParticipant[];
}

// Presence state for Supabase Realtime
export interface PresenceState {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isActive: boolean;
  currentActivity?: 'studying' | 'on-break' | 'idle';
  onlineAt: string;
}

// Timer broadcast payload
export interface TimerBroadcast {
  type: 'timer_update' | 'timer_start' | 'timer_pause' | 'timer_reset' | 'timer_complete' | 'timer_mode_change';
  mode: TimerMode;
  remaining: number;
  duration: number;
  isRunning: boolean;
  sessionsCompleted: number;
  triggeredBy: string;
  timestamp: string;
}

// System message types
export type SystemMessageAction =
  | 'join'
  | 'leave'
  | 'timer_start'
  | 'timer_pause'
  | 'timer_complete'
  | 'session_end';

// Helper to generate invite codes
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper to format timer display
export function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Helper to calculate timer progress percentage
export function calculateTimerProgress(remaining: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((total - remaining) / total) * 100);
}

// Database row types (snake_case from Supabase)
export interface StudySessionRow {
  id: string;
  name: string;
  description: string | null;
  host_id: string;
  status: SessionStatus;
  max_participants: number;
  is_private: boolean;
  invite_code: string | null;
  timer_mode: TimerMode;
  timer_duration: number;
  timer_remaining: number;
  timer_is_running: boolean;
  timer_started_at: string | null;
  timer_sessions_completed: number;
  created_at: string;
  updated_at: string;
  ended_at: string | null;
}

export interface SessionParticipantRow {
  id: string;
  session_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: ParticipantRole;
  status: ParticipantStatus;
  is_online: boolean;
  focus_time_seconds: number;
  pomodoros_completed: number;
  joined_at: string;
  last_seen_at: string;
}

export interface SessionMessageRow {
  id: string;
  session_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  type: SessionMessageType;
  created_at: string;
}

// Transform functions (DB row -> TypeScript interface)
export function transformSessionRow(row: StudySessionRow): StudySession {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    hostId: row.host_id,
    status: row.status,
    maxParticipants: row.max_participants,
    isPrivate: row.is_private,
    inviteCode: row.invite_code,
    timerMode: row.timer_mode,
    timerDuration: row.timer_duration,
    timerRemaining: row.timer_remaining,
    timerIsRunning: row.timer_is_running,
    timerStartedAt: row.timer_started_at,
    timerSessionsCompleted: row.timer_sessions_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    endedAt: row.ended_at,
  };
}

export function transformParticipantRow(row: SessionParticipantRow): SessionParticipant {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    status: row.status,
    isOnline: row.is_online,
    focusTimeSeconds: row.focus_time_seconds,
    pomodorosCompleted: row.pomodoros_completed,
    joinedAt: row.joined_at,
    lastSeenAt: row.last_seen_at,
  };
}

export function transformMessageRow(row: SessionMessageRow): SessionMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderAvatar: row.sender_avatar,
    content: row.content,
    type: row.type,
    createdAt: row.created_at,
  };
}
