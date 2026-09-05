-- RAWI initial schema
-- Every user-owned table is scoped through workspace ownership + RLS.
-- Nothing here trusts the frontend: policies check auth.uid() against
-- workspace_members, never a client-supplied user id.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users, created automatically on signup
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  avatar_url text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user is confirmed.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- workspaces + membership (studio/team-ready from day one)
-- ---------------------------------------------------------------------------
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  accent_color text not null default '#FFD400',
  plan text not null default 'free' check (plan in ('free', 'creator', 'pro', 'studio')),
  storage_limit_bytes bigint not null default 5368709120, -- 5 GB
  storage_used_bytes bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
  );
$$;

create policy "workspaces: members can read" on public.workspaces
  for select using (public.is_workspace_member(id));
create policy "workspaces: owner can update" on public.workspaces
  for update using (owner_id = auth.uid());
create policy "workspaces: authenticated users can create" on public.workspaces
  for insert with check (owner_id = auth.uid());
create policy "workspaces: owner can delete" on public.workspaces
  for delete using (owner_id = auth.uid());

create policy "workspace_members: members can read roster" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id));
create policy "workspace_members: owner manages roster" on public.workspace_members
  for all using (
    exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
  );

-- Auto-add the creating owner as a workspace member.
create function public.handle_new_workspace()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute procedure public.handle_new_workspace();

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
create policy "clients: workspace members only" on public.clients
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  project_type text not null default 'photography'
    check (project_type in ('photography','video','photo_video','automotive','wedding','event','real_estate','commercial','other')),
  project_date date,
  status text not null default 'draft' check (status in ('draft','processing','published','expired','archived')),
  cover_media_id uuid,
  vehicle_make text,
  vehicle_model text,
  vehicle_generation text,
  vehicle_year int,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

alter table public.projects enable row level security;
create policy "projects: workspace members only" on public.projects
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- ---------------------------------------------------------------------------
-- galleries (the published, client-facing surface of a project)
-- ---------------------------------------------------------------------------
create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  slug text not null unique, -- public URL segment, must be unguessable
  description text,
  status text not null default 'draft' check (status in ('draft','published','unpublished')),
  password_hash text,       -- bcrypt hash, never plaintext
  password_enabled boolean not null default false,
  expiry_date timestamptz,
  downloads_enabled boolean not null default true,
  favorites_enabled boolean not null default true,
  comments_enabled boolean not null default false,
  branding_enabled boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.galleries enable row level security;

create function public.workspace_id_for_project(target_project_id uuid)
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select workspace_id from public.projects where id = target_project_id;
$$;

create policy "galleries: workspace members manage" on public.galleries
  for all using (public.is_workspace_member(public.workspace_id_for_project(project_id)))
  with check (public.is_workspace_member(public.workspace_id_for_project(project_id)));

-- Public, unauthenticated read of a *published, non-expired* gallery only.
-- Password-protected galleries are still readable here (metadata only) —
-- the app layer enforces password entry before revealing media.
create policy "galleries: public can read published" on public.galleries
  for select using (
    status = 'published' and (expiry_date is null or expiry_date > now())
  );

-- ---------------------------------------------------------------------------
-- gallery sections
-- ---------------------------------------------------------------------------
create table public.gallery_sections (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  title text not null,
  section_type text not null default 'grid' check (section_type in ('grid','film','reels')),
  sort_order int not null default 0
);

alter table public.gallery_sections enable row level security;

create function public.workspace_id_for_gallery(target_gallery_id uuid)
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select public.workspace_id_for_project(project_id) from public.galleries where id = target_gallery_id;
$$;

create policy "gallery_sections: workspace members manage" on public.gallery_sections
  for all using (public.is_workspace_member(public.workspace_id_for_gallery(gallery_id)))
  with check (public.is_workspace_member(public.workspace_id_for_gallery(gallery_id)));

create policy "gallery_sections: public can read for published galleries" on public.gallery_sections
  for select using (
    exists (
      select 1 from public.galleries g
      where g.id = gallery_id and g.status = 'published'
        and (g.expiry_date is null or g.expiry_date > now())
    )
  );

-- ---------------------------------------------------------------------------
-- media
-- ---------------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  gallery_section_id uuid references public.gallery_sections(id) on delete set null,
  uploader_id uuid not null references public.profiles(id),
  file_name text not null,
  original_name text not null,
  media_type text not null check (media_type in ('image','video','raw')),
  mime_type text not null,
  file_size bigint not null,
  width int,
  height int,
  duration_seconds numeric,
  storage_path text not null,       -- private bucket path, never public
  thumbnail_path text,
  streaming_url text,               -- Mux/Cloudflare Stream playback id/url
  processing_status text not null default 'pending'
    check (processing_status in ('pending','processing','ready','failed')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;
create policy "media: workspace members manage" on public.media
  for all using (public.is_workspace_member(public.workspace_id_for_project(project_id)))
  with check (public.is_workspace_member(public.workspace_id_for_project(project_id)));

create policy "media: public can read for published galleries" on public.media
  for select using (
    gallery_section_id in (
      select gs.id from public.gallery_sections gs
      join public.galleries g on g.id = gs.gallery_id
      where g.status = 'published' and (g.expiry_date is null or g.expiry_date > now())
    )
  );

-- ---------------------------------------------------------------------------
-- client-side engagement: favorites, downloads, views
-- Clients are unauthenticated, so these are scoped by a per-visitor
-- session token (a random id set in a cookie by the app), not auth.uid().
-- ---------------------------------------------------------------------------
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  visitor_session text not null,
  created_at timestamptz not null default now(),
  unique (media_id, visitor_session)
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  download_type text not null default 'original' check (download_type in ('web','high_res','original')),
  visitor_session text,
  created_at timestamptz not null default now()
);

create table public.gallery_views (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  visitor_session text not null,
  created_at timestamptz not null default now()
);

alter table public.favorites enable row level security;
alter table public.downloads enable row level security;
alter table public.gallery_views enable row level security;

-- Workspace members can read all engagement data for their own galleries.
create policy "favorites: workspace members read" on public.favorites
  for select using (public.is_workspace_member(public.workspace_id_for_gallery(gallery_id)));
create policy "downloads: workspace members read" on public.downloads
  for select using (public.is_workspace_member(public.workspace_id_for_gallery(gallery_id)));
create policy "gallery_views: workspace members read" on public.gallery_views
  for select using (public.is_workspace_member(public.workspace_id_for_gallery(gallery_id)));

-- Anyone can write engagement rows only against a currently published,
-- non-expired gallery — this is how anonymous clients favorite/download.
create policy "favorites: public can insert on published galleries" on public.favorites
  for insert with check (
    exists (select 1 from public.galleries g where g.id = gallery_id and g.status = 'published'
      and (g.expiry_date is null or g.expiry_date > now()))
  );
create policy "downloads: public can insert on published galleries" on public.downloads
  for insert with check (
    exists (select 1 from public.galleries g where g.id = gallery_id and g.status = 'published'
      and (g.expiry_date is null or g.expiry_date > now()))
  );
create policy "gallery_views: public can insert on published galleries" on public.gallery_views
  for insert with check (
    exists (select 1 from public.galleries g where g.id = gallery_id and g.status = 'published'
      and (g.expiry_date is null or g.expiry_date > now()))
  );

-- ---------------------------------------------------------------------------
-- subscriptions (Stripe-ready, trusted server-side state only)
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free','creator','pro','studio')),
  status text not null default 'active' check (status in ('active','past_due','canceled','incomplete')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy "subscriptions: workspace members read" on public.subscriptions
  for select using (public.is_workspace_member(workspace_id));
-- No insert/update/delete policy for authenticated users: subscription
-- state is written only by the Stripe webhook handler using the
-- service-role key, which bypasses RLS by design.

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index idx_workspaces_owner on public.workspaces(owner_id);
create index idx_clients_workspace on public.clients(workspace_id);
create index idx_projects_workspace on public.projects(workspace_id);
create index idx_projects_client on public.projects(client_id);
create index idx_galleries_project on public.galleries(project_id);
create index idx_galleries_slug on public.galleries(slug);
create index idx_gallery_sections_gallery on public.gallery_sections(gallery_id);
create index idx_media_project on public.media(project_id);
create index idx_media_section on public.media(gallery_section_id);
create index idx_favorites_gallery on public.favorites(gallery_id);
create index idx_downloads_gallery on public.downloads(gallery_id);
create index idx_gallery_views_gallery on public.gallery_views(gallery_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.workspaces
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.galleries
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();
