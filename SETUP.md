# Pulse — Project Setup Guide

## Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- A [Supabase](https://supabase.com) project (free tier is fine)

---

## 1. Installation commands

```bash
# 1. Create the Vite + React project
npm create vite@latest pulse -- --template react
cd pulse

# 2. Install runtime dependencies
npm install react-router-dom @supabase/supabase-js zustand clsx

# 3. Install dev dependencies (Tailwind CSS v3)
npm install -D tailwindcss@3 postcss autoprefixer

# 4. Init Tailwind (generates tailwind.config.js + postcss.config.js)
npx tailwindcss init -p

# 5. Start dev server
npm run dev
```

---

## 2. Folder creation (bash — run from project root)

```bash
mkdir -p src/assets \
         src/components/{auth,chat,conversation,group,shared,layout} \
         src/contexts \
         src/hooks \
         src/pages \
         src/services \
         src/store \
         src/utils \
         src/styles
```

---

## 3. Environment variables

Copy `.env.example` → `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key |

> `.env.local` is gitignored. Never commit real keys.

---

## 4. Supabase database setup

Run these SQL statements in the Supabase SQL editor:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table profiles (
  id               uuid primary key references auth.users on delete cascade,
  username         text not null unique,
  avatar_url       text,
  status_message   text,
  presence_status  text default 'offline',
  last_seen_at     timestamptz default now(),
  created_at       timestamptz default now()
);

-- Conversations
create table conversations (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null check (type in ('direct','group')),
  name        text,
  avatar_url  text,
  created_by  uuid references profiles(id),
  created_at  timestamptz default now()
);

-- Conversation members
create table conversation_members (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  user_id          uuid not null references profiles(id) on delete cascade,
  role             text not null default 'member' check (role in ('admin','member')),
  joined_at        timestamptz default now(),
  last_read_at     timestamptz default now(),
  unique (conversation_id, user_id)
);

-- Messages
create table messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  sender_id        uuid not null references profiles(id),
  content_type     text not null default 'text' check (content_type in ('text','image','system')),
  content          text,
  image_url        text,
  reply_to_id      uuid references messages(id),
  created_at       timestamptz default now(),
  deleted_at       timestamptz
);

-- Message seen receipts
create table message_seen (
  id          uuid primary key default uuid_generate_v4(),
  message_id  uuid not null references messages(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  seen_at     timestamptz default now(),
  unique (message_id, user_id)
);

-- Row Level Security
alter table profiles            enable row level security;
alter table conversations       enable row level security;
alter table conversation_members enable row level security;
alter table messages            enable row level security;
alter table message_seen        enable row level security;

-- Basic RLS policies
create policy "Users can read all profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Members can read their conversations"
  on conversations for select using (
    exists (
      select 1 from conversation_members
      where conversation_id = id and user_id = auth.uid()
    )
  );

create policy "Members can read messages in their conversations"
  on messages for select using (
    exists (
      select 1 from conversation_members
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

create policy "Members can insert messages"
  on messages for insert with check (
    sender_id = auth.uid() and
    exists (
      select 1 from conversation_members
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );
```

---

## 5. Storage bucket setup

In Supabase → Storage, create a bucket called **`chat-images`**:
- Public bucket: **yes** (so image URLs work without auth tokens)
- File size limit: **5 MB**
- Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

---

## 6. Available npm scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |

---

## 7. Path alias

The `@` alias resolves to `src/`. Use it everywhere:

```js
import { useAuth } from "@/hooks/useAuth";
import { ROUTES }  from "@/utils/constants";
```

