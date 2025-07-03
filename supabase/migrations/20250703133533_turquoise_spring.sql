/*
  # Add missing teacher_id column to grade_columns table

  1. Changes
    - Add teacher_id column to grade_columns table if it doesn't exist
    - Add index for better performance
    - Update RLS policies if needed

  2. Notes
    - This fixes the "Could not find the 'teacher_id' column" error
    - The column is required by the application logic
*/

-- Add teacher_id column to grade_columns table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grade_columns' AND column_name = 'teacher_id'
  ) THEN
    ALTER TABLE grade_columns ADD COLUMN teacher_id text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Create index for teacher_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_grade_columns_teacher_id ON grade_columns(teacher_id);

-- Update any existing grade_columns records to have a valid teacher_id
-- This sets empty teacher_id values to '1' (admin user) as a fallback
UPDATE grade_columns 
SET teacher_id = '1' 
WHERE teacher_id = '' OR teacher_id IS NULL;