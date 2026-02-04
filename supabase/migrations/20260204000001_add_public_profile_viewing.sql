-- Allow authenticated users to view any user's profile (for profile pages)
-- This enables users to visit other users' profile pages

-- Add policy to allow any authenticated user to view any profile
CREATE POLICY "Authenticated users can view any profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Add policy to allow any authenticated user to view any user's books
-- This is needed for profile pages to show other users' book lists
CREATE POLICY "Authenticated users can view any user's books"
  ON user_books FOR SELECT
  TO authenticated
  USING (true);
