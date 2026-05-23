-- Allow 'adaptive_drill' as a valid session_type in exam_sessions.
-- The original CHECK constraint only permitted 'topic_practice' and 'mock_exam'.
ALTER TABLE exam_sessions
  DROP CONSTRAINT IF EXISTS exam_sessions_session_type_check;

ALTER TABLE exam_sessions
  ADD CONSTRAINT exam_sessions_session_type_check
  CHECK (session_type IN ('topic_practice', 'mock_exam', 'adaptive_drill'));
