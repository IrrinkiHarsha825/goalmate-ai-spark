
-- Clear all user-related data again for a fresh start
DELETE FROM public.withdrawal_requests;
DELETE FROM public.payment_submissions;
DELETE FROM public.tasks;
DELETE FROM public.goals;
DELETE FROM public.wallets;
DELETE FROM public.profiles;
DELETE FROM auth.users;
