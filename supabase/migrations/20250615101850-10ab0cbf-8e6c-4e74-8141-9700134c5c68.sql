
-- First, let's check and fix the RLS policies for goal_verifications table
DROP POLICY IF EXISTS "Users can view their own verifications" ON public.goal_verifications;
DROP POLICY IF EXISTS "Users can create their own verifications" ON public.goal_verifications;
DROP POLICY IF EXISTS "Admins can view all verifications" ON public.goal_verifications;

-- Create policies for goal_verifications
CREATE POLICY "Users can view their own verifications" 
  ON public.goal_verifications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own verifications" 
  ON public.goal_verifications 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Admin policy that checks both profile role and user metadata
CREATE POLICY "Admins can view all verifications" 
  ON public.goal_verifications 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Also ensure admins can update verifications
CREATE POLICY "Admins can update all verifications" 
  ON public.goal_verifications 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Update the admin user's profile role to ensure consistency
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'chanduvendra655@gmail.com';
