-- Add optional array of additional discrete dates (e.g. "Batch 1: Apr 1, Batch 2: Apr 8").
-- NULL or empty = single/range mode; non-empty = multiple discrete dates alongside scheduled_date.
ALTER TABLE exam_schedules ADD COLUMN extra_dates DATE[];
