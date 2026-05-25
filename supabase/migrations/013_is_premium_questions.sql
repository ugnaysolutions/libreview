-- Add is_premium flag to questions.
-- Default true so all future inserts are premium unless explicitly set to false.
-- Grandfather all existing rows as free.

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT true;

UPDATE questions SET is_premium = false;
