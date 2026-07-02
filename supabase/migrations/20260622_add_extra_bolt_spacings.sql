-- Add extra_bolt_spacings column for universal wheels that fit multiple PCDs
-- A universal wheel can have 2-3 PCDs (e.g., a wheel fitting 5×100 AND 5×112 AND 5×108)
-- The primary bolt_spacing remains the first/main PCD; extra ones go here.
ALTER TABLE wheels
ADD COLUMN IF NOT EXISTS extra_bolt_spacings numeric[] DEFAULT NULL;
