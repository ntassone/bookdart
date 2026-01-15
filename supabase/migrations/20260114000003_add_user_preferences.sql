-- Add user preferences to user_profiles table
ALTER TABLE user_profiles
  ADD COLUMN fade_completed_books BOOLEAN DEFAULT false NOT NULL;
