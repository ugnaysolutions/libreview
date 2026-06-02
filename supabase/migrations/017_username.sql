ALTER TABLE user_profiles ADD COLUMN username TEXT;

-- Case-insensitive uniqueness via partial index (NULL values are excluded)
CREATE UNIQUE INDEX idx_user_profiles_username_lower
  ON user_profiles (lower(username))
  WHERE username IS NOT NULL;
