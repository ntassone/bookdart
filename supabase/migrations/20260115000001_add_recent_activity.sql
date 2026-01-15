-- Add recent searches and recent books to user_profiles table
ALTER TABLE user_profiles
  ADD COLUMN recent_searches TEXT[] DEFAULT '{}' NOT NULL,
  ADD COLUMN recent_books JSONB DEFAULT '[]' NOT NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN user_profiles.recent_searches IS 'Array of recent search queries, max 5, ordered most recent first';
COMMENT ON COLUMN user_profiles.recent_books IS 'Array of recent book objects with full metadata, max 10, ordered most recent first';
