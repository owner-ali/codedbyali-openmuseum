-- SAFE FIRST-ADMIN SETUP
--
-- 1. Open the site and register normally with the email you want as admin.
--    (Confirm the email if Supabase asks you to.)
-- 2. In the Supabase dashboard open SQL Editor, paste this, replace the email,
--    and press Run. Only someone with access to your Supabase project can do this.
--
-- The role cannot be changed from the website by normal users: a database trigger
-- resets role and suspension for anyone who is not already an admin.

update public.profiles
   set role = 'admin'
 where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');

-- Check it worked (should show role = admin):
select p.username, p.role, u.email
  from public.profiles p
  join auth.users u on u.id = p.id
 where p.role = 'admin';
