-- Run this in Supabase SQL Editor to add the new profile fields
-- (only needed if your profiles table was created with the original SETUP.md schema)

alter table profiles
  add column if not exists bio             text,
  add column if not exists available_hours text;

-- Also add the insert profile policy if it's missing
-- (needed so new registrations can create their profile row)
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);
