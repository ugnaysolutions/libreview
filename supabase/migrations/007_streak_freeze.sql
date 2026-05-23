ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS streak_freeze_used INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS streak_freeze_month TEXT;
