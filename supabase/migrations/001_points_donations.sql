-- TribeWellMD Points & Donations Schema
-- Run this in Supabase SQL Editor or via CLI

-- =============================================
-- USER POINTS TABLE
-- Tracks each user's point balance
-- =============================================
CREATE TABLE IF NOT EXISTS user_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_donated INTEGER NOT NULL DEFAULT 0,
  current_balance INTEGER NOT NULL DEFAULT 0,
  village_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for village queries
CREATE INDEX IF NOT EXISTS idx_user_points_village ON user_points(village_id);

-- RLS Policies
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points"
  ON user_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON user_points FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
  ON user_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- POINT TRANSACTIONS TABLE
-- Logs every point earning event
-- =============================================
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_source ON point_transactions(source);

-- RLS Policies
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON point_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- DONATION TRANSACTIONS TABLE
-- Tracks point-to-dollar conversions
-- =============================================
CREATE TABLE IF NOT EXISTS donation_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  village_id TEXT,
  charity_id TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  dollars_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processed, failed
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_donation_transactions_user ON donation_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_donation_transactions_village ON donation_transactions(village_id);
CREATE INDEX IF NOT EXISTS idx_donation_transactions_charity ON donation_transactions(charity_id);
CREATE INDEX IF NOT EXISTS idx_donation_transactions_status ON donation_transactions(status);
CREATE INDEX IF NOT EXISTS idx_donation_transactions_created ON donation_transactions(created_at DESC);

-- RLS Policies
ALTER TABLE donation_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own donations"
  ON donation_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own donations"
  ON donation_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- VILLAGE DONATIONS TABLE
-- Aggregated stats per village/charity
-- =============================================
CREATE TABLE IF NOT EXISTS village_donations (
  village_id TEXT PRIMARY KEY,
  village_name TEXT,
  charity_ein TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  total_donated DECIMAL(10,2) NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 0,
  last_donation_date TIMESTAMPTZ,
  impact_statement TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies (public read, service role write)
ALTER TABLE village_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view village donations"
  ON village_donations FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- GLOBAL STATS TABLE
-- Platform-wide statistics
-- =============================================
CREATE TABLE IF NOT EXISTS global_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_points BIGINT NOT NULL DEFAULT 0,
  total_donated DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_users INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialize global stats
INSERT INTO global_stats (id, total_points, total_donated, total_users)
VALUES ('global', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies (public read)
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view global stats"
  ON global_stats FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- MILESTONE UNLOCKS TABLE
-- Tracks unlocked achievements
-- =============================================
CREATE TABLE IF NOT EXISTS milestone_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- 'global' for global milestones, user_id for personal
  milestone_id TEXT NOT NULL,
  milestone_type TEXT NOT NULL, -- 'personal' or 'global'
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_milestone_unlocks_user ON milestone_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_milestone_unlocks_type ON milestone_unlocks(milestone_type);

-- RLS Policies
ALTER TABLE milestone_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milestones"
  ON milestone_unlocks FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'global');

CREATE POLICY "Users can insert their own milestones"
  ON milestone_unlocks FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id = 'global');

-- =============================================
-- WHO-5 ASSESSMENTS TABLE
-- Daily wellbeing check-ins
-- =============================================
CREATE TABLE IF NOT EXISTS who5_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  q1 SMALLINT NOT NULL CHECK (q1 BETWEEN 0 AND 5),
  q2 SMALLINT NOT NULL CHECK (q2 BETWEEN 0 AND 5),
  q3 SMALLINT NOT NULL CHECK (q3 BETWEEN 0 AND 5),
  q4 SMALLINT NOT NULL CHECK (q4 BETWEEN 0 AND 5),
  q5 SMALLINT NOT NULL CHECK (q5 BETWEEN 0 AND 5),
  raw_score SMALLINT NOT NULL,
  percent_score SMALLINT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_who5_user ON who5_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_who5_created ON who5_assessments(created_at DESC);

-- RLS Policies
ALTER TABLE who5_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessments"
  ON who5_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON who5_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update user count in global stats
CREATE OR REPLACE FUNCTION update_user_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE global_stats
  SET total_users = (SELECT COUNT(*) FROM user_points),
      updated_at = NOW()
  WHERE id = 'global';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user count
DROP TRIGGER IF EXISTS update_user_count_trigger ON user_points;
CREATE TRIGGER update_user_count_trigger
  AFTER INSERT OR DELETE ON user_points
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_user_count();

-- Function to update village member count
CREATE OR REPLACE FUNCTION update_village_member_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old village if changing
  IF TG_OP = 'UPDATE' AND OLD.village_id IS DISTINCT FROM NEW.village_id THEN
    IF OLD.village_id IS NOT NULL THEN
      UPDATE village_donations
      SET member_count = (SELECT COUNT(*) FROM user_points WHERE village_id = OLD.village_id)
      WHERE village_id = OLD.village_id;
    END IF;
  END IF;

  -- Update new village
  IF NEW.village_id IS NOT NULL THEN
    UPDATE village_donations
    SET member_count = (SELECT COUNT(*) FROM user_points WHERE village_id = NEW.village_id)
    WHERE village_id = NEW.village_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for village member count
DROP TRIGGER IF EXISTS update_village_member_count_trigger ON user_points;
CREATE TRIGGER update_village_member_count_trigger
  AFTER INSERT OR UPDATE OF village_id OR DELETE ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION update_village_member_count();

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
