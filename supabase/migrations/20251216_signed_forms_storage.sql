-- Migration: Signed Forms Storage System
-- Date: 2025-12-16
-- Description: Add storage for signed borrow forms with 30-day retention

-- 1. Add notification_emails column to wheel_stations table
ALTER TABLE wheel_stations
ADD COLUMN IF NOT EXISTS notification_emails text[] DEFAULT '{}';

-- 2. Create table to track signed forms metadata
CREATE TABLE IF NOT EXISTS signed_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrow_id uuid NOT NULL REFERENCES wheel_borrows(id) ON DELETE CASCADE,
  station_id uuid NOT NULL REFERENCES wheel_stations(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_size integer,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  view_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  download_count integer DEFAULT 0,
  last_downloaded_at timestamptz,
  email_sent_to text[],
  email_sent_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_signed_forms_station_id ON signed_forms(station_id);
CREATE INDEX IF NOT EXISTS idx_signed_forms_borrow_id ON signed_forms(borrow_id);
CREATE INDEX IF NOT EXISTS idx_signed_forms_expires_at ON signed_forms(expires_at);

-- Enable RLS
ALTER TABLE signed_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Station managers can view their forms"
  ON signed_forms FOR SELECT
  USING (station_id IN (
    SELECT id FROM wheel_stations WHERE manager_password IS NOT NULL
  ));

CREATE POLICY "System can insert forms"
  ON signed_forms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update forms"
  ON signed_forms FOR UPDATE
  USING (true);

CREATE POLICY "System can delete expired forms"
  ON signed_forms FOR DELETE
  USING (expires_at < now());
