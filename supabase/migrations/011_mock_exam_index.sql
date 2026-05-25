CREATE INDEX IF NOT EXISTS idx_exam_sessions_mock
  ON exam_sessions(user_id, session_type, status, completed_at DESC);
