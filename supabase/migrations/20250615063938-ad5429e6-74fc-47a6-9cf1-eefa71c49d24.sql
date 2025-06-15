
-- Fix RLS policies for admins to view all payment submissions and withdrawal requests

-- Drop existing policies that might be restrictive
DROP POLICY IF EXISTS "Admins can view all payment submissions" ON public.payment_submissions;
DROP POLICY IF EXISTS "Admins can update payment submissions" ON public.payment_submissions;
DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON public.withdrawal_requests;

-- Create new policies that check user_metadata role
CREATE POLICY "Admins can view all payment submissions" ON public.payment_submissions
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update payment submissions" ON public.payment_submissions
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can view all withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update withdrawal requests" ON public.withdrawal_requests
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
