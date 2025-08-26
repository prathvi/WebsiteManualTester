-- Add missing fields to issues table
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS section VARCHAR(255),
ADD COLUMN IF NOT EXISTS suggested_fix TEXT,
ADD COLUMN IF NOT EXISTS test_type VARCHAR(50);

-- Update the existing columns to ensure they match requirements
COMMENT ON COLUMN issues.section IS 'The section or component where the issue was found';
COMMENT ON COLUMN issues.suggested_fix IS 'Recommended solution or fix for the issue';
COMMENT ON COLUMN issues.test_type IS 'The type of test that failed (e.g., visual-1, functional-2)';