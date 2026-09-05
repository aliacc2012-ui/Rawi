-- RAWI performance: collapse dashboard metrics into one indexed database call.

create index if not exists idx_projects_workspace_created
  on public.projects (workspace_id, created_at desc);
create index if not exists idx_media_project_type
  on public.media (project_id, media_type);
create index if not exists idx_galleries_project_status
  on public.galleries (project_id, status);
create index if not exists idx_downloads_gallery
  on public.downloads (gallery_id);
create index if not exists idx_favorites_gallery
  on public.favorites (gallery_id);
create index if not exists idx_gallery_comments_gallery_status
  on public.gallery_comments (gallery_id, status);

create or replace function public.rawi_dashboard_stats(target_workspace_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  with allowed as (
    select public.is_workspace_member(target_workspace_id) as ok
  ),
  p as (
    select id, status
    from public.projects
    where workspace_id = target_workspace_id
      and (select ok from allowed)
  ),
  g as (
    select g.id, g.project_id, g.status
    from public.galleries g
    join p on p.id = g.project_id
  ),
  feedback as (
    select g.project_id, count(*)::int as new_count
    from public.gallery_comments c
    join g on g.id = c.gallery_id
    where c.status = 'new'
    group by g.project_id
  )
  select jsonb_build_object(
    'project_count', (select count(*)::int from p),
    'photo_count', (
      select count(*)::int from public.media m join p on p.id = m.project_id where m.media_type = 'image'
    ),
    'published_count', (select count(*)::int from g where status = 'published'),
    'download_count', (
      select count(*)::int from public.downloads d join g on g.id = d.gallery_id
    ),
    'favorite_count', (
      select count(*)::int from public.favorites f join g on g.id = f.gallery_id
    ),
    'new_feedback_count', (select coalesce(sum(new_count),0)::int from feedback),
    'feedback_by_project', coalesce((select jsonb_object_agg(project_id::text,new_count) from feedback), '{}'::jsonb)
  )
  where (select ok from allowed);
$$;

revoke all on function public.rawi_dashboard_stats(uuid) from public;
grant execute on function public.rawi_dashboard_stats(uuid) to authenticated;
