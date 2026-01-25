-- Add progress column to user_books table
ALTER TABLE user_books
ADD COLUMN IF NOT EXISTS progress INTEGER CHECK (progress >= 0 AND progress <= 100);

-- Add comment to document the column
COMMENT ON COLUMN user_books.progress IS 'Reading progress as percentage (0-100)';

-- Set default progress to 0 for existing 'reading' status books
UPDATE user_books
SET progress = 0
WHERE status = 'reading' AND progress IS NULL;
