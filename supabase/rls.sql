-- ============================================================
-- Libreview — Row Level Security Policies
-- Run this AFTER schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── universities ─────────────────────────────────────────────
-- Anyone authenticated can read; admin can manage
CREATE POLICY "universities_read" ON universities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "universities_admin_all" ON universities
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ── subtests ─────────────────────────────────────────────────
CREATE POLICY "subtests_read" ON subtests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "subtests_admin_all" ON subtests
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ── topics ───────────────────────────────────────────────────
CREATE POLICY "topics_read" ON topics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "topics_admin_all" ON topics
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ── questions ────────────────────────────────────────────────
-- Authenticated users can read approved questions
CREATE POLICY "questions_read_approved" ON questions
  FOR SELECT TO authenticated USING (status = 'approved' OR is_admin());

-- Admin can do everything
CREATE POLICY "questions_admin_all" ON questions
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ── user_profiles ─────────────────────────────────────────────
-- Users can read and update their own profile
CREATE POLICY "profiles_own_select" ON user_profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_own_insert" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_own_update" ON user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- ── exam_sessions ─────────────────────────────────────────────
CREATE POLICY "sessions_own_select" ON exam_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "sessions_own_insert" ON exam_sessions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_own_update" ON exam_sessions
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── session_answers ───────────────────────────────────────────
CREATE POLICY "answers_own_select" ON session_answers
  FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM exam_sessions WHERE user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "answers_own_insert" ON session_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM exam_sessions WHERE user_id = auth.uid()
    )
  );

-- ── user_topic_progress ───────────────────────────────────────
CREATE POLICY "progress_own_select" ON user_topic_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "progress_own_insert" ON user_topic_progress
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "progress_own_update" ON user_topic_progress
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── question_reports ──────────────────────────────────────────
-- Authenticated users can insert reports; admin can read and update all
CREATE POLICY "reports_insert" ON question_reports
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "reports_admin_select" ON question_reports
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "reports_admin_update" ON question_reports
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ── resources ─────────────────────────────────────────────────
-- Authenticated users can read published resources
CREATE POLICY "resources_read_published" ON resources
  FOR SELECT TO authenticated USING (is_published = true OR is_admin());

CREATE POLICY "resources_admin_all" ON resources
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
