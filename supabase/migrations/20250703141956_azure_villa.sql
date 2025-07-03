/*
  # Add new fields to students table

  1. Changes
    - Add `gender` column to `students` table
    - Add `parent_id_card` column to `students` table
    - Add `parent_id_card2` column to `students` table
    - Add `status` column to `students` table
    
  2. Security
    - Maintains existing RLS policies
*/

-- Add gender column to students table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'gender'
  ) THEN
    ALTER TABLE students ADD COLUMN gender text NOT NULL DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other'));
  END IF;
END $$;

-- Add parent_id_card column to students table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'parent_id_card'
  ) THEN
    ALTER TABLE students ADD COLUMN parent_id_card text;
  END IF;
END $$;

-- Add parent_id_card2 column to students table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'parent_id_card2'
  ) THEN
    ALTER TABLE students ADD COLUMN parent_id_card2 text;
  END IF;
END $$;

-- Add status column to students table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'status'
  ) THEN
    ALTER TABLE students ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;

-- Update existing students with default values
UPDATE students SET gender = 'male' WHERE gender IS NULL;
UPDATE students SET status = 'active' WHERE status IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_gender ON students(gender);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_parent_id_card ON students(parent_id_card);