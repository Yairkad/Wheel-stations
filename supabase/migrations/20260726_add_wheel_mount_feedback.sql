-- Lets managers record, at return time, whether a wheel actually mounted on the
-- vehicle it was borrowed for (and why not, or an optional note when it did).
-- Powers the per-wheel "request history" list and the "similar vehicle failed
-- before" warning shown when a new request comes in for the same wheel.

ALTER TABLE wheel_borrows
  ADD COLUMN mount_result TEXT CHECK (mount_result IN ('success', 'failed')),
  ADD COLUMN mount_feedback_note TEXT CHECK (char_length(mount_feedback_note) <= 200),
  ADD COLUMN mount_feedback_at TIMESTAMPTZ,
  ADD COLUMN mount_feedback_by_manager_id UUID;
