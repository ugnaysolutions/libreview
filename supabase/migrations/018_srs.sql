-- Spaced repetition stats: one row per user per question
CREATE TABLE question_srs_stats (
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id      UUID        NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  next_review_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  interval_days    FLOAT       NOT NULL DEFAULT 1,
  ease_factor      FLOAT       NOT NULL DEFAULT 2.5,
  repetitions      INT         NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

ALTER TABLE question_srs_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own SRS stats"
  ON question_srs_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
