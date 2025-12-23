-- Study Rooms Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. STUDY SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'scheduled')),
  is_private BOOLEAN DEFAULT false,
  invite_code VARCHAR(10) UNIQUE,
  max_participants INTEGER DEFAULT 10 CHECK (max_participants >= 2 AND max_participants <= 50),

  -- Timer state (synced across all participants)
  timer_mode VARCHAR(20) DEFAULT 'focus' CHECK (timer_mode IN ('focus', 'shortBreak', 'longBreak')),
  timer_duration INTEGER DEFAULT 1500, -- seconds (25 min default)
  timer_remaining INTEGER DEFAULT 1500,
  timer_is_running BOOLEAN DEFAULT false,
  timer_started_at TIMESTAMPTZ,
  timer_sessions_completed INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Index for finding active public sessions
CREATE INDEX idx_study_sessions_active_public
  ON study_sessions(status, is_private)
  WHERE status = 'active' AND is_private = false;

-- Index for invite code lookup
CREATE INDEX idx_study_sessions_invite_code
  ON study_sessions(invite_code)
  WHERE invite_code IS NOT NULL;

-- Index for user's sessions
CREATE INDEX idx_study_sessions_host
  ON study_sessions(host_id);

-- ============================================
-- 2. SESSION PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('host', 'participant')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'left', 'kicked')),
  is_online BOOLEAN DEFAULT true,

  -- Stats for this session
  focus_time_seconds INTEGER DEFAULT 0,
  pomodoros_completed INTEGER DEFAULT 0,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one user per session
  UNIQUE(session_id, user_id)
);

-- Index for finding participants in a session
CREATE INDEX idx_session_participants_session
  ON session_participants(session_id, status)
  WHERE status = 'active';

-- Index for finding user's active sessions
CREATE INDEX idx_session_participants_user
  ON session_participants(user_id, status)
  WHERE status = 'active';

-- ============================================
-- 3. SESSION MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS session_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name VARCHAR(100) NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  message_type VARCHAR(20) DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'timer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching messages in a session (ordered by time)
CREATE INDEX idx_session_messages_session
  ON session_messages(session_id, created_at DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;

-- STUDY SESSIONS POLICIES

-- Anyone can view active public sessions
CREATE POLICY "Public sessions are viewable by authenticated users"
  ON study_sessions FOR SELECT
  TO authenticated
  USING (
    (status = 'active' AND is_private = false)
    OR host_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM session_participants
      WHERE session_participants.session_id = study_sessions.id
      AND session_participants.user_id = auth.uid()
      AND session_participants.status = 'active'
    )
  );

-- Users can create sessions
CREATE POLICY "Authenticated users can create sessions"
  ON study_sessions FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

-- Host can update their session
CREATE POLICY "Host can update session"
  ON study_sessions FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

-- Host can delete their session
CREATE POLICY "Host can delete session"
  ON study_sessions FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

-- SESSION PARTICIPANTS POLICIES

-- Participants can view other participants in their session
CREATE POLICY "Session participants are viewable by session members"
  ON session_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM session_participants sp
      WHERE sp.session_id = session_participants.session_id
      AND sp.user_id = auth.uid()
      AND sp.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM study_sessions s
      WHERE s.id = session_participants.session_id
      AND s.host_id = auth.uid()
    )
  );

-- Users can join sessions (insert themselves)
CREATE POLICY "Users can join sessions"
  ON session_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own participant record
CREATE POLICY "Users can update own participant record"
  ON session_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Host can update any participant in their session (for kicking)
CREATE POLICY "Host can update participants in their session"
  ON session_participants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_sessions s
      WHERE s.id = session_participants.session_id
      AND s.host_id = auth.uid()
    )
  );

-- SESSION MESSAGES POLICIES

-- Messages viewable by session members
CREATE POLICY "Messages viewable by session members"
  ON session_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM session_participants sp
      WHERE sp.session_id = session_messages.session_id
      AND sp.user_id = auth.uid()
      AND sp.status = 'active'
    )
  );

-- Session members can send messages
CREATE POLICY "Session members can send messages"
  ON session_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM session_participants sp
      WHERE sp.session_id = session_messages.session_id
      AND sp.user_id = auth.uid()
      AND sp.status = 'active'
    )
  );

-- ============================================
-- 5. REALTIME PUBLICATIONS
-- ============================================

-- Enable realtime for all study room tables
ALTER PUBLICATION supabase_realtime ADD TABLE study_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE session_messages;

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_study_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for study_sessions updated_at
CREATE TRIGGER update_study_sessions_timestamp
  BEFORE UPDATE ON study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_study_session_timestamp();

-- Function to update last_seen_at for participants
CREATE OR REPLACE FUNCTION update_participant_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for session_participants last_seen_at
CREATE TRIGGER update_participant_last_seen
  BEFORE UPDATE ON session_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_last_seen();

-- ============================================
-- 7. CLEANUP FUNCTION (Optional - run periodically)
-- ============================================

-- Function to end stale sessions (no activity for 24 hours)
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  WITH stale AS (
    UPDATE study_sessions
    SET status = 'ended', ended_at = NOW()
    WHERE status = 'active'
    AND updated_at < NOW() - INTERVAL '24 hours'
    RETURNING id
  )
  SELECT COUNT(*) INTO affected_count FROM stale;

  RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE! Run this SQL in Supabase SQL Editor
-- ============================================
