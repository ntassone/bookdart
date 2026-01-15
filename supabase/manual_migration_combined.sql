-- Combined manual migration for Bookdart
-- Run this in your Supabase SQL editor

-- ========================================
-- PART 1: Add user preferences (fade_completed_books)
-- ========================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS fade_completed_books BOOLEAN DEFAULT false NOT NULL;

-- ========================================
-- PART 2: Support multiple lists per book
-- ========================================

-- Step 1: Drop the existing unique constraint
ALTER TABLE user_books DROP CONSTRAINT IF EXISTS user_books_user_id_book_id_key;

-- Step 2: Add new unique constraint on user_id, book_id, AND status
-- This allows the same book to exist in multiple lists for the same user
ALTER TABLE user_books ADD CONSTRAINT IF NOT EXISTS user_books_user_id_book_id_status_key
  UNIQUE(user_id, book_id, status);

-- Step 3: Update the index to include status
DROP INDEX IF EXISTS idx_user_books_user_id;
CREATE INDEX IF NOT EXISTS idx_user_books_user_id_book_id ON user_books(user_id, book_id);

-- Step 4: Add fields to track re-reads (these may already exist from previous migration)
ALTER TABLE user_books
  ADD COLUMN IF NOT EXISTS is_review_public BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE user_books
  ADD COLUMN IF NOT EXISTS read_count INTEGER DEFAULT 1 NOT NULL;

-- ========================================
-- Verification queries (optional - you can run these to verify)
-- ========================================
-- Check user_profiles structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_profiles';

-- Check user_books constraints:
-- SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'user_books' AND constraint_type = 'UNIQUE';
