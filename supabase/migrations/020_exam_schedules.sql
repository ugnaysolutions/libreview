CREATE TABLE exam_schedules (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_config_id  UUID        NOT NULL REFERENCES exam_configs(id) ON DELETE CASCADE,
  milestone_type  TEXT        NOT NULL
    CHECK (milestone_type IN ('application_open','application_deadline','exam_date','results_release','enrollment')),
  milestone_label TEXT        NOT NULL,
  scheduled_date  DATE        NOT NULL,
  academic_year   TEXT        NOT NULL,
  notes           TEXT,
  is_confirmed    BOOLEAN     NOT NULL DEFAULT false,
  source_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exam_schedules_date ON exam_schedules(scheduled_date);
CREATE INDEX idx_exam_schedules_config ON exam_schedules(exam_config_id);

ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_schedules_read"
  ON exam_schedules FOR SELECT TO authenticated USING (true);

CREATE POLICY "exam_schedules_admin_all"
  ON exam_schedules FOR ALL TO authenticated
  USING  (is_admin())
  WITH CHECK (is_admin());
