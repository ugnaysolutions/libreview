-- Migration 001: Add premium plan fields
-- Run this in the Supabase SQL Editor before deploying plan-gating code.

-- Plan and expiry on user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'premium')),
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS streak_freeze_count INTEGER NOT NULL DEFAULT 0;

-- Subscriptions audit log
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider                TEXT NOT NULL,  -- 'stripe' | 'paymongo'
  provider_subscription_id TEXT,
  status                  TEXT NOT NULL,  -- 'active' | 'cancelled' | 'expired'
  amount_cents            INTEGER,
  currency                TEXT DEFAULT 'PHP',
  started_at              TIMESTAMPTZ DEFAULT NOW(),
  expires_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Exam type tag for future multi-school support
ALTER TABLE subtests
  ADD COLUMN IF NOT EXISTS exam_type TEXT NOT NULL DEFAULT 'upcat';

-- RLS on subscriptions: users can read their own rows; service role manages all
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
