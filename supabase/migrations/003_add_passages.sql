CREATE TABLE passages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id   UUID REFERENCES topics(id) ON DELETE CASCADE,
  content    TEXT,
  image_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE questions
  ADD COLUMN passage_id UUID REFERENCES passages(id) ON DELETE SET NULL;

ALTER TABLE passages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read passages" ON passages FOR SELECT USING (true);
CREATE POLICY "Admins manage passages" ON passages FOR ALL USING (is_admin());
