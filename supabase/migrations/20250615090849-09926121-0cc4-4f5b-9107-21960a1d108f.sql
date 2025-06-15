
-- Create a table to track admin verification status for goals
CREATE TABLE public.goal_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_amount NUMERIC NOT NULL,
  transaction_id TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.goal_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for goal_verifications
CREATE POLICY "Users can view their own verifications" 
  ON public.goal_verifications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own verifications" 
  ON public.goal_verifications 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all verifications" 
  ON public.goal_verifications 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for better performance
CREATE INDEX idx_goal_verifications_goal_id ON public.goal_verifications(goal_id);
CREATE INDEX idx_goal_verifications_status ON public.goal_verifications(verification_status);

-- Update goals table to have a proper status tracking
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' 
CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected'));

-- Create a function to update goal status when verification changes
CREATE OR REPLACE FUNCTION update_goal_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the goal's verification status based on the verification record
  UPDATE public.goals 
  SET verification_status = NEW.verification_status,
      status = CASE 
        WHEN NEW.verification_status = 'verified' THEN 'active'
        WHEN NEW.verification_status = 'rejected' THEN 'inactive'
        ELSE 'inactive'
      END
  WHERE id = NEW.goal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update goal status
CREATE TRIGGER trigger_update_goal_verification_status
  AFTER INSERT OR UPDATE ON public.goal_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_verification_status();
