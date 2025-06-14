
-- Add difficulty column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Add reward_amount column to tasks table to store how much money each task is worth
ALTER TABLE public.tasks 
ADD COLUMN reward_amount NUMERIC DEFAULT 0;
