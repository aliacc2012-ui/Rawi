-- Persist creator social profiles at workspace level so they follow the user
-- across browsers/devices. Existing workspace RLS continues to protect access.

alter table public.workspaces
  add column if not exists instagram_url text,
  add column if not exists tiktok_url text,
  add column if not exists facebook_url text,
  add column if not exists website_url text;

-- Keep stored links bounded. URL protocol/domain validation is also enforced
-- by the server action before updates reach Postgres.
alter table public.workspaces
  add constraint workspaces_instagram_url_length check (instagram_url is null or char_length(instagram_url) <= 500),
  add constraint workspaces_tiktok_url_length check (tiktok_url is null or char_length(tiktok_url) <= 500),
  add constraint workspaces_facebook_url_length check (facebook_url is null or char_length(facebook_url) <= 500),
  add constraint workspaces_website_url_length check (website_url is null or char_length(website_url) <= 500);
