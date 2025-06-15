
-- Create task completion submissions table
CREATE TABLE public.task_completion_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  proof_text TEXT,
  proof_image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  reward_amount DECIMAL NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.task_completion_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own task completion submissions
CREATE POLICY "Users can view own task completion submissions" ON public.task_completion_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create task completion submissions for their own tasks
CREATE POLICY "Users can create task completion submissions" ON public.task_completion_submissions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.goals g ON t.goal_id = g.id
      WHERE t.id = task_completion_submissions.task_id
      AND g.user_id = auth.uid()
    )
  );

-- Admins can view all task completion submissions
CREATE POLICY "Admins can view all task completion submissions" ON public.task_completion_submissions
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Admins can update task completion submissions
CREATE POLICY "Admins can update task completion submissions" ON public.task_completion_submissions
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Create index for better performance
CREATE INDEX idx_task_completion_submissions_task_id ON public.task_completion_submissions(task_id);
CREATE INDEX idx_task_completion_submissions_user_id ON public.task_completion_submissions(user_id);
CREATE INDEX idx_task_completion_submissions_status ON public.task_completion_submissions(status);
