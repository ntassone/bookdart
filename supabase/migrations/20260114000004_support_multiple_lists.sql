-- Migration to support books being in multiple lists simultaneously
-- Changes the unique constraint to allow multiple status entries per book

-- Step 1: Drop the existing unique constraint
ALTER TABLE user_books DROP CONSTRAINT IF EXISTS user_books_user_id_book_id_key;

-- Step 2: Add new unique constraint on user_id, book_id, AND status
-- This allows the same book to exist in multiple lists for the same user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_books_user_id_book_id_status_key'
  ) THEN
    ALTER TABLE user_books ADD CONSTRAINT user_books_user_id_book_id_status_key
      UNIQUE(user_id, book_id, status);
  END IF;
END $$;

-- Step 3: Update the index to include status
DROP INDEX IF EXISTS idx_user_books_user_id;
CREATE INDEX IF NOT EXISTS idx_user_books_user_id_book_id ON user_books(user_id, book_id);

-- Step 4: Add fields to track re-reads (will be no-op if they already exist from 20260114_add_review_fields.sql)
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
    ALTER TABLE user_books ADD COLUMN read_count INTEGER DEFAULT 1 NOT NULL;
  END IF;
END $$;
