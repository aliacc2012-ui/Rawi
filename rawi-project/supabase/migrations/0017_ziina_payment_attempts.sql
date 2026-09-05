create table if not exists public.billing_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('creator','pro')),
  amount integer not null check (amount > 0),
  currency_code text not null default 'AED' check (currency_code = 'AED'),
  status text not null default 'requires_payment_instrument' check (status in ('requires_payment_instrument','requires_user_action','pending','completed','failed','canceled')),
  ziina_payment_intent_id text not null unique,
  test_mode boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_payment_attempts_workspace_created_idx
  on public.billing_payment_attempts (workspace_id, created_at desc);

alter table public.billing_payment_attempts enable row level security;
revoke all on table public.billing_payment_attempts from anon, authenticated;

create or replace function public.set_billing_payment_attempt_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_billing_payment_attempt_updated_at on public.billing_payment_attempts;
create trigger set_billing_payment_attempt_updated_at
before update on public.billing_payment_attempts
for each row execute function public.set_billing_payment_attempt_updated_at();

revoke all on function public.set_billing_payment_attempt_updated_at() from public, anon, authenticated;

create or replace function public.activate_ziina_payment(p_payment_intent_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  payment_attempt public.billing_payment_attempts%rowtype;
  existing_period_end timestamptz;
  next_period_end timestamptz;
  storage_limit bigint;
begin
  select * into payment_attempt
  from public.billing_payment_attempts
  where ziina_payment_intent_id = p_payment_intent_id
  for update;

  if not found then raise exception 'Unknown payment intent'; end if;
  if payment_attempt.completed_at is not null then
    return jsonb_build_object('already_applied', true, 'plan', payment_attempt.plan);
  end if;

  storage_limit := case payment_attempt.plan
    when 'creator' then 200::bigint * 1024 * 1024 * 1024
    when 'pro' then 500::bigint * 1024 * 1024 * 1024
    else null
  end;
  if storage_limit is null then raise exception 'Invalid paid plan'; end if;

  select current_period_end into existing_period_end
  from public.subscriptions
  where workspace_id = payment_attempt.workspace_id
  for update;

  next_period_end := greatest(coalesce(existing_period_end, now()), now()) + interval '30 days';

  update public.workspaces
  set plan = payment_attempt.plan, storage_limit_bytes = storage_limit
  where id = payment_attempt.workspace_id;
  if not found then raise exception 'Unknown workspace'; end if;

  insert into public.subscriptions (
    workspace_id, plan, status, current_period_end, ziina_payment_intent_id, provider
  ) values (
    payment_attempt.workspace_id, payment_attempt.plan, 'active', next_period_end,
    payment_attempt.ziina_payment_intent_id, 'ziina'
  )
  on conflict (workspace_id) do update set
    plan = excluded.plan,
    status = excluded.status,
    current_period_end = excluded.current_period_end,
    ziina_payment_intent_id = excluded.ziina_payment_intent_id,
    provider = excluded.provider,
    updated_at = now();

  update public.billing_payment_attempts
  set status = 'completed', completed_at = now()
  where id = payment_attempt.id;

  return jsonb_build_object('already_applied', false, 'plan', payment_attempt.plan, 'current_period_end', next_period_end);
end;
$$;

revoke all on function public.activate_ziina_payment(text) from public, anon, authenticated;
grant execute on function public.activate_ziina_payment(text) to service_role;
