-- Adds support for voice/audio messages.
-- Run this in Supabase SQL Editor.

-- 1. Add audio_url and duration columns to messages
alter table messages
  add column if not exists audio_url      text,
  add column if not exists audio_duration integer; -- seconds

-- 2. Allow 'audio' as a valid content_type
alter table messages drop constraint if exists messages_content_type_check;
alter table messages add constraint messages_content_type_check
  check (content_type in ('text', 'image', 'audio', 'system'));
