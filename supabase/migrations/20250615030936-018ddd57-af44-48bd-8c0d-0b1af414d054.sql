
-- Delete all user-related data in the correct order to avoid foreign key constraints
DELETE FROM public.withdrawal_requests;
DELETE FROM public.payment_submissions;
DELETE FROM public.tasks;
DELETE FROM public.goals;
DELETE FROM public.wallets;
DELETE FROM public.profiles;

-- Delete all users from the auth.users table (this will cascade to profiles due to foreign key)
DELETE FROM auth.users;
