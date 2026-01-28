-- Run this in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  title text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.posts
add column if not exists username text not null default '';

alter table public.posts
add column if not exists image_url text;

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_user_id_idx on public.posts (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists "Public can read posts" on public.posts;
create policy "Public can read posts"
on public.posts
for select
using (true);

drop policy if exists "Users can insert their posts" on public.posts;
create policy "Users can insert their posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their posts" on public.posts;
create policy "Users can update their posts"
on public.posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their posts" on public.posts;
create policy "Users can delete their posts"
on public.posts
for delete
to authenticated
using (auth.uid() = user_id);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  content text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists comments_created_at_idx on public.comments (created_at);

alter table public.comments enable row level security;

drop policy if exists "Public can read comments" on public.comments;
create policy "Public can read comments"
on public.comments
for select
using (true);

drop policy if exists "Users can insert their comments" on public.comments;
create policy "Users can insert their comments"
on public.comments
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their comments" on public.comments;
create policy "Users can update their comments"
on public.comments
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their comments" on public.comments;
create policy "Users can delete their comments"
on public.comments
for delete
to authenticated
using (auth.uid() = user_id);

-- Storage bucket for images
-- If you want the images to be viewable publicly, keep this bucket public.
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view blog images" on storage.objects;
create policy "Public can view blog images"
on storage.objects
for select
using (bucket_id = 'blog-images');

drop policy if exists "Authenticated can upload blog images" on storage.objects;
create policy "Authenticated can upload blog images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'blog-images');

drop policy if exists "Users can update their blog images" on storage.objects;
create policy "Users can update their blog images"
on storage.objects
for update
to authenticated
using (bucket_id = 'blog-images' and auth.uid() = owner)
with check (bucket_id = 'blog-images' and auth.uid() = owner);

drop policy if exists "Users can delete their blog images" on storage.objects;
create policy "Users can delete their blog images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'blog-images' and auth.uid() = owner);
