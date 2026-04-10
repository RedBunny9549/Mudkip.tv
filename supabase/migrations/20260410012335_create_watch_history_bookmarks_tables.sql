/*
  # Create Watch History, Bookmarks, and Profiles Tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `role` (text, default 'user')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `watch_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `anime_id` (text)
      - `manga_id` (text)
      - `title` (text)
      - `image_url` (text)
      - `episode_id` (text)
      - `episode_number` (integer)
      - `exact_timestamp` (integer, in seconds)
      - `duration` (integer, total length in seconds)
      - `media_type` (text: 'anime' or 'manga')
      - `updated_at` (timestamp)
      - `created_at` (timestamp)
    
    - `bookmarks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `media_id` (text)
      - `title` (text)
      - `image_url` (text)
      - `media_type` (text: 'anime' or 'manga')
      - `status` (text: 'watching', 'completed', 'dropped')
      - `notes` (text)
      - `rating` (integer, 1-10)
      - `metadata` (jsonb, for storing viewing preferences)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Add indexes on user_id and updated_at for performance

  3. Constraints
    - Foreign key constraints to auth.users
    - Unique constraint on watch_history (user_id + anime_id + episode_id)
    - Unique constraint on bookmarks (user_id + media_id)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id text,
  manga_id text,
  title text NOT NULL,
  image_url text,
  episode_id text,
  episode_number integer,
  exact_timestamp integer DEFAULT 0,
  duration integer,
  media_type text DEFAULT 'anime',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, anime_id, episode_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id text NOT NULL,
  title text NOT NULL,
  image_url text,
  media_type text DEFAULT 'anime',
  status text DEFAULT 'watching',
  notes text,
  rating integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, media_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS watch_history_user_id_idx ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS watch_history_updated_at_idx ON watch_history(updated_at DESC);
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_updated_at_idx ON bookmarks(updated_at DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Watch history policies
CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history"
  ON watch_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch history"
  ON watch_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON bookmarks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
