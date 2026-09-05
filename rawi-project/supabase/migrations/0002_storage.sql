-- Storage buckets. `media` is private — originals are never public; the app
-- serves them via short-lived signed URLs. `public-assets` holds things
-- meant to be public by design (workspace logos, gallery covers thumbnails).

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- Path convention enforced by policy: media/{workspace_id}/{project_id}/{filename}
-- so RLS can check workspace membership straight from the object path.

create policy "media bucket: workspace members manage their files"
  on storage.objects for all
  using (
    bucket_id = 'media'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'media'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

create policy "public-assets: anyone can read"
  on storage.objects for select
  using (bucket_id = 'public-assets');

create policy "public-assets: workspace members manage their files"
  on storage.objects for insert
  with check (
    bucket_id = 'public-assets'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

create policy "public-assets: workspace members update their files"
  on storage.objects for update
  using (
    bucket_id = 'public-assets'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

create policy "public-assets: workspace members delete their files"
  on storage.objects for delete
  using (
    bucket_id = 'public-assets'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );
