-- Add mother_name column to students table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'mother_name'
  ) THEN
    ALTER TABLE students ADD COLUMN mother_name text;
  END IF;
END $$;

-- Create index for mother_name for better search performance
CREATE INDEX IF NOT EXISTS idx_students_mother_name ON students(mother_name);

-- Update existing students with default values for mother_name
UPDATE students 
SET mother_name = 'Chưa cập nhật' 
WHERE mother_name IS NULL;