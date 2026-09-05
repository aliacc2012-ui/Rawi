-- Track creator progress on client feedback.
alter table public.gallery_comments
  add column if not exists status text not null default 'new'
  check (status in ('new', 'in_progress', 'resolved'));

create index if not exists gallery_comments_status_idx
  on public.gallery_comments(gallery_id, status);

-- Workspace members may update only comments belonging to their workspaces.
create policy "gallery_comments: workspace members can update"
  on public.gallery_comments
  for update
  using (
    exists (
      select 1
      from public.galleries g
      join public.projects p on p.id = g.project_id
      where g.id = gallery_comments.gallery_id
        and public.is_workspace_member(p.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from public.galleries g
      join public.projects p on p.id = g.project_id
      where g.id = gallery_comments.gallery_id
        and public.is_workspace_member(p.workspace_id)
    )
  );
