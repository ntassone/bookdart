-- Create user_follows table for follower/following relationships
CREATE TABLE user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Prevent self-follows and duplicate follows
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  UNIQUE(follower_id, following_id)
);

-- Create indexes for efficient queries
-- Index for "who follows this user" (followers list)
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);
-- Index for "who does this user follow" (following list)
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
-- Composite index for checking if specific follow relationship exists
CREATE INDEX idx_user_follows_relationship ON user_follows(follower_id, following_id);

-- Enable Row Level Security
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone authenticated can view follow relationships (needed for displaying counts/lists)
CREATE POLICY "Authenticated users can view follows"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

-- Users can only create follows where they are the follower
CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Users can only delete follows where they are the follower (unfollow)
CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);
