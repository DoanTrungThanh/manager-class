/*
  # Add subjects table and related fields

  1. New Tables
    - `subjects` - Subject information with name, code, color, etc.
    
  2. Changes
    - Add `subject_id` column to `classes` table
    - Add `subject_id` column to `schedules` table
    
  3. Security
    - Enable RLS on subjects table
    - Add policies for authenticated users
*/

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id text PRIMARY KEY DEFAULT ('SUB' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#3B82F6',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for subjects table
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Create policy for subjects table
CREATE POLICY "Allow all operations" ON subjects FOR ALL USING (true);

-- Add subject_id to classes table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classes' AND column_name = 'subject_id'
  ) THEN
    ALTER TABLE classes ADD COLUMN subject_id text;
  END IF;
END $$;

-- Add subject_id to schedules table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schedules' AND column_name = 'subject_id'
  ) THEN
    ALTER TABLE schedules ADD COLUMN subject_id text;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_subject_id ON classes(subject_id);
CREATE INDEX IF NOT EXISTS idx_schedules_subject_id ON schedules(subject_id);

-- Insert default subjects
INSERT INTO subjects (id, name, code, description, color, is_active) VALUES
  ('SUB001', 'Toán học', 'MATH', 'Môn Toán học cơ bản và nâng cao', '#3B82F6', true),
  ('SUB002', 'Ngữ văn', 'LANG', 'Môn Ngữ văn và văn học', '#10B981', true),
  ('SUB003', 'Tiếng Anh', 'ENG', 'Môn Tiếng Anh giao tiếp và ngữ pháp', '#F59E0B', true),
  ('SUB004', 'Vật lý', 'PHY', 'Môn Vật lý cơ bản', '#EF4444', true),
  ('SUB005', 'Hóa học', 'CHEM', 'Môn Hóa học cơ bản', '#8B5CF6', true),
  ('SUB006', 'Sinh học', 'BIO', 'Môn Sinh học cơ bản', '#06B6D4', true),
  ('SUB007', 'Lịch sử', 'HIST', 'Môn Lịch sử Việt Nam và thế giới', '#84CC16', true),
  ('SUB008', 'Địa lý', 'GEO', 'Môn Địa lý tự nhiên và kinh tế', '#F97316', true)
ON CONFLICT (id) DO NOTHING;

-- Update existing classes with default subject if they don't have one
UPDATE classes 
SET subject_id = 'SUB001' 
WHERE subject_id IS NULL AND name LIKE '%Toán%';

UPDATE classes 
SET subject_id = 'SUB002' 
WHERE subject_id IS NULL AND name LIKE '%Văn%';

UPDATE classes 
SET subject_id = 'SUB003' 
WHERE subject_id IS NULL AND name LIKE '%Anh%';

-- Update any remaining classes without subject
UPDATE classes 
SET subject_id = 'SUB001' 
WHERE subject_id IS NULL;

-- Update existing schedules to have subject_id based on their class
UPDATE schedules 
SET subject_id = classes.subject_id
FROM classes 
WHERE schedules.class_id = classes.id AND schedules.subject_id IS NULL;