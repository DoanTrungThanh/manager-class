-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'teacher')),
  avatar text,
  password text NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id text PRIMARY KEY,
  name text NOT NULL,
  birth_date date NOT NULL,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  drive_link text,
  class_id text,
  created_at timestamptz DEFAULT now()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id text PRIMARY KEY,
  name text NOT NULL,
  teacher_id text NOT NULL,
  student_ids text[] DEFAULT '{}',
  max_students integer DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

-- Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id text PRIMARY KEY,
  name text NOT NULL,
  capacity integer DEFAULT 30,
  location text DEFAULT '',
  equipment text[] DEFAULT '{}',
  status text DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id text PRIMARY KEY,
  class_id text NOT NULL,
  teacher_id text NOT NULL,
  classroom_id text,
  date date NOT NULL,
  time_slot text NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  start_time text NOT NULL,
  end_time text NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id text PRIMARY KEY,
  schedule_id text NOT NULL,
  student_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  checked_at timestamptz
);

-- Grade periods table
CREATE TABLE IF NOT EXISTS grade_periods (
  id text PRIMARY KEY,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Grade columns table
CREATE TABLE IF NOT EXISTS grade_columns (
  id text PRIMARY KEY,
  name text NOT NULL,
  class_id text NOT NULL,
  teacher_id text NOT NULL,
  grade_period_id text,
  max_score numeric DEFAULT 10,
  weight numeric DEFAULT 1,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id text PRIMARY KEY,
  grade_column_id text NOT NULL,
  student_id text NOT NULL,
  score numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(grade_column_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're not using Supabase Auth)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON students FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON classes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON classrooms FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON schedules FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON grade_periods FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON grade_columns FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON grades FOR ALL USING (true);

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

-- Insert default users
INSERT INTO users (id, name, email, role, password, is_active, created_at) VALUES
  ('1', 'Admin User', 'admin@school.com', 'admin', 'password', true, now()),
  ('2', 'Manager User', 'manager@school.com', 'manager', 'password', true, now()),
  ('3', 'Teacher User', 'teacher@school.com', 'teacher', 'password', true, now())
ON CONFLICT (id) DO NOTHING;