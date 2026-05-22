-- Migration 002: Add plan_type to subscriptions and user_profiles
-- Run in Supabase SQL Editor.

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'monthly'
    CHECK (plan_type IN ('monthly', 'annual'));

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'monthly'
    CHECK (plan_type IN ('monthly', 'annual'));
