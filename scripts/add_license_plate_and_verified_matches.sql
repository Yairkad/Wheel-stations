-- Migration: Add license_plate to wheel_borrows and create verified_wheel_matches table
-- Run this in Supabase SQL Editor

-- 1. Add license_plate column to wheel_borrows table
ALTER TABLE wheel_borrows
ADD COLUMN IF NOT EXISTS license_plate VARCHAR(10) DEFAULT NULL;

-- 2. Create verified_wheel_matches table
-- This table stores successful wheel-vehicle matches from actual borrows
-- Used to build a 100% verified database of wheel compatibility
CREATE TABLE IF NOT EXISTS verified_wheel_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vehicle data (from license plate lookup)
  license_plate VARCHAR(10) NOT NULL,
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_year INTEGER,

  -- Wheel data (from the borrowed wheel)
  wheel_rim_size VARCHAR(10) NOT NULL,
  wheel_bolt_count INTEGER NOT NULL,
  wheel_bolt_spacing DECIMAL(5,2) NOT NULL,
  wheel_center_bore DECIMAL(5,2),
  wheel_is_donut BOOLEAN DEFAULT false,

  -- Source tracking
  borrow_id UUID REFERENCES wheel_borrows(id),
  station_id UUID REFERENCES wheel_stations(id),

  -- Verification status
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_by VARCHAR(100), -- 'system' or operator name

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate entries for same vehicle-wheel combination
  UNIQUE(license_plate, wheel_rim_size, wheel_bolt_count, wheel_bolt_spacing)
);

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verified_matches_vehicle
ON verified_wheel_matches (vehicle_make, vehicle_model, vehicle_year);

CREATE INDEX IF NOT EXISTS idx_verified_matches_wheel
ON verified_wheel_matches (wheel_bolt_count, wheel_bolt_spacing, wheel_rim_size);

CREATE INDEX IF NOT EXISTS idx_verified_matches_license
ON verified_wheel_matches (license_plate);

-- 4. Add comment explaining the table purpose
COMMENT ON TABLE verified_wheel_matches IS 'Stores verified wheel-vehicle matches from successful borrows. Used to build 100% accurate compatibility data.';

-- 5. Enable RLS (Row Level Security)
ALTER TABLE verified_wheel_matches ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for verified_wheel_matches
-- Anyone can read verified matches (public data)
CREATE POLICY "Anyone can read verified matches"
ON verified_wheel_matches FOR SELECT
USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert verified matches"
ON verified_wheel_matches FOR INSERT
WITH CHECK (true);
