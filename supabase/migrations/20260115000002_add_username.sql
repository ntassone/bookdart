-- Add username field to user_profiles table
ALTER TABLE user_profiles
  ADD COLUMN username TEXT UNIQUE,
  ADD CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$');

-- Create index for username lookups
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- Add comment explaining the column
COMMENT ON COLUMN user_profiles.username IS 'Unique username for the user, 3-30 characters, alphanumeric with underscores and hyphens';
