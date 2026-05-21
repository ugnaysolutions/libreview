-- ============================================================
-- Libreview — Full Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enum types
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE question_status AS ENUM ('draft', 'approved', 'rejected');
CREATE TYPE exam_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE report_reason AS ENUM (
  'wrong_answer_key',
  'typo_or_grammar_error',
  'confusing_or_unclear',
  'image_not_loading',
  'not_relevant_to_upcat',
  'others'
);
CREATE TYPE resource_type AS ENUM ('youtube', 'article');

-- Universities
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subtests (Language Proficiency, Reading Comprehension, Science, Math)
CREATE TABLE subtests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  upcat_item_count INTEGER NOT NULL,
  mock_item_count INTEGER NOT NULL,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics (belongs to a subtest)
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtest_id UUID REFERENCES subtests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subtest_id, slug)
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  image_url TEXT,
  choice_a TEXT NOT NULL,
  choice_b TEXT NOT NULL,
  choice_c TEXT NOT NULL,
  choice_d TEXT NOT NULL,
  correct_choice CHAR(1) NOT NULL CHECK (correct_choice IN ('a','b','c','d')),
  explanation TEXT NOT NULL,
  difficulty SMALLINT DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 3),
  status question_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  target_exam_date DATE NOT NULL,
  target_university_id UUID REFERENCES universities(id),
  streak_count INTEGER DEFAULT 0,
  last_session_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on user_profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Exam sessions (mock exam or topic practice)
CREATE TABLE exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('topic_practice', 'mock_exam')),
  topic_id UUID REFERENCES topics(id),
  status exam_status DEFAULT 'in_progress',
  total_questions INTEGER NOT NULL,
  correct_count INTEGER DEFAULT 0,
  time_limit_seconds INTEGER,
  time_spent_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Individual answers within a session
CREATE TABLE session_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  chosen_choice CHAR(1) CHECK (chosen_choice IN ('a','b','c','d')),
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress per topic
CREATE TABLE user_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  accuracy_percentage NUMERIC(5,2) DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  UNIQUE(user_id, topic_id)
);

-- Question reports
CREATE TABLE question_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  notes TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources (CMS managed)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type resource_type DEFAULT 'youtube',
  url TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for common query patterns
CREATE INDEX idx_questions_topic_status ON questions(topic_id, status);
CREATE INDEX idx_exam_sessions_user ON exam_sessions(user_id, started_at DESC);
CREATE INDEX idx_session_answers_session ON session_answers(session_id);
CREATE INDEX idx_user_topic_progress_user ON user_topic_progress(user_id);
CREATE INDEX idx_user_topic_progress_topic ON user_topic_progress(topic_id);
CREATE INDEX idx_question_reports_resolved ON question_reports(is_resolved, created_at DESC);
