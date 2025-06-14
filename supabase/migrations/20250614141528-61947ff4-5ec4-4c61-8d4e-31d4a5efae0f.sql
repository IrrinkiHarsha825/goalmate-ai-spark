
-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see tasks for their own goals
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT tasks for their own goals
CREATE POLICY "Users can view tasks for their own goals" 
  ON public.tasks 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE goals.id = tasks.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Create policy that allows users to INSERT tasks for their own goals
CREATE POLICY "Users can create tasks for their own goals" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE goals.id = tasks.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Create policy that allows users to UPDATE tasks for their own goals
CREATE POLICY "Users can update tasks for their own goals" 
  ON public.tasks 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE goals.id = tasks.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Create policy that allows users to DELETE tasks for their own goals
CREATE POLICY "Users can delete tasks for their own goals" 
  ON public.tasks 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE goals.id = tasks.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Create index for better performance on goal_id lookups
CREATE INDEX idx_tasks_goal_id ON public.tasks(goal_id);
