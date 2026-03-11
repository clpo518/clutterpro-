-- Add fluency_goal column to profiles for dual journey paths
-- 'speed' = cluttering/tachylalia path (default)
-- 'fluency' = stuttering/fluency path
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fluency_goal text DEFAULT 'speed';

-- Add check constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_fluency_goal_check
  CHECK (fluency_goal IN ('speed', 'fluency'));
