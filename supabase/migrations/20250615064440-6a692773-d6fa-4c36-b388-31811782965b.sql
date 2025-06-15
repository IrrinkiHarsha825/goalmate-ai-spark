
-- Add RLS policies for admins to manage wallets
DROP POLICY IF EXISTS "Admins can insert wallets for users" ON public.wallets;
DROP POLICY IF EXISTS "Admins can update wallets" ON public.wallets;

-- Allow admins to create wallets for any user
CREATE POLICY "Admins can insert wallets for users" ON public.wallets
  FOR INSERT 
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Allow admins to update any wallet
CREATE POLICY "Admins can update wallets" ON public.wallets
  FOR UPDATE 
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Allow admins to view all wallets
CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT 
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
