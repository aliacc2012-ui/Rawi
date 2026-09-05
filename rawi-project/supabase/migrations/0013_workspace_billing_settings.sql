alter table public.workspaces
  add column if not exists renewal_reminder_days integer not null default 3
  check (renewal_reminder_days between 1 and 30);
