/*
  # Add missing password column to users table

  1. Changes
    - Add `password` column to `users` table
    - Update existing users with default password
    
  2. Security
    - Maintains existing RLS policies
*/

-- Add password column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password text NOT NULL DEFAULT 'password';
  END IF;
END $$;

-- Update existing users with the expected password
UPDATE users SET password = 'password' WHERE password IS NULL OR password = '';