-- Restrict public database access and keep gallery delivery behind validated server actions.
drop policy if exists "galleries: public can read published" on public.galleries;
drop policy if exists "gallery_sections: public can read for published galleries" on public.gallery_sections;
drop policy if exists "media: public can read for published galleries" on public.media;
drop policy if exists "favorites: public can insert on published galleries" on public.favorites;
drop policy if exists "downloads: public can insert on published galleries" on public.downloads;
drop policy if exists "gallery_views: public can insert on published galleries" on public.gallery_views;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

alter policy "profiles: read own" on public.profiles to authenticated;
alter policy "profiles: update own" on public.profiles
  to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
alter policy "workspaces: members can read" on public.workspaces to authenticated;
alter policy "workspaces: owner can update" on public.workspaces
  to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
alter policy "workspaces: authenticated users can create" on public.workspaces to authenticated;
alter policy "workspaces: owner can delete" on public.workspaces to authenticated;
alter policy "workspace_members: members can read roster" on public.workspace_members to authenticated;
alter policy "workspace_members: owner manages roster" on public.workspace_members
  to authenticated
  using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid())));
alter policy "clients: workspace members only" on public.clients to authenticated;
alter policy "projects: workspace members only" on public.projects to authenticated;
alter policy "galleries: workspace members manage" on public.galleries to authenticated;
alter policy "gallery_sections: workspace members manage" on public.gallery_sections to authenticated;
alter policy "media: workspace members manage" on public.media to authenticated;
alter policy "favorites: workspace members read" on public.favorites to authenticated;
alter policy "downloads: workspace members read" on public.downloads to authenticated;
alter policy "gallery_views: workspace members read" on public.gallery_views to authenticated;
alter policy "subscriptions: workspace members read" on public.subscriptions to authenticated;
alter policy "gallery_approvals: workspace members can read" on public.gallery_approvals to authenticated;
alter policy "gallery_comments: workspace members can read" on public.gallery_comments to authenticated;
alter policy "gallery_comments: workspace members can update" on public.gallery_comments to authenticated;

alter policy "media bucket: workspace members manage their files" on storage.objects to authenticated;
alter policy "public-assets: workspace members manage their files" on storage.objects to authenticated;
alter policy "public-assets: workspace members update their files" on storage.objects
  to authenticated
  using (bucket_id = 'public-assets' and public.is_workspace_member((storage.foldername(name))[1]::uuid))
  with check (bucket_id = 'public-assets' and public.is_workspace_member((storage.foldername(name))[1]::uuid));
alter policy "public-assets: workspace members delete their files" on storage.objects to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_new_workspace() from public, anon, authenticated;
revoke execute on function public.is_workspace_member(uuid) from public, anon;
revoke execute on function public.workspace_id_for_project(uuid) from public, anon;
revoke execute on function public.workspace_id_for_gallery(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.workspace_id_for_project(uuid) to authenticated;
grant execute on function public.workspace_id_for_gallery(uuid) to authenticated;
revoke execute on function public.rawi_dashboard_stats(uuid) from public, anon;
grant execute on function public.rawi_dashboard_stats(uuid) to authenticated;

alter function public.set_updated_at() set search_path = public;
alter function public.workspace_storage_limit_for_plan(text) set search_path = public;
alter function public.sync_workspace_storage_limit() set search_path = public;

do $$
begin
  if to_regclass('public.media_ratings') is not null then
    execute 'drop policy if exists "media_ratings: public can read own published ratings" on public.media_ratings';
    execute 'drop policy if exists "media_ratings: public can insert on published galleries" on public.media_ratings';
    execute 'drop policy if exists "media_ratings: public can update on published galleries" on public.media_ratings';
    execute 'alter policy "media_ratings: workspace members read" on public.media_ratings to authenticated';
    execute 'revoke all on public.media_ratings from anon';
  end if;
end
$$;
