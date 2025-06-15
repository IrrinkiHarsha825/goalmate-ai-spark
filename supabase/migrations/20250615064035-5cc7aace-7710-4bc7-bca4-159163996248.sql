
-- Clear all user-related data for a complete fresh start
DELETE FROM public.withdrawal_requests;
DELETE FROM public.payment_submissions;
DELETE FROM public.tasks;
DELETE FROM public.goals;
DELETE FROM public.wallets;
DELETE FROM public.profiles;

-- Clear all users from auth.users (this will cascade to profiles due to foreign key)
DELETE FROM auth.users;

-- Reset any sequences if needed
ALTER SEQUENCE IF EXISTS goals_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS payment_submissions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS withdrawal_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS wallets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS profiles_id_seq RESTART WITH 1;
