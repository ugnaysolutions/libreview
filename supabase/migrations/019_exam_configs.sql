CREATE TABLE exam_configs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT        UNIQUE NOT NULL,
  name          TEXT        NOT NULL,
  full_name     TEXT,
  university_id UUID        REFERENCES universities(id),
  color         TEXT        NOT NULL DEFAULT '#0D9488',
  display_order INTEGER,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE exam_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_configs_read"
  ON exam_configs FOR SELECT TO authenticated USING (true);

CREATE POLICY "exam_configs_admin_all"
  ON exam_configs FOR ALL TO authenticated
  USING  (is_admin())
  WITH CHECK (is_admin());
