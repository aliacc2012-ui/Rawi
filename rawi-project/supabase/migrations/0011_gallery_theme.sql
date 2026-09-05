alter table public.galleries
  add column if not exists theme text not null default 'clean'
  check (theme in ('clean','dark','editorial'));
