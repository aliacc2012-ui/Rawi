create table if not exists public.gallery_reviews (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  visitor_session text not null,
  client_name text not null check (char_length(client_name) between 1 and 120),
  rating smallint not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gallery_id, visitor_session)
);

create index if not exists gallery_reviews_gallery_created_idx
on public.gallery_reviews (gallery_id, created_at desc);

alter table public.gallery_reviews enable row level security;
revoke all on table public.gallery_reviews from anon, authenticated;
grant select on table public.gallery_reviews to authenticated;

create policy "gallery reviews: creators read"
on public.gallery_reviews for select
to authenticated
using (
  exists (
    select 1
    from public.galleries g
    join public.projects p on p.id = g.project_id
    join public.workspace_members wm on wm.workspace_id = p.workspace_id
    where g.id = gallery_reviews.gallery_id
      and wm.user_id = (select auth.uid())
  )
);
