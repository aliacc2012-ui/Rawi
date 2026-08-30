alter table public.workspaces
add column if not exists whatsapp_url text;

alter table public.workspaces
drop constraint if exists workspaces_whatsapp_url_http;

alter table public.workspaces
add constraint workspaces_whatsapp_url_http
check (whatsapp_url is null or whatsapp_url ~ '^https?://');
