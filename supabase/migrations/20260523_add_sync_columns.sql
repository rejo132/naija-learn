-- Add missing columns to profiles table
-- for cross-device progress sync

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS
    lessons_completed integer
    DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS
    unlocked_achievements text[]
    DEFAULT '{}';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS
    unlocked_avatars text[]
    DEFAULT '{}';

-- Update existing rows to have
-- default values instead of null
UPDATE profiles
  SET lessons_completed = 0
  WHERE lessons_completed IS NULL;

UPDATE profiles
  SET unlocked_achievements = '{}'
  WHERE unlocked_achievements IS NULL;

UPDATE profiles
  SET unlocked_avatars = '{}'
  WHERE unlocked_avatars IS NULL;
