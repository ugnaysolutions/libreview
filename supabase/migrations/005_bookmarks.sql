-- Bookmarked questions: users save wrong answers for later review
CREATE TABLE bookmarked_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX idx_bookmarked_questions_user ON bookmarked_questions(user_id, created_at DESC);

ALTER TABLE bookmarked_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bookmarks"
  ON bookmarked_questions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
