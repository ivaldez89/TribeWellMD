-- TribeWellMD Subscriptions Schema
-- Run this in Supabase SQL Editor or via CLI

-- =============================================
-- SUBSCRIPTIONS TABLE
-- Tracks user subscription status
-- =============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier_id TEXT NOT NULL DEFAULT 'free',
  billing_period TEXT, -- 'monthly' or 'yearly'
  status TEXT NOT NULL DEFAULT 'active', -- active, past_due, canceled, trialing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier_id);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =============================================
-- PAYMENT HISTORY TABLE
-- Logs all payments for audit trail
-- =============================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL, -- succeeded, failed, pending
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created ON payment_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- RLS Policies
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment history"
  ON payment_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payment history"
  ON payment_history FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =============================================
-- FUNCTION: Get user subscription tier
-- Returns the effective tier for a user
-- =============================================
CREATE OR REPLACE FUNCTION get_user_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_tier TEXT;
  v_status TEXT;
  v_period_end TIMESTAMPTZ;
BEGIN
  SELECT tier_id, status, current_period_end
  INTO v_tier, v_status, v_period_end
  FROM subscriptions
  WHERE user_id = p_user_id;

  -- No subscription record = free tier
  IF v_tier IS NULL THEN
    RETURN 'free';
  END IF;

  -- Check if subscription is active
  IF v_status IN ('active', 'trialing') THEN
    RETURN v_tier;
  END IF;

  -- Check if still within billing period (grace period)
  IF v_status = 'past_due' AND v_period_end > NOW() THEN
    RETURN v_tier;
  END IF;

  -- Otherwise, free tier
  RETURN 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Check if user has feature access
-- Returns true if user's tier includes the feature
-- =============================================
CREATE OR REPLACE FUNCTION has_feature_access(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
BEGIN
  v_tier := get_user_tier(p_user_id);

  -- Define feature access by tier
  CASE p_feature
    -- Free tier features
    WHEN 'basic_flashcards' THEN RETURN TRUE;
    WHEN 'limited_qbank' THEN RETURN TRUE;
    WHEN 'who5_checkin' THEN RETURN TRUE;
    WHEN 'community' THEN RETURN TRUE;
    WHEN 'earn_points' THEN RETURN TRUE;

    -- Student tier features
    WHEN 'unlimited_flashcards' THEN RETURN v_tier IN ('student', 'pro');
    WHEN 'full_qbank' THEN RETURN v_tier IN ('student', 'pro');
    WHEN 'spaced_repetition' THEN RETURN v_tier IN ('student', 'pro');
    WHEN 'case_studies' THEN RETURN v_tier IN ('student', 'pro');
    WHEN 'rapid_review' THEN RETURN v_tier IN ('student', 'pro');
    WHEN 'study_groups' THEN RETURN v_tier IN ('student', 'pro');
    WHEN 'advanced_analytics' THEN RETURN v_tier IN ('student', 'pro');
    WHEN 'points_2x' THEN RETURN v_tier = 'student';
    WHEN 'unlimited_villages' THEN RETURN v_tier IN ('student', 'pro');

    -- Pro tier features
    WHEN 'priority_qbank' THEN RETURN v_tier = 'pro';
    WHEN 'custom_flashcards' THEN RETURN v_tier = 'pro';
    WHEN 'ai_recommendations' THEN RETURN v_tier = 'pro';
    WHEN 'mock_exams' THEN RETURN v_tier = 'pro';
    WHEN 'tutoring_credits' THEN RETURN v_tier = 'pro';
    WHEN 'exclusive_webinars' THEN RETURN v_tier = 'pro';
    WHEN 'early_access' THEN RETURN v_tier = 'pro';
    WHEN 'points_3x' THEN RETURN v_tier = 'pro';
    WHEN 'create_village' THEN RETURN v_tier = 'pro';

    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Get points multiplier for tier
-- Returns the points multiplier for a user's tier
-- =============================================
CREATE OR REPLACE FUNCTION get_points_multiplier(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_tier TEXT;
BEGIN
  v_tier := get_user_tier(p_user_id);

  CASE v_tier
    WHEN 'pro' THEN RETURN 3;
    WHEN 'student' THEN RETURN 2;
    ELSE RETURN 1;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Initialize free subscriptions for existing users
-- =============================================
INSERT INTO subscriptions (user_id, tier_id, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON payment_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_tier TO authenticated;
GRANT EXECUTE ON FUNCTION has_feature_access TO authenticated;
GRANT EXECUTE ON FUNCTION get_points_multiplier TO authenticated;
