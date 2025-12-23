-- Fix ALL RLS policies to avoid infinite recursion
-- This replaces the original policies with simpler, non-recursive ones

-- Drop ALL existing policies on both tables
DROP POLICY IF EXISTS "Public sessions are viewable by authenticated users" ON study_sessions;
DROP POLICY IF EXISTS "Authenticated users can create sessions" ON study_sessions;
DROP POLICY IF EXISTS "Host can update session" ON study_sessions;
DROP POLICY IF EXISTS "Host can delete session" ON study_sessions;

DROP POLICY IF EXISTS "Session participants are viewable by session members" ON session_participants;
DROP POLICY IF EXISTS "Users can join sessions" ON session_participants;
DROP POLICY IF EXISTS "Users can update own participant record" ON session_participants;
DROP POLICY IF EXISTS "Host can update participants in their session" ON session_participants;

DROP POLICY IF EXISTS "Messages viewable by session members" ON session_messages;
DROP POLICY IF EXISTS "Session members can send messages" ON session_messages;

-- STUDY_SESSIONS: Simple policies (no cross-table checks)
CREATE POLICY "Anyone can view active public sessions"
  ON study_sessions FOR SELECT TO authenticated
  USING (status = 'active' AND is_private = false);

CREATE POLICY "Host can view own sessions"
  ON study_sessions FOR SELECT TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Users can create sessions"
  ON study_sessions FOR INSERT TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Host can update own session"
  ON study_sessions FOR UPDATE TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Host can delete own session"
  ON study_sessions FOR DELETE TO authenticated
  USING (host_id = auth.uid());

-- SESSION_PARTICIPANTS: Simple policies
CREATE POLICY "Users can view own participation"
  ON session_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Host can view session participants"
  ON session_participants FOR SELECT TO authenticated
  USING (
    session_id IN (SELECT id FROM study_sessions WHERE host_id = auth.uid())
  );

CREATE POLICY "Users can join sessions"
  ON session_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own record"
  ON session_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- SESSION_MESSAGES: Simple policies
CREATE POLICY "Participants can view messages"
  ON session_messages FOR SELECT TO authenticated
  USING (
    session_id IN (SELECT session_id FROM session_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Participants can send messages"
  ON session_messages FOR INSERT TO authenticated
  WITH CHECK (
    session_id IN (SELECT session_id FROM session_participants WHERE user_id = auth.uid())
  );
