-- Run this in Supabase SQL Editor to enable the group chat feature.
-- Adds the RLS policies needed for: removing/leaving group members,
-- and updating group name/avatar.

-- Allow members to delete their own membership row (leave group),
-- and allow admins to delete others' membership rows (remove member).
drop policy if exists "Members can leave or admins can remove" on conversation_members;
create policy "Members can leave or admins can remove"
  on conversation_members for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from conversation_members admin_check
      where admin_check.conversation_id = conversation_members.conversation_id
        and admin_check.user_id = auth.uid()
        and admin_check.role = 'admin'
    )
  );

-- Allow group admins to update the conversation's name/avatar
drop policy if exists "Admins can update group conversations" on conversations;
create policy "Admins can update group conversations"
  on conversations for update
  using (
    exists (
      select 1 from conversation_members
      where conversation_members.conversation_id = conversations.id
        and conversation_members.user_id = auth.uid()
        and conversation_members.role = 'admin'
    )
  );

-- Indexes to keep group member lookups fast
create index if not exists idx_conversation_members_role
  on conversation_members (conversation_id, role);
