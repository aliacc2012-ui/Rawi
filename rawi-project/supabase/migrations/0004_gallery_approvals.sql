-- Client approval records for Pro gallery delivery.
-- One approval per gallery/visitor session keeps v1 simple while leaving room
-- for revision/rejection workflow later without bloating the galleries table.

create table if not exists public.gallery_approvals (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  visitor_session text not null,
  client_name text not null check (char_length(trim(client_name)) between 1 and 120),
  status text not null default 'approved' check (status in ('approved')),
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (gallery_id, visitor_session)
);

create index if not exists gallery_approvals_gallery_id_idx
  on public.gallery_approvals(gallery_id);

alter table public.gallery_approvals enable row level security;

-- Creators can read approvals only for galleries belonging to workspaces they
-- are members of. Public clients submit approvals through a validated server
-- action using the service-role client, so no anonymous insert policy is needed.
create policy "gallery_approvals: workspace members can read"
  on public.gallery_approvals
  for select
  using (
    exists (
      select 1
      from public.galleries g
      join public.projects p on p.id = g.project_id
      where g.id = gallery_approvals.gallery_id
        and public.is_workspace_member(p.workspace_id)
    )
  );
