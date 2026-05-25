-- Find approved questions with identical question_text (case-insensitive, trimmed).
-- Keeps the oldest row (lowest id), deletes the rest.
-- Removes referencing session_answers rows first to satisfy the FK constraint.
--
-- Run this in the Supabase Dashboard SQL Editor.
-- Safe to run multiple times; subsequent runs will find 0 rows to delete.

BEGIN;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(question_text))
      ORDER BY id ASC
    ) AS rn
  FROM questions
  WHERE status = 'approved'
),
to_delete AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM session_answers
WHERE question_id IN (SELECT id FROM to_delete);

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(question_text))
      ORDER BY id ASC
    ) AS rn
  FROM questions
  WHERE status = 'approved'
),
to_delete AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM questions
WHERE id IN (SELECT id FROM to_delete);

COMMIT;
