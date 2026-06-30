-- Controls how scheduled_date (and date_end/extra_dates) are displayed.
-- 'exact'  → October 19, 2025   (full date known)
-- 'month'  → October 2025       (day unknown; store as YYYY-MM-01)
-- 'year'   → 2025               (month unknown; store as YYYY-01-01)
ALTER TABLE exam_schedules
  ADD COLUMN date_precision TEXT NOT NULL DEFAULT 'exact'
    CHECK (date_precision IN ('exact', 'month', 'year'));
