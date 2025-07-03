/*
  # Initial Schema for Classroom Management System

  1. New Tables
    - `users` - User accounts with authentication
    - `students` - Student information
    - `classes` - Class information
    - `classrooms` - Physical classroom information
    - `schedules` - Teaching schedules
    - `attendance` - Student attendance records
    - `finances` - Financial records (income/expense)
    - `assets` - Asset management
    - `notifications` - System notifications
    - `staff` - Staff information
    - `grade_periods` - Grading periods
    - `grade_columns` - Grade columns for each class
    - `grades` - Individual student grades

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY DEFAULT ('USR' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'teacher')),
  avatar text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id text PRIMARY KEY DEFAULT ('ST' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
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
  id text PRIMARY KEY DEFAULT ('CL' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  name text NOT NULL,
  teacher_id text NOT NULL,
  student_ids text[] DEFAULT '{}',
  max_students integer DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

-- Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id text PRIMARY KEY DEFAULT ('CR' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
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
  id text PRIMARY KEY DEFAULT ('SCH' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
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
  id text PRIMARY KEY DEFAULT ('ATT' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  schedule_id text NOT NULL,
  student_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  checked_at timestamptz
);

-- Finances table
CREATE TABLE IF NOT EXISTS finances (
  id text PRIMARY KEY DEFAULT ('FIN' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  created_by text NOT NULL
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id text PRIMARY KEY DEFAULT ('AST' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'distributed', 'maintenance')),
  assigned_to text,
  received_date date NOT NULL,
  description text
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY DEFAULT ('NOT' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  recipients jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id text PRIMARY KEY DEFAULT ('STF' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher', 'manager')),
  address text NOT NULL,
  salary numeric NOT NULL,
  start_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Grade periods table
CREATE TABLE IF NOT EXISTS grade_periods (
  id text PRIMARY KEY DEFAULT ('GP' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('active', 'completed', 'draft')),
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Grade columns table
CREATE TABLE IF NOT EXISTS grade_columns (
  id text PRIMARY KEY DEFAULT ('GC' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  name text NOT NULL,
  description text,
  max_score numeric NOT NULL,
  weight numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('regular', 'midterm', 'final', 'assignment', 'quiz')),
  period_id text NOT NULL,
  class_id text NOT NULL,
  assigned_teachers text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id text PRIMARY KEY DEFAULT ('GR' || to_char(extract(epoch from now()) * 1000, 'FM999999') || lpad(floor(random() * 1000)::text, 3, '0')),
  column_id text NOT NULL,
  student_id text NOT NULL,
  score numeric NOT NULL,
  note text,
  entered_by text NOT NULL,
  entered_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "Allow all operations" ON finances FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON assets FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON staff FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON grade_periods FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON grade_columns FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON grades FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher_id ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_schedule_id ON attendance(schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_column_id ON grades(column_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grade_columns_period_id ON grade_columns(period_id);
CREATE INDEX IF NOT EXISTS idx_grade_columns_class_id ON grade_columns(class_id);

-- Insert default users
INSERT INTO users (id, name, email, role, is_active, created_at) VALUES
  ('1', 'Admin User', 'admin@school.com', 'admin', true, now()),
  ('2', 'Manager User', 'manager@school.com', 'manager', true, now()),
  ('3', 'Teacher User', 'teacher@school.com', 'teacher', true, now())
ON CONFLICT (id) DO NOTHING;