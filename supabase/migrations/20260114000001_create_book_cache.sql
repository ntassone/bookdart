-- Create book cache table for storing Open Library book data
-- This cache improves response times and data quality

CREATE TABLE book_cache (
  id TEXT PRIMARY KEY, -- Open Library ID (e.g., /works/OL45804W)
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL, -- Array of author names
  publish_year INTEGER, -- Validated year (1450-2100)
  cover_url TEXT,
  isbn TEXT[], -- Array of ISBNs
  description TEXT,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Index for efficient lookups
  CONSTRAINT valid_publish_year CHECK (publish_year IS NULL OR (publish_year >= 1450 AND publish_year <= 2100))
);

-- Index for cache expiration queries
CREATE INDEX idx_book_cache_cached_at ON book_cache(cached_at);

-- Enable RLS
ALTER TABLE book_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read from cache (public data)
CREATE POLICY "Anyone can read book cache"
  ON book_cache FOR SELECT
  USING (true);

-- Only authenticated users can write to cache (via API)
CREATE POLICY "Authenticated users can insert books"
  ON book_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON book_cache FOR UPDATE
  TO authenticated
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_book_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row updates
CREATE TRIGGER book_cache_updated_at
  BEFORE UPDATE ON book_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_book_cache_updated_at();
