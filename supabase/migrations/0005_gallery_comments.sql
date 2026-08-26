-- Client comments/feedback for Creator and Pro galleries.
-- Comments may be gallery-wide or attached to a specific media item.

create table if not exists public.gallery_comments (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  media_id uuid references public.media(id) on delete cascade,
  visitor_session text not null,
  client_name text not null check (char_length(trim(client_name)) between 1 and 120),
  comment_text text not null check (char_length(trim(comment_text)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists gallery_comments_gallery_id_idx
  on public.gallery_comments(gallery_id);

create index if not exists gallery_comments_media_id_idx
  on public.gallery_comments(media_id);

alter table public.gallery_comments enable row level security;

-- Workspace members can read comments for galleries they own/manage.
create policy "gallery_comments: workspace members can read"
  on public.gallery_comments
  for select
  using (
    exists (
      select 1
      from public.galleries g
      join public.projects p on p.id = g.project_id
      where g.id = gallery_comments.gallery_id
        and public.is_workspace_member(p.workspace_id)
    )
  );

-- Public clients submit feedback through validated server actions using the
-- service-role client, so there is intentionally no anonymous insert policy.
