-- Create user_books table for personal book lists
CREATE TABLE user_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('reading', 'read', 'want-to-read')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  date_finished TIMESTAMP WITH TIME ZONE,

  -- Denormalized book metadata
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  publish_year INTEGER,
  cover_url TEXT,
  isbn TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, book_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_user_books_user_id ON user_books(user_id);
CREATE INDEX idx_user_books_status ON user_books(user_id, status);

-- Enable Row Level Security
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own books"
  ON user_books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON user_books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON user_books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON user_books FOR DELETE
  USING (auth.uid() = user_id);
