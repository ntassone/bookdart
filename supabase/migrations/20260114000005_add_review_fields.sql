-- Add public review flag and reread tracking to user_books table
-- This migration extends the existing user_books table to support:
-- 1. Public reviews that can be shared with all users
-- 2. Reread tracking to count how many times a user has read a book

-- Add new columns (only if they don't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_books' AND column_name = 'is_review_public'
  ) THEN
    ALTER TABLE user_books ADD COLUMN is_review_public BOOLEAN DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_books' AND column_name = 'read_count'
  ) THEN
    ALTER TABLE user_books ADD COLUMN read_count INTEGER DEFAULT 1 CHECK (read_count >= 1);
  END IF;
END $$;

-- Add index for efficient public review queries
-- This partial index only indexes rows that are actual public reviews
CREATE INDEX IF NOT EXISTS idx_user_books_public_reviews
  ON user_books(book_id, is_review_public)
  WHERE is_review_public = true AND status = 'read' AND rating IS NOT NULL;

-- Add index for book detail page queries (fetch all reviews for a book)
CREATE INDEX IF NOT EXISTS idx_user_books_book_id ON user_books(book_id);

-- Add RLS policy for public review access
-- This allows anyone (including unauthenticated users) to read public reviews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_books' AND policyname = 'Anyone can view public reviews'
  ) THEN
    CREATE POLICY "Anyone can view public reviews"
      ON user_books FOR SELECT
      USING (is_review_public = true);
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN user_books.is_review_public IS
  'When true, this user''s rating and notes are visible as a public review to all users';
COMMENT ON COLUMN user_books.read_count IS
  'Number of times user has read this book (1 = first read, 2+ = reread)';
