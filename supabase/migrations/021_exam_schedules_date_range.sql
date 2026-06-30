-- Add optional end date to support date ranges (e.g. "Application Period: Jun 1 – Aug 31")
-- NULL means single date; non-NULL means the milestone spans scheduled_date through date_end.
ALTER TABLE exam_schedules ADD COLUMN date_end DATE;
