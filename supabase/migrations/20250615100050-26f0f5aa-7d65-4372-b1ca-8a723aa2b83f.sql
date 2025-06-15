
-- Fix the goals verification_status check constraint to include 'pending'
ALTER TABLE public.goals 
DROP CONSTRAINT IF EXISTS goals_verification_status_check;

ALTER TABLE public.goals 
ADD CONSTRAINT goals_verification_status_check 
CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
