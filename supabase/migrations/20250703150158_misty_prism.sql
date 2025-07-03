-- Add gender column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'gender'
  ) THEN
    ALTER TABLE users ADD COLUMN gender text DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other'));
  END IF;
END $$;

-- Create index for gender for better search performance
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);

-- Update existing users with default values for gender
UPDATE users 
SET gender = 'male' 
WHERE gender IS NULL AND id IN ('1', '2');

UPDATE users 
SET gender = 'female' 
WHERE gender IS NULL AND id = '3';