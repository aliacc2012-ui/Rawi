-- Performance-only RLS cleanup: preserve existing authorization behavior while
-- avoiding per-row auth.uid() initialization and covering common foreign keys.

create index if not exists idx_downloads_media on public.downloads(media_id);
create index if not exists idx_media_uploader on public.media(uploader_id);
create index if not exists idx_workspace_members_user on public.workspace_members(user_id);

alter policy "profiles: read own" on public.profiles
  using ((select auth.uid()) = id);

alter policy "profiles: update own" on public.profiles
  using ((select auth.uid()) = id);

alter policy "workspaces: owner can update" on public.workspaces
  using (owner_id = (select auth.uid()));

alter policy "workspaces: authenticated users can create" on public.workspaces
  with check (owner_id = (select auth.uid()));

alter policy "workspaces: owner can delete" on public.workspaces
  using (owner_id = (select auth.uid()));

alter policy "workspace_members: owner manages roster" on public.workspace_members
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = (select auth.uid())
    )
  );
