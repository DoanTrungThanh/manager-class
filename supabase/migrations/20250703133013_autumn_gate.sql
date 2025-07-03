/*
  # Fix Grade Periods Table

  1. Changes
    - Update grade_periods table to match the expected structure
    - Add missing fields and fix existing ones
    - Update existing data to match the new structure
    
  2. Security
    - Maintains existing RLS policies
*/

-- Fix grade_periods table structure
DO $$
BEGIN
  -- Check if status column exists and rename it to is_active if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grade_periods' AND column_name = 'status'
  ) THEN
    -- First add is_active column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'grade_periods' AND column_name = 'is_active'
    ) THEN
      ALTER TABLE grade_periods ADD COLUMN is_active boolean DEFAULT false;
    END IF;
    
    -- Update is_active based on status
    UPDATE grade_periods SET is_active = (status = 'active');
    
    -- Drop the status column
    ALTER TABLE grade_periods DROP COLUMN status;
  END IF;
  
  -- Ensure description column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grade_periods' AND column_name = 'description'
  ) THEN
    ALTER TABLE grade_periods ADD COLUMN description text;
  END IF;
  
  -- Ensure created_by column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grade_periods' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE grade_periods ADD COLUMN created_by text DEFAULT '1';
  END IF;
END $$;

-- Fix grade_columns table to reference grade_periods correctly
DO $$
BEGIN
  -- Check if period_id column exists and rename it to grade_period_id if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grade_columns' AND column_name = 'period_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grade_columns' AND column_name = 'grade_period_id'
  ) THEN
    ALTER TABLE grade_columns RENAME COLUMN period_id TO grade_period_id;
  END IF;
  
  -- Ensure type column exists with default value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grade_columns' AND column_name = 'type'
  ) THEN
    ALTER TABLE grade_columns ADD COLUMN type text DEFAULT 'regular';
  END IF;
  
  -- Ensure assigned_teachers column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grade_columns' AND column_name = 'assigned_teachers'
  ) THEN
    ALTER TABLE grade_columns ADD COLUMN assigned_teachers text[] DEFAULT '{}';
  END IF;
  
  -- Ensure is_active column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grade_columns' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE grade_columns ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  
  -- Ensure created_by column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grade_columns' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE grade_columns ADD COLUMN created_by text DEFAULT '1';
  END IF;
END $$;

-- Fix grades table to reference grade_columns correctly
DO $$
BEGIN
  -- Check if column_id column exists and rename it to grade_column_id if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'column_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'grade_column_id'
  ) THEN
    ALTER TABLE grades RENAME COLUMN column_id TO grade_column_id;
  END IF;
  
  -- Ensure note column exists and rename it to notes if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'note'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'notes'
  ) THEN
    ALTER TABLE grades RENAME COLUMN note TO notes;
  END IF;
  
  -- Ensure entered_by column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'entered_by'
  ) THEN
    ALTER TABLE grades ADD COLUMN entered_by text DEFAULT '1';
  END IF;
  
  -- Ensure entered_at column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'entered_at'
  ) THEN
    ALTER TABLE grades ADD COLUMN entered_at timestamptz DEFAULT now();
  END IF;
END $$;