-- RAWI Phase 3 performance indexes for common sorted lookups.

create index if not exists idx_clients_workspace_name
  on public.clients (workspace_id, name);

create index if not exists idx_gallery_sections_gallery_sort
  on public.gallery_sections (gallery_id, sort_order);

create index if not exists idx_media_project_sort_created
  on public.media (project_id, sort_order, created_at);

create index if not exists idx_media_section_sort
  on public.media (gallery_section_id, sort_order);

create index if not exists idx_gallery_comments_gallery_created
  on public.gallery_comments (gallery_id, created_at desc);

create index if not exists idx_gallery_approvals_gallery_approved
  on public.gallery_approvals (gallery_id, approved_at desc);
