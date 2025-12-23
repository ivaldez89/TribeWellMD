-- Fix RLS infinite recursion in session_participants
-- Run this in Supabase SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Session participants are viewable by session members" ON session_participants;
DROP POLICY IF EXISTS "Host can update participants in their session" ON session_participants;

-- Recreate with non-recursive logic

-- View participants: Check study_sessions table directly (no recursion)
CREATE POLICY "Session participants are viewable by session members"
  ON session_participants FOR SELECT
  TO authenticated
  USING (
    -- User is in this session
    user_id = auth.uid()
    OR
    -- User is the host of this session
    EXISTS (
      SELECT 1 FROM study_sessions s
      WHERE s.id = session_participants.session_id
      AND s.host_id = auth.uid()
    )
    OR
    -- Session is public and active
    EXISTS (
      SELECT 1 FROM study_sessions s
      WHERE s.id = session_participants.session_id
      AND s.status = 'active'
      AND s.is_private = false
    )
  );

-- Host can update any participant in their session
CREATE POLICY "Host can update participants in their session"
  ON session_participants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_sessions s
      WHERE s.id = session_participants.session_id
      AND s.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_sessions s
      WHERE s.id = session_participants.session_id
      AND s.host_id = auth.uid()
    )
  );
