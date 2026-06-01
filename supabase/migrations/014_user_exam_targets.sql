-- User-defined exam targets (multiple exams per user)
CREATE TABLE IF NOT EXISTS user_exam_targets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type   TEXT        NOT NULL,
  exam_date   DATE        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, exam_type)
);

ALTER TABLE user_exam_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own exam targets"
  ON user_exam_targets FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
