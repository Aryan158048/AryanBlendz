-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Add weekly_schedules table
-- Run this once in your Supabase SQL Editor (supabase.co → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weekly_schedules (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT        NOT NULL CHECK (role IN ('admin', 'student')),
  semester      TEXT        NOT NULL DEFAULT 'Current',
  -- JSON map: { monday: [{id, start, end, title}], tuesday: [...], ... }
  -- Times stored as 24-hour "HH:MM" strings
  schedule_data JSONB       NOT NULL DEFAULT '{}',
  image_url     TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_schedules_role ON weekly_schedules(role, is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_schedules_user ON weekly_schedules(user_id);

-- Enable Row Level Security
ALTER TABLE weekly_schedules ENABLE ROW LEVEL SECURITY;

-- Admins can read and write all schedules
CREATE POLICY "weekly_schedules_admin_all"
  ON weekly_schedules FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Anyone (including anonymous visitors) can read the active admin schedule.
-- This is needed so the student-facing page can load the admin's busy times
-- for the overlap calculation without requiring the student to be logged in.
CREATE POLICY "weekly_schedules_public_read_admin"
  ON weekly_schedules FOR SELECT
  USING (role = 'admin' AND is_active = TRUE);
