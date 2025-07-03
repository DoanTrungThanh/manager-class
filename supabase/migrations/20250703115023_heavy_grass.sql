/*
  # Initial Schema for Classroom Management System

  1. New Tables
    - `students` - Student information
    - `classes` - Class information
    - `classrooms` - Classroom information
    - `schedules` - Teaching schedules
    - `attendance` - Student attendance records
    - `finances` - Financial records
    - `assets` - Asset management
    - `notifications` - System notifications
    - `grade_columns` - Grade column definitions
    - `grades` - Student grades
    - `grade_periods` - Grading periods

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  birth_date date NOT NULL,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  drive_link text,
  class_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students are viewable by authenticated users"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students are insertable by authenticated users"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Students are updatable by authenticated users"
  ON students
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Students are deletable by authenticated users"
  ON students
  FOR DELETE
  TO authenticated
  USING (true);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  teacher_id text NOT NULL,
  student_ids text[] DEFAULT '{}',
  max_students integer DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Classes are viewable by authenticated users"
  ON classes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Classes are insertable by authenticated users"
  ON classes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Classes are updatable by authenticated users"
  ON classes
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Classes are deletable by authenticated users"
  ON classes
  FOR DELETE
  TO authenticated
  USING (true);

-- Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 30,
  location text NOT NULL,
  equipment text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Classrooms are viewable by authenticated users"
  ON classrooms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Classrooms are insertable by authenticated users"
  ON classrooms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Classrooms are updatable by authenticated users"
  ON classrooms
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Classrooms are deletable by authenticated users"
  ON classrooms
  FOR DELETE
  TO authenticated
  USING (true);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  class_id text NOT NULL,
  teacher_id text NOT NULL,
  classroom_id text,
  date date NOT NULL,
  time_slot text NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schedules are viewable by authenticated users"
  ON schedules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Schedules are insertable by authenticated users"
  ON schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Schedules are updatable by authenticated users"
  ON schedules
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Schedules are deletable by authenticated users"
  ON schedules
  FOR DELETE
  TO authenticated
  USING (true);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  schedule_id text NOT NULL,
  student_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  checked_at timestamptz
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendance is viewable by authenticated users"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Attendance is insertable by authenticated users"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Attendance is updatable by authenticated users"
  ON attendance
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Attendance is deletable by authenticated users"
  ON attendance
  FOR DELETE
  TO authenticated
  USING (true);

-- Finances table
CREATE TABLE IF NOT EXISTS finances (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  created_by text NOT NULL
);

ALTER TABLE finances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finances are viewable by authenticated users"
  ON finances
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Finances are insertable by authenticated users"
  ON finances
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Finances are updatable by authenticated users"
  ON finances
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Finances are deletable by authenticated users"
  ON finances
  FOR DELETE
  TO authenticated
  USING (true);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'distributed', 'maintenance')),
  assigned_to text,
  received_date date NOT NULL,
  description text
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assets are viewable by authenticated users"
  ON assets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Assets are insertable by authenticated users"
  ON assets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Assets are updatable by authenticated users"
  ON assets
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Assets are deletable by authenticated users"
  ON assets
  FOR DELETE
  TO authenticated
  USING (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  recipients text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications are viewable by authenticated users"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Notifications are insertable by authenticated users"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Notifications are updatable by authenticated users"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Notifications are deletable by authenticated users"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (true);

-- Grade Periods table
CREATE TABLE IF NOT EXISTS grade_periods (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grade_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grade periods are viewable by authenticated users"
  ON grade_periods
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Grade periods are insertable by authenticated users"
  ON grade_periods
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Grade periods are updatable by authenticated users"
  ON grade_periods
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Grade periods are deletable by authenticated users"
  ON grade_periods
  FOR DELETE
  TO authenticated
  USING (true);

-- Grade Columns table
CREATE TABLE IF NOT EXISTS grade_columns (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  class_id text NOT NULL,
  teacher_id text NOT NULL,
  grade_period_id text,
  max_score numeric DEFAULT 10,
  weight numeric DEFAULT 1,
  description text,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (grade_period_id) REFERENCES grade_periods(id) ON DELETE SET NULL
);

ALTER TABLE grade_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grade columns are viewable by authenticated users"
  ON grade_columns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Grade columns are insertable by authenticated users"
  ON grade_columns
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Grade columns are updatable by authenticated users"
  ON grade_columns
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Grade columns are deletable by authenticated users"
  ON grade_columns
  FOR DELETE
  TO authenticated
  USING (true);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  grade_column_id text NOT NULL,
  student_id text NOT NULL,
  score numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (grade_column_id) REFERENCES grade_columns(id) ON DELETE CASCADE,
  UNIQUE(grade_column_id, student_id)
);

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grades are viewable by authenticated users"
  ON grades
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Grades are insertable by authenticated users"
  ON grades
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Grades are updatable by authenticated users"
  ON grades
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Grades are deletable by authenticated users"
  ON grades
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_class_id ON schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher_id ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_attendance_schedule_id ON attendance(schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_grade_columns_class_id ON grade_columns(class_id);
CREATE INDEX IF NOT EXISTS idx_grade_columns_teacher_id ON grade_columns(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_grade_column_id ON grades(grade_column_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for grades table
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();