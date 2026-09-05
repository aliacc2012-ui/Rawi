-- RAWI media ratings
-- Anonymous gallery visitors can rate each media item from 1 to 5 stars.

create table if not exists public.media_ratings (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  visitor_session text not null,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (media_id, visitor_session)
);

alter table public.media_ratings enable row level security;

create policy "media_ratings: workspace members read"
on public.media_ratings
for select
using (public.is_workspace_member(public.workspace_id_for_gallery(gallery_id)));

create policy "media_ratings: public can read own published ratings"
on public.media_ratings
for select
using (
  exists (
    select 1 from public.galleries g
    where g.id = gallery_id
      and g.status = 'published'
      and (g.expiry_date is null or g.expiry_date > now())
  )
);

create policy "media_ratings: public can insert on published galleries"
on public.media_ratings
for insert
with check (
  rating between 1 and 5
  and exists (
    select 1 from public.galleries g
    where g.id = gallery_id
      and g.status = 'published'
      and (g.expiry_date is null or g.expiry_date > now())
  )
);

create policy "media_ratings: public can update on published galleries"
on public.media_ratings
for update
using (
  exists (
    select 1 from public.galleries g
    where g.id = gallery_id
      and g.status = 'published'
      and (g.expiry_date is null or g.expiry_date > now())
  )
)
with check (rating between 1 and 5);

create index if not exists idx_media_ratings_gallery on public.media_ratings(gallery_id);
create index if not exists idx_media_ratings_media on public.media_ratings(media_id);

create trigger set_media_ratings_updated_at
before update on public.media_ratings
for each row execute procedure public.set_updated_at();
