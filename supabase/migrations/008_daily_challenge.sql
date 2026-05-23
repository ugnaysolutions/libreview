-- Daily challenge: one set of 5 questions shared by all users per day
CREATE TABLE daily_challenges (
  date DATE PRIMARY KEY,
  question_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read daily challenges"
  ON daily_challenges FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create daily challenges"
  ON daily_challenges FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Per-user completion record (one per day)
CREATE TABLE daily_challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_challenge_completions_user
  ON daily_challenge_completions(user_id, date DESC);

ALTER TABLE daily_challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own challenge completions"
  ON daily_challenge_completions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
