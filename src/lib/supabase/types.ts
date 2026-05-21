export type UserRole = "student" | "admin";
export type QuestionStatus = "draft" | "approved" | "rejected";
export type ExamStatus = "in_progress" | "completed" | "abandoned";
export type ReportReason =
  | "wrong_answer_key"
  | "typo_or_grammar_error"
  | "confusing_or_unclear"
  | "image_not_loading"
  | "not_relevant_to_upcat"
  | "others";
export type ResourceType = "youtube" | "article";
export type Choice = "a" | "b" | "c" | "d";

export interface Database {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          is_active: boolean;
          display_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          is_active?: boolean;
          display_order?: number | null;
        };
        Update: {
          name?: string;
          slug?: string;
          is_active?: boolean;
          display_order?: number | null;
        };
      };
      subtests: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          upcat_item_count: number;
          mock_item_count: number;
          display_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          upcat_item_count: number;
          mock_item_count: number;
          display_order?: number | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          upcat_item_count?: number;
          mock_item_count?: number;
          display_order?: number | null;
        };
      };
      topics: {
        Row: {
          id: string;
          subtest_id: string;
          name: string;
          slug: string;
          description: string | null;
          display_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subtest_id: string;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number | null;
        };
        Update: {
          subtest_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          display_order?: number | null;
        };
      };
      questions: {
        Row: {
          id: string;
          topic_id: string;
          question_text: string;
          image_url: string | null;
          choice_a: string;
          choice_b: string;
          choice_c: string;
          choice_d: string;
          correct_choice: Choice;
          explanation: string;
          difficulty: number;
          status: QuestionStatus;
          created_by: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          question_text: string;
          image_url?: string | null;
          choice_a: string;
          choice_b: string;
          choice_c: string;
          choice_d: string;
          correct_choice: Choice;
          explanation: string;
          difficulty?: number;
          status?: QuestionStatus;
          created_by?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          topic_id?: string;
          question_text?: string;
          image_url?: string | null;
          choice_a?: string;
          choice_b?: string;
          choice_c?: string;
          choice_d?: string;
          correct_choice?: Choice;
          explanation?: string;
          difficulty?: number;
          status?: QuestionStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          target_exam_date: string;
          target_university_id: string | null;
          streak_count: number;
          last_session_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          target_exam_date: string;
          target_university_id?: string | null;
          streak_count?: number;
          last_session_date?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          target_exam_date?: string;
          target_university_id?: string | null;
          streak_count?: number;
          last_session_date?: string | null;
        };
      };
      exam_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: "topic_practice" | "mock_exam";
          topic_id: string | null;
          status: ExamStatus;
          total_questions: number;
          correct_count: number;
          time_limit_seconds: number | null;
          time_spent_seconds: number | null;
          started_at: string;
          completed_at: string | null;
          question_ids: string[];
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: "topic_practice" | "mock_exam";
          topic_id?: string | null;
          status?: ExamStatus;
          total_questions: number;
          correct_count?: number;
          time_limit_seconds?: number | null;
          time_spent_seconds?: number | null;
          completed_at?: string | null;
          question_ids?: string[];
        };
        Update: {
          status?: ExamStatus;
          correct_count?: number;
          time_spent_seconds?: number | null;
          completed_at?: string | null;
        };
      };
      session_answers: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          chosen_choice: Choice | null;
          is_correct: boolean | null;
          answered_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_id: string;
          chosen_choice?: Choice | null;
          is_correct?: boolean | null;
        };
        Update: {
          chosen_choice?: Choice | null;
          is_correct?: boolean | null;
        };
      };
      user_topic_progress: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          total_attempts: number;
          correct_attempts: number;
          accuracy_percentage: number;
          last_practiced_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic_id: string;
          total_attempts?: number;
          correct_attempts?: number;
          accuracy_percentage?: number;
          last_practiced_at?: string | null;
        };
        Update: {
          total_attempts?: number;
          correct_attempts?: number;
          accuracy_percentage?: number;
          last_practiced_at?: string | null;
        };
      };
      question_reports: {
        Row: {
          id: string;
          question_id: string;
          user_id: string;
          reason: ReportReason;
          notes: string | null;
          is_resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          user_id: string;
          reason: ReportReason;
          notes?: string | null;
          is_resolved?: boolean;
        };
        Update: {
          is_resolved?: boolean;
        };
      };
      resources: {
        Row: {
          id: string;
          topic_id: string;
          title: string;
          description: string | null;
          resource_type: ResourceType;
          url: string;
          is_published: boolean;
          display_order: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          title: string;
          description?: string | null;
          resource_type?: ResourceType;
          url: string;
          is_published?: boolean;
          display_order?: number | null;
          created_by?: string | null;
        };
        Update: {
          topic_id?: string;
          title?: string;
          description?: string | null;
          resource_type?: ResourceType;
          url?: string;
          is_published?: boolean;
          display_order?: number | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      question_status: QuestionStatus;
      exam_status: ExamStatus;
      report_reason: ReportReason;
      resource_type: ResourceType;
    };
  };
}
