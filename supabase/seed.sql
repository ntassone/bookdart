-- Seed file for local development test accounts
-- Run with: supabase db reset

-- ============================================================================
-- TEST USERS
-- ============================================================================
-- Note: Supabase local dev uses a special function to create auth users in seed files
-- Password for all accounts: password123

-- Create test users in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  email_change,
  email_change_token_new,
  email_change_token_current,
  phone_change,
  phone_change_token,
  reauthentication_token
) VALUES
  -- New User (empty account)
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'newuser@test.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  -- Reader (casual user with ~20 books)
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'reader@test.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  -- Collector (power user with 100+ books)
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'collector@test.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    '',
    '',
    '',
    '',
    '',
    ''
  );

-- Create identities for each user (required for auth to work)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'newuser@test.local',
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "newuser@test.local"}',
    'email',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'reader@test.local',
    '{"sub": "22222222-2222-2222-2222-222222222222", "email": "reader@test.local"}',
    'email',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'collector@test.local',
    '{"sub": "33333333-3333-3333-3333-333333333333", "email": "collector@test.local"}',
    'email',
    NOW(),
    NOW(),
    NOW()
  );

-- ============================================================================
-- BOOK CACHE (required for favorites to display)
-- ============================================================================
-- Favorites are fetched from book_cache, so we need to seed the books used as favorites
INSERT INTO book_cache (id, title, authors, publish_year, cover_url, isbn) VALUES
  -- Reader's favorites
  ('OL45883W', '1984', ARRAY['George Orwell'], 1949, 'https://covers.openlibrary.org/b/id/12648655-L.jpg', ARRAY['9780451524935']),
  ('OL103123W', 'Pride and Prejudice', ARRAY['Jane Austen'], 1813, 'https://covers.openlibrary.org/b/id/12645114-L.jpg', ARRAY['9780141439518']),
  -- Collector's favorites (includes reader's plus 2 more)
  ('OL27448W', 'The Great Gatsby', ARRAY['F. Scott Fitzgerald'], 1925, 'https://covers.openlibrary.org/b/id/7222246-L.jpg', ARRAY['9780743273565']),
  ('OL82563W', 'To Kill a Mockingbird', ARRAY['Harper Lee'], 1960, 'https://covers.openlibrary.org/b/id/8314143-L.jpg', ARRAY['9780060935467']);

-- ============================================================================
-- USER PROFILES (created by trigger, but we update with usernames)
-- ============================================================================
-- The trigger creates profiles automatically, so we just update them

-- newuser: Empty fresh account
UPDATE user_profiles SET username = 'newuser' WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- reader: Casual user with some activity
UPDATE user_profiles SET
  username = 'reader',
  recent_searches = ARRAY['project hail mary', 'andy weir', 'dystopian fiction'],
  recent_books = '[
    {"id": "OL2163649W", "title": "Project Hail Mary", "authors": ["Andy Weir"], "publishYear": 2021, "coverUrl": "https://covers.openlibrary.org/b/id/10441415-L.jpg"},
    {"id": "OL45883W", "title": "1984", "authors": ["George Orwell"], "publishYear": 1949, "coverUrl": "https://covers.openlibrary.org/b/id/12648655-L.jpg"},
    {"id": "OL52186W", "title": "Dune", "authors": ["Frank Herbert"], "publishYear": 1965, "coverUrl": "https://covers.openlibrary.org/b/id/11153217-L.jpg"},
    {"id": "OL35137805W", "title": "The Silent Patient", "authors": ["Alex Michaelides"], "publishYear": 2019, "coverUrl": "https://covers.openlibrary.org/b/id/12547184-L.jpg"}
  ]'::jsonb
WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- collector: Power user with lots of activity
UPDATE user_profiles SET
  username = 'collector',
  favorite_books = ARRAY['OL27448W', 'OL45883W', 'OL103123W', 'OL82563W'],
  fade_completed_books = true,
  recent_searches = ARRAY['murakami', 'epic fantasy', 'literary fiction', 'science fiction', 'classics'],
  recent_books = '[
    {"id": "OL27448W", "title": "The Great Gatsby", "authors": ["F. Scott Fitzgerald"], "publishYear": 1925, "coverUrl": "https://covers.openlibrary.org/b/id/7222246-L.jpg"},
    {"id": "OL45883W", "title": "1984", "authors": ["George Orwell"], "publishYear": 1949, "coverUrl": "https://covers.openlibrary.org/b/id/12648655-L.jpg"},
    {"id": "OL468431W", "title": "The Name of the Wind", "authors": ["Patrick Rothfuss"], "publishYear": 2007, "coverUrl": "https://covers.openlibrary.org/b/id/8560501-L.jpg"},
    {"id": "OL46540W", "title": "Foundation", "authors": ["Isaac Asimov"], "publishYear": 1951, "coverUrl": "https://covers.openlibrary.org/b/id/6540214-L.jpg"},
    {"id": "OL117198W", "title": "Enders Game", "authors": ["Orson Scott Card"], "publishYear": 1985, "coverUrl": "https://covers.openlibrary.org/b/id/8772003-L.jpg"},
    {"id": "OL82592W", "title": "Harry Potter and the Sorcerers Stone", "authors": ["J.K. Rowling"], "publishYear": 1997, "coverUrl": "https://covers.openlibrary.org/b/id/10521276-L.jpg"},
    {"id": "OL27213W", "title": "Crime and Punishment", "authors": ["Fyodor Dostoevsky"], "publishYear": 1866, "coverUrl": "https://covers.openlibrary.org/b/id/12648657-L.jpg"},
    {"id": "OL16247497W", "title": "All the Light We Cannot See", "authors": ["Anthony Doerr"], "publishYear": 2014, "coverUrl": "https://covers.openlibrary.org/b/id/8356254-L.jpg"},
    {"id": "OL8193420W", "title": "Meditations", "authors": ["Marcus Aurelius"], "publishYear": 180, "coverUrl": "https://covers.openlibrary.org/b/id/8311911-L.jpg"},
    {"id": "OL2636674W", "title": "Good Omens", "authors": ["Terry Pratchett", "Neil Gaiman"], "publishYear": 1990, "coverUrl": "https://covers.openlibrary.org/b/id/12574769-L.jpg"}
  ]'::jsonb
WHERE user_id = '33333333-3333-3333-3333-333333333333';

-- ============================================================================
-- READER'S BOOKS (~20 books)
-- ============================================================================
INSERT INTO user_books (user_id, book_id, status, rating, notes, title, authors, publish_year, cover_url, is_review_public, read_count, progress, date_finished) VALUES
  -- Currently reading (3)
  ('22222222-2222-2222-2222-222222222222', 'OL27448W', 'reading', NULL, NULL, 'The Great Gatsby', ARRAY['F. Scott Fitzgerald'], 1925, 'https://covers.openlibrary.org/b/id/7222246-L.jpg', false, 1, 45, NULL),
  ('22222222-2222-2222-2222-222222222222', 'OL2163649W', 'reading', NULL, 'Really enjoying this so far', 'Project Hail Mary', ARRAY['Andy Weir'], 2021, 'https://covers.openlibrary.org/b/id/10441415-L.jpg', false, 1, 72, NULL),
  ('22222222-2222-2222-2222-222222222222', 'OL17930368W', 'reading', NULL, NULL, 'Atomic Habits', ARRAY['James Clear'], 2018, 'https://covers.openlibrary.org/b/id/10958382-L.jpg', false, 1, 15, NULL),

  -- Read (12)
  ('22222222-2222-2222-2222-222222222222', 'OL45883W', 'read', 5, 'A masterpiece of dystopian fiction. The world-building is incredible.', '1984', ARRAY['George Orwell'], 1949, 'https://covers.openlibrary.org/b/id/12648655-L.jpg', true, 2, NULL, NOW() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL103123W', 'read', 5, 'Witty and romantic - a perfect classic', 'Pride and Prejudice', ARRAY['Jane Austen'], 1813, 'https://covers.openlibrary.org/b/id/12645114-L.jpg', true, 1, NULL, NOW() - INTERVAL '60 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL82563W', 'read', 5, NULL, 'To Kill a Mockingbird', ARRAY['Harper Lee'], 1960, 'https://covers.openlibrary.org/b/id/8314143-L.jpg', false, 1, NULL, NOW() - INTERVAL '90 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL52186W', 'read', 4, 'Mind-bending but sometimes hard to follow', 'Dune', ARRAY['Frank Herbert'], 1965, 'https://covers.openlibrary.org/b/id/11153217-L.jpg', true, 1, NULL, NOW() - INTERVAL '45 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL14933414W', 'read', 4, NULL, 'The Martian', ARRAY['Andy Weir'], 2011, 'https://covers.openlibrary.org/b/id/8108162-L.jpg', false, 1, NULL, NOW() - INTERVAL '120 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL893415W', 'read', 5, 'Changed how I think about thinking', 'Thinking, Fast and Slow', ARRAY['Daniel Kahneman'], 2011, 'https://covers.openlibrary.org/b/id/8761821-L.jpg', true, 1, NULL, NOW() - INTERVAL '150 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL66554W', 'read', 4, NULL, 'The Hobbit', ARRAY['J.R.R. Tolkien'], 1937, 'https://covers.openlibrary.org/b/id/8406786-L.jpg', false, 1, NULL, NOW() - INTERVAL '200 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL15413843W', 'read', 3, 'Good but overhyped', 'Ready Player One', ARRAY['Ernest Cline'], 2011, 'https://covers.openlibrary.org/b/id/8231856-L.jpg', true, 1, NULL, NOW() - INTERVAL '180 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL35137805W', 'read', 5, 'Absolutely gripping from start to finish', 'The Silent Patient', ARRAY['Alex Michaelides'], 2019, 'https://covers.openlibrary.org/b/id/12547184-L.jpg', true, 1, NULL, NOW() - INTERVAL '75 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL81618W', 'read', 4, NULL, 'Brave New World', ARRAY['Aldous Huxley'], 1932, 'https://covers.openlibrary.org/b/id/6978353-L.jpg', false, 1, NULL, NOW() - INTERVAL '250 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL27516W', 'read', 4, 'A haunting meditation on memory', 'Never Let Me Go', ARRAY['Kazuo Ishiguro'], 2005, 'https://covers.openlibrary.org/b/id/8308026-L.jpg', true, 1, NULL, NOW() - INTERVAL '100 days'),
  ('22222222-2222-2222-2222-222222222222', 'OL17860744W', 'read', 3, NULL, 'The Alchemist', ARRAY['Paulo Coelho'], 1988, 'https://covers.openlibrary.org/b/id/12749240-L.jpg', false, 1, NULL, NOW() - INTERVAL '300 days'),

  -- Want to read (7)
  ('22222222-2222-2222-2222-222222222222', 'OL24181480W', 'want-to-read', NULL, NULL, 'The Midnight Library', ARRAY['Matt Haig'], 2020, 'https://covers.openlibrary.org/b/id/10389354-L.jpg', false, 1, NULL, NULL),
  ('22222222-2222-2222-2222-222222222222', 'OL82536W', 'want-to-read', NULL, 'Recommended by a friend', 'The Catcher in the Rye', ARRAY['J.D. Salinger'], 1951, 'https://covers.openlibrary.org/b/id/8231432-L.jpg', false, 1, NULL, NULL),
  ('22222222-2222-2222-2222-222222222222', 'OL468431W', 'want-to-read', NULL, NULL, 'The Name of the Wind', ARRAY['Patrick Rothfuss'], 2007, 'https://covers.openlibrary.org/b/id/8560501-L.jpg', false, 1, NULL, NULL),
  ('22222222-2222-2222-2222-222222222222', 'OL17356039W', 'want-to-read', NULL, NULL, 'Educated', ARRAY['Tara Westover'], 2018, 'https://covers.openlibrary.org/b/id/8512586-L.jpg', false, 1, NULL, NULL),
  ('22222222-2222-2222-2222-222222222222', 'OL27213W', 'want-to-read', NULL, NULL, 'Crime and Punishment', ARRAY['Fyodor Dostoevsky'], 1866, 'https://covers.openlibrary.org/b/id/12648657-L.jpg', false, 1, NULL, NULL),
  ('22222222-2222-2222-2222-222222222222', 'OL46125W', 'want-to-read', NULL, 'Need to read before the new movie', 'The Lord of the Rings', ARRAY['J.R.R. Tolkien'], 1954, 'https://covers.openlibrary.org/b/id/8743775-L.jpg', false, 1, NULL, NULL),
  ('22222222-2222-2222-2222-222222222222', 'OL5735363W', 'want-to-read', NULL, NULL, 'Sapiens', ARRAY['Yuval Noah Harari'], 2011, 'https://covers.openlibrary.org/b/id/8324389-L.jpg', false, 1, NULL, NULL);

-- Set reader's favorite books
UPDATE user_profiles SET favorite_books = ARRAY['OL45883W', 'OL103123W']
WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- ============================================================================
-- COLLECTOR'S BOOKS (100+ books - all statuses)
-- ============================================================================
-- Currently reading (5)
INSERT INTO user_books (user_id, book_id, status, rating, notes, title, authors, publish_year, cover_url, is_review_public, read_count, progress) VALUES
  ('33333333-3333-3333-3333-333333333333', 'OL27448W', 'reading', NULL, NULL, 'The Great Gatsby', ARRAY['F. Scott Fitzgerald'], 1925, 'https://covers.openlibrary.org/b/id/7222246-L.jpg', false, 1, 80),
  ('33333333-3333-3333-3333-333333333333', 'OL52186W', 'reading', NULL, 'Second time through', 'Dune', ARRAY['Frank Herbert'], 1965, 'https://covers.openlibrary.org/b/id/11153217-L.jpg', false, 2, 30),
  ('33333333-3333-3333-3333-333333333333', 'OL17930368W', 'reading', NULL, NULL, 'Atomic Habits', ARRAY['James Clear'], 2018, 'https://covers.openlibrary.org/b/id/10958382-L.jpg', false, 1, 55),
  ('33333333-3333-3333-3333-333333333333', 'OL24181480W', 'reading', NULL, NULL, 'The Midnight Library', ARRAY['Matt Haig'], 2020, 'https://covers.openlibrary.org/b/id/10389354-L.jpg', false, 1, 25),
  ('33333333-3333-3333-3333-333333333333', 'OL8479867W', 'reading', NULL, NULL, 'A Game of Thrones', ARRAY['George R.R. Martin'], 1996, 'https://covers.openlibrary.org/b/id/8327569-L.jpg', false, 1, 60);

-- Read books (75 books with varied ratings and reviews)
INSERT INTO user_books (user_id, book_id, status, rating, notes, title, authors, publish_year, cover_url, is_review_public, read_count, date_finished) VALUES
  -- 5-star reads
  ('33333333-3333-3333-3333-333333333333', 'OL45883W', 'read', 5, 'One of the greatest novels ever written', '1984', ARRAY['George Orwell'], 1949, 'https://covers.openlibrary.org/b/id/12648655-L.jpg', true, 3, NOW() - INTERVAL '10 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL103123W', 'read', 5, 'Perfection in novel form', 'Pride and Prejudice', ARRAY['Jane Austen'], 1813, 'https://covers.openlibrary.org/b/id/12645114-L.jpg', true, 2, NOW() - INTERVAL '20 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL82563W', 'read', 5, 'Essential reading', 'To Kill a Mockingbird', ARRAY['Harper Lee'], 1960, 'https://covers.openlibrary.org/b/id/8314143-L.jpg', true, 2, NOW() - INTERVAL '25 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL66554W', 'read', 5, 'My favorite fantasy novel', 'The Hobbit', ARRAY['J.R.R. Tolkien'], 1937, 'https://covers.openlibrary.org/b/id/8406786-L.jpg', true, 4, NOW() - INTERVAL '30 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL46125W', 'read', 5, 'An epic journey', 'The Lord of the Rings', ARRAY['J.R.R. Tolkien'], 1954, 'https://covers.openlibrary.org/b/id/8743775-L.jpg', true, 3, NOW() - INTERVAL '35 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL893415W', 'read', 5, NULL, 'Thinking, Fast and Slow', ARRAY['Daniel Kahneman'], 2011, 'https://covers.openlibrary.org/b/id/8761821-L.jpg', false, 1, NOW() - INTERVAL '40 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL35137805W', 'read', 5, NULL, 'The Silent Patient', ARRAY['Alex Michaelides'], 2019, 'https://covers.openlibrary.org/b/id/12547184-L.jpg', false, 1, NOW() - INTERVAL '45 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL2163649W', 'read', 5, 'Better than The Martian', 'Project Hail Mary', ARRAY['Andy Weir'], 2021, 'https://covers.openlibrary.org/b/id/10441415-L.jpg', true, 1, NOW() - INTERVAL '50 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL27213W', 'read', 5, 'Dense but rewarding', 'Crime and Punishment', ARRAY['Fyodor Dostoevsky'], 1866, 'https://covers.openlibrary.org/b/id/12648657-L.jpg', true, 1, NOW() - INTERVAL '55 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL468431W', 'read', 5, 'Still waiting for book 3...', 'The Name of the Wind', ARRAY['Patrick Rothfuss'], 2007, 'https://covers.openlibrary.org/b/id/8560501-L.jpg', true, 2, NOW() - INTERVAL '60 days'),

  -- 4-star reads
  ('33333333-3333-3333-3333-333333333333', 'OL14933414W', 'read', 4, 'Great science, fun read', 'The Martian', ARRAY['Andy Weir'], 2011, 'https://covers.openlibrary.org/b/id/8108162-L.jpg', true, 1, NOW() - INTERVAL '65 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL81618W', 'read', 4, NULL, 'Brave New World', ARRAY['Aldous Huxley'], 1932, 'https://covers.openlibrary.org/b/id/6978353-L.jpg', false, 1, NOW() - INTERVAL '70 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL27516W', 'read', 4, NULL, 'Never Let Me Go', ARRAY['Kazuo Ishiguro'], 2005, 'https://covers.openlibrary.org/b/id/8308026-L.jpg', false, 1, NOW() - INTERVAL '75 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL82536W', 'read', 4, 'I get why people love it', 'The Catcher in the Rye', ARRAY['J.D. Salinger'], 1951, 'https://covers.openlibrary.org/b/id/8231432-L.jpg', true, 1, NOW() - INTERVAL '80 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL17356039W', 'read', 4, 'Incredible memoir', 'Educated', ARRAY['Tara Westover'], 2018, 'https://covers.openlibrary.org/b/id/8512586-L.jpg', true, 1, NOW() - INTERVAL '85 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL5735363W', 'read', 4, NULL, 'Sapiens', ARRAY['Yuval Noah Harari'], 2011, 'https://covers.openlibrary.org/b/id/8324389-L.jpg', false, 1, NOW() - INTERVAL '90 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL17860744W', 'read', 4, 'Simple but meaningful', 'The Alchemist', ARRAY['Paulo Coelho'], 1988, 'https://covers.openlibrary.org/b/id/12749240-L.jpg', true, 1, NOW() - INTERVAL '95 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL15413843W', 'read', 4, 'Nostalgia trip', 'Ready Player One', ARRAY['Ernest Cline'], 2011, 'https://covers.openlibrary.org/b/id/8231856-L.jpg', false, 1, NOW() - INTERVAL '100 days'),

  -- More varied ratings (3 stars)
  ('33333333-3333-3333-3333-333333333333', 'OL1168083W', 'read', 3, NULL, 'The Da Vinci Code', ARRAY['Dan Brown'], 2003, 'https://covers.openlibrary.org/b/id/8458547-L.jpg', false, 1, NOW() - INTERVAL '110 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL47755W', 'read', 3, 'Interesting but dated', 'Fahrenheit 451', ARRAY['Ray Bradbury'], 1953, 'https://covers.openlibrary.org/b/id/9273938-L.jpg', true, 1, NOW() - INTERVAL '115 days'),

  -- Classic literature
  ('33333333-3333-3333-3333-333333333333', 'OL267096W', 'read', 5, NULL, 'Jane Eyre', ARRAY['Charlotte Bronte'], 1847, 'https://covers.openlibrary.org/b/id/12003257-L.jpg', false, 1, NOW() - INTERVAL '120 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL21177W', 'read', 4, NULL, 'Wuthering Heights', ARRAY['Emily Bronte'], 1847, 'https://covers.openlibrary.org/b/id/12818044-L.jpg', false, 1, NOW() - INTERVAL '125 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL15264W', 'read', 5, NULL, 'Great Expectations', ARRAY['Charles Dickens'], 1861, 'https://covers.openlibrary.org/b/id/12813507-L.jpg', true, 1, NOW() - INTERVAL '130 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL76837W', 'read', 4, NULL, 'The Picture of Dorian Gray', ARRAY['Oscar Wilde'], 1890, 'https://covers.openlibrary.org/b/id/12813499-L.jpg', true, 1, NOW() - INTERVAL '135 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL38586W', 'read', 4, NULL, 'Frankenstein', ARRAY['Mary Shelley'], 1818, 'https://covers.openlibrary.org/b/id/6282573-L.jpg', false, 1, NOW() - INTERVAL '140 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL14863W', 'read', 3, NULL, 'Dracula', ARRAY['Bram Stoker'], 1897, 'https://covers.openlibrary.org/b/id/8759171-L.jpg', false, 1, NOW() - INTERVAL '145 days'),

  -- Modern fiction
  ('33333333-3333-3333-3333-333333333333', 'OL14906561W', 'read', 4, NULL, 'Gone Girl', ARRAY['Gillian Flynn'], 2012, 'https://covers.openlibrary.org/b/id/8477640-L.jpg', false, 1, NOW() - INTERVAL '150 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL17076986W', 'read', 4, NULL, 'The Girl on the Train', ARRAY['Paula Hawkins'], 2015, 'https://covers.openlibrary.org/b/id/8387389-L.jpg', false, 1, NOW() - INTERVAL '155 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL20648215W', 'read', 5, NULL, 'Where the Crawdads Sing', ARRAY['Delia Owens'], 2018, 'https://covers.openlibrary.org/b/id/10521270-L.jpg', true, 1, NOW() - INTERVAL '160 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL27210394W', 'read', 4, NULL, 'Circe', ARRAY['Madeline Miller'], 2018, 'https://covers.openlibrary.org/b/id/8510714-L.jpg', true, 1, NOW() - INTERVAL '165 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL17318053W', 'read', 5, NULL, 'The Song of Achilles', ARRAY['Madeline Miller'], 2011, 'https://covers.openlibrary.org/b/id/12547187-L.jpg', true, 1, NOW() - INTERVAL '170 days'),

  -- Science fiction
  ('33333333-3333-3333-3333-333333333333', 'OL46540W', 'read', 5, NULL, 'Foundation', ARRAY['Isaac Asimov'], 1951, 'https://covers.openlibrary.org/b/id/6540214-L.jpg', true, 2, NOW() - INTERVAL '175 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL46847W', 'read', 4, NULL, 'Neuromancer', ARRAY['William Gibson'], 1984, 'https://covers.openlibrary.org/b/id/8331557-L.jpg', false, 1, NOW() - INTERVAL '180 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL117198W', 'read', 5, NULL, 'Enders Game', ARRAY['Orson Scott Card'], 1985, 'https://covers.openlibrary.org/b/id/8772003-L.jpg', true, 2, NOW() - INTERVAL '185 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL27258W', 'read', 4, NULL, 'Slaughterhouse-Five', ARRAY['Kurt Vonnegut'], 1969, 'https://covers.openlibrary.org/b/id/9306388-L.jpg', true, 1, NOW() - INTERVAL '190 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL893268W', 'read', 4, NULL, 'The Hitchhikers Guide to the Galaxy', ARRAY['Douglas Adams'], 1979, 'https://covers.openlibrary.org/b/id/8769371-L.jpg', true, 1, NOW() - INTERVAL '195 days'),

  -- Fantasy
  ('33333333-3333-3333-3333-333333333333', 'OL82548W', 'read', 4, NULL, 'The Chronicles of Narnia', ARRAY['C.S. Lewis'], 1950, 'https://covers.openlibrary.org/b/id/8459033-L.jpg', false, 1, NOW() - INTERVAL '200 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL82592W', 'read', 5, NULL, 'Harry Potter and the Sorcerers Stone', ARRAY['J.K. Rowling'], 1997, 'https://covers.openlibrary.org/b/id/10521276-L.jpg', true, 3, NOW() - INTERVAL '205 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL21479W', 'read', 4, NULL, 'American Gods', ARRAY['Neil Gaiman'], 2001, 'https://covers.openlibrary.org/b/id/12547192-L.jpg', false, 1, NOW() - INTERVAL '210 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL2636674W', 'read', 5, NULL, 'Good Omens', ARRAY['Terry Pratchett', 'Neil Gaiman'], 1990, 'https://covers.openlibrary.org/b/id/12574769-L.jpg', true, 1, NOW() - INTERVAL '215 days'),

  -- Non-fiction
  ('33333333-3333-3333-3333-333333333333', 'OL34199W', 'read', 4, NULL, 'A Brief History of Time', ARRAY['Stephen Hawking'], 1988, 'https://covers.openlibrary.org/b/id/8311903-L.jpg', true, 1, NOW() - INTERVAL '220 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL2751755W', 'read', 5, NULL, 'The Immortal Life of Henrietta Lacks', ARRAY['Rebecca Skloot'], 2010, 'https://covers.openlibrary.org/b/id/6766578-L.jpg', true, 1, NOW() - INTERVAL '225 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL27776W', 'read', 4, NULL, 'Into the Wild', ARRAY['Jon Krakauer'], 1996, 'https://covers.openlibrary.org/b/id/8311913-L.jpg', false, 1, NOW() - INTERVAL '230 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL5735824W', 'read', 4, NULL, 'Outliers', ARRAY['Malcolm Gladwell'], 2008, 'https://covers.openlibrary.org/b/id/6766580-L.jpg', false, 1, NOW() - INTERVAL '235 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL16803543W', 'read', 3, NULL, 'The Subtle Art of Not Giving a F*ck', ARRAY['Mark Manson'], 2016, 'https://covers.openlibrary.org/b/id/10518647-L.jpg', false, 1, NOW() - INTERVAL '240 days'),

  -- Mystery/Thriller
  ('33333333-3333-3333-3333-333333333333', 'OL47206W', 'read', 4, NULL, 'And Then There Were None', ARRAY['Agatha Christie'], 1939, 'https://covers.openlibrary.org/b/id/8759159-L.jpg', true, 1, NOW() - INTERVAL '245 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL472808W', 'read', 4, NULL, 'The Girl with the Dragon Tattoo', ARRAY['Stieg Larsson'], 2005, 'https://covers.openlibrary.org/b/id/8233025-L.jpg', false, 1, NOW() - INTERVAL '250 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL27362W', 'read', 4, NULL, 'In Cold Blood', ARRAY['Truman Capote'], 1966, 'https://covers.openlibrary.org/b/id/8311901-L.jpg', true, 1, NOW() - INTERVAL '255 days'),

  -- Philosophy/Self-help
  ('33333333-3333-3333-3333-333333333333', 'OL8193420W', 'read', 5, NULL, 'Meditations', ARRAY['Marcus Aurelius'], 180, 'https://covers.openlibrary.org/b/id/8311911-L.jpg', true, 2, NOW() - INTERVAL '260 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL166894W', 'read', 4, NULL, 'Man''s Search for Meaning', ARRAY['Viktor Frankl'], 1946, 'https://covers.openlibrary.org/b/id/8251605-L.jpg', true, 1, NOW() - INTERVAL '265 days'),

  -- More classics
  ('33333333-3333-3333-3333-333333333333', 'OL15099W', 'read', 4, NULL, 'The Count of Monte Cristo', ARRAY['Alexandre Dumas'], 1844, 'https://covers.openlibrary.org/b/id/8762932-L.jpg', false, 1, NOW() - INTERVAL '270 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL27482W', 'read', 3, NULL, 'Moby Dick', ARRAY['Herman Melville'], 1851, 'https://covers.openlibrary.org/b/id/12006522-L.jpg', true, 1, NOW() - INTERVAL '275 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL45308W', 'read', 4, NULL, 'Anna Karenina', ARRAY['Leo Tolstoy'], 1877, 'https://covers.openlibrary.org/b/id/8762934-L.jpg', false, 1, NOW() - INTERVAL '280 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL45304W', 'read', 5, NULL, 'War and Peace', ARRAY['Leo Tolstoy'], 1869, 'https://covers.openlibrary.org/b/id/8762936-L.jpg', true, 1, NOW() - INTERVAL '285 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL505192W', 'read', 5, NULL, 'The Brothers Karamazov', ARRAY['Fyodor Dostoevsky'], 1880, 'https://covers.openlibrary.org/b/id/12648659-L.jpg', true, 1, NOW() - INTERVAL '290 days'),

  -- Contemporary literary fiction
  ('33333333-3333-3333-3333-333333333333', 'OL15336566W', 'read', 4, NULL, 'The Kite Runner', ARRAY['Khaled Hosseini'], 2003, 'https://covers.openlibrary.org/b/id/8311907-L.jpg', true, 1, NOW() - INTERVAL '295 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL17844890W', 'read', 5, NULL, 'A Thousand Splendid Suns', ARRAY['Khaled Hosseini'], 2007, 'https://covers.openlibrary.org/b/id/8311909-L.jpg', true, 1, NOW() - INTERVAL '300 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL19738561W', 'read', 4, NULL, 'Life of Pi', ARRAY['Yann Martel'], 2001, 'https://covers.openlibrary.org/b/id/8765925-L.jpg', false, 1, NOW() - INTERVAL '305 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL28127W', 'read', 4, NULL, 'The Road', ARRAY['Cormac McCarthy'], 2006, 'https://covers.openlibrary.org/b/id/8576449-L.jpg', true, 1, NOW() - INTERVAL '310 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL16247497W', 'read', 5, NULL, 'All the Light We Cannot See', ARRAY['Anthony Doerr'], 2014, 'https://covers.openlibrary.org/b/id/8356254-L.jpg', true, 1, NOW() - INTERVAL '315 days'),

  -- Horror
  ('33333333-3333-3333-3333-333333333333', 'OL81614W', 'read', 4, NULL, 'The Shining', ARRAY['Stephen King'], 1977, 'https://covers.openlibrary.org/b/id/8765927-L.jpg', false, 1, NOW() - INTERVAL '320 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL81634W', 'read', 5, NULL, 'It', ARRAY['Stephen King'], 1986, 'https://covers.openlibrary.org/b/id/8765929-L.jpg', true, 1, NOW() - INTERVAL '325 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL81603W', 'read', 4, NULL, 'Pet Sematary', ARRAY['Stephen King'], 1983, 'https://covers.openlibrary.org/b/id/8765931-L.jpg', false, 1, NOW() - INTERVAL '330 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL97971W', 'read', 3, NULL, 'House of Leaves', ARRAY['Mark Z. Danielewski'], 2000, 'https://covers.openlibrary.org/b/id/8765933-L.jpg', true, 1, NOW() - INTERVAL '335 days'),

  -- Romance
  ('33333333-3333-3333-3333-333333333333', 'OL27331W', 'read', 3, NULL, 'The Notebook', ARRAY['Nicholas Sparks'], 1996, 'https://covers.openlibrary.org/b/id/8765935-L.jpg', false, 1, NOW() - INTERVAL '340 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL48225W', 'read', 4, NULL, 'Outlander', ARRAY['Diana Gabaldon'], 1991, 'https://covers.openlibrary.org/b/id/8765937-L.jpg', true, 1, NOW() - INTERVAL '345 days'),

  -- Humor
  ('33333333-3333-3333-3333-333333333333', 'OL1829018W', 'read', 4, NULL, 'Catch-22', ARRAY['Joseph Heller'], 1961, 'https://covers.openlibrary.org/b/id/8765939-L.jpg', true, 1, NOW() - INTERVAL '350 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL76631W', 'read', 5, NULL, 'The Color Purple', ARRAY['Alice Walker'], 1982, 'https://covers.openlibrary.org/b/id/8765941-L.jpg', true, 1, NOW() - INTERVAL '355 days'),
  ('33333333-3333-3333-3333-333333333333', 'OL53908W', 'read', 5, NULL, 'Beloved', ARRAY['Toni Morrison'], 1987, 'https://covers.openlibrary.org/b/id/8765943-L.jpg', true, 1, NOW() - INTERVAL '360 days');

-- Want to read (25 books)
INSERT INTO user_books (user_id, book_id, status, title, authors, publish_year, cover_url, is_review_public, read_count) VALUES
  ('33333333-3333-3333-3333-333333333333', 'OL20893680W', 'want-to-read', 'The House in the Cerulean Sea', ARRAY['TJ Klune'], 2020, 'https://covers.openlibrary.org/b/id/10389356-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL20617287W', 'want-to-read', 'Piranesi', ARRAY['Susanna Clarke'], 2020, 'https://covers.openlibrary.org/b/id/10389358-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL21084094W', 'want-to-read', 'Klara and the Sun', ARRAY['Kazuo Ishiguro'], 2021, 'https://covers.openlibrary.org/b/id/10389360-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL19358864W', 'want-to-read', 'The Seven Husbands of Evelyn Hugo', ARRAY['Taylor Jenkins Reid'], 2017, 'https://covers.openlibrary.org/b/id/10389362-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL17709878W', 'want-to-read', 'Dark Matter', ARRAY['Blake Crouch'], 2016, 'https://covers.openlibrary.org/b/id/10389364-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL17861159W', 'want-to-read', 'The Three-Body Problem', ARRAY['Liu Cixin'], 2008, 'https://covers.openlibrary.org/b/id/10389366-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL27799W', 'want-to-read', 'East of Eden', ARRAY['John Steinbeck'], 1952, 'https://covers.openlibrary.org/b/id/10389368-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL27774W', 'want-to-read', 'Of Mice and Men', ARRAY['John Steinbeck'], 1937, 'https://covers.openlibrary.org/b/id/10389370-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL27793W', 'want-to-read', 'The Grapes of Wrath', ARRAY['John Steinbeck'], 1939, 'https://covers.openlibrary.org/b/id/10389372-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL44954W', 'want-to-read', 'One Hundred Years of Solitude', ARRAY['Gabriel Garcia Marquez'], 1967, 'https://covers.openlibrary.org/b/id/10389374-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL4316692W', 'want-to-read', 'Norwegian Wood', ARRAY['Haruki Murakami'], 1987, 'https://covers.openlibrary.org/b/id/10389376-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL4363086W', 'want-to-read', 'Kafka on the Shore', ARRAY['Haruki Murakami'], 2002, 'https://covers.openlibrary.org/b/id/10389378-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL5846986W', 'want-to-read', '1Q84', ARRAY['Haruki Murakami'], 2009, 'https://covers.openlibrary.org/b/id/10389380-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL45243W', 'want-to-read', 'Lolita', ARRAY['Vladimir Nabokov'], 1955, 'https://covers.openlibrary.org/b/id/10389382-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL38562W', 'want-to-read', 'The Bell Jar', ARRAY['Sylvia Plath'], 1963, 'https://covers.openlibrary.org/b/id/10389384-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL472759W', 'want-to-read', 'On the Road', ARRAY['Jack Kerouac'], 1957, 'https://covers.openlibrary.org/b/id/10389386-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL893264W', 'want-to-read', 'The Remains of the Day', ARRAY['Kazuo Ishiguro'], 1989, 'https://covers.openlibrary.org/b/id/10389388-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL17860620W', 'want-to-read', 'Cloud Atlas', ARRAY['David Mitchell'], 2004, 'https://covers.openlibrary.org/b/id/10389390-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL15075296W', 'want-to-read', 'The Night Circus', ARRAY['Erin Morgenstern'], 2011, 'https://covers.openlibrary.org/b/id/10389392-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL17608775W', 'want-to-read', 'Station Eleven', ARRAY['Emily St. John Mandel'], 2014, 'https://covers.openlibrary.org/b/id/10389394-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL15178638W', 'want-to-read', 'The Goldfinch', ARRAY['Donna Tartt'], 2013, 'https://covers.openlibrary.org/b/id/10389396-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL46671W', 'want-to-read', 'The Secret History', ARRAY['Donna Tartt'], 1992, 'https://covers.openlibrary.org/b/id/10389398-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL28228W', 'want-to-read', 'No Country for Old Men', ARRAY['Cormac McCarthy'], 2005, 'https://covers.openlibrary.org/b/id/10389400-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL28145W', 'want-to-read', 'Blood Meridian', ARRAY['Cormac McCarthy'], 1985, 'https://covers.openlibrary.org/b/id/10389402-L.jpg', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'OL62149W', 'want-to-read', 'Infinite Jest', ARRAY['David Foster Wallace'], 1996, 'https://covers.openlibrary.org/b/id/10389404-L.jpg', false, 1);
