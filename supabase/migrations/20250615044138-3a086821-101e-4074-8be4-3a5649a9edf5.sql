
-- First, let's check what status values are currently allowed for goals
-- and update the constraint to include 'inactive' status
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_status_check;

-- Add a new constraint that includes 'inactive' as a valid status
ALTER TABLE goals ADD CONSTRAINT goals_status_check 
  CHECK (status IN ('active', 'inactive', 'completed', 'failed', 'pending'));
