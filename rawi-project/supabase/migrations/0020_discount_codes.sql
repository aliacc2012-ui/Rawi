create table if not exists public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  code_key text not null,
  discount_percentage smallint not null check (discount_percentage in (10, 50, 100)),
  plan text not null check (plan in ('creator', 'pro')),
  original_amount integer not null check (original_amount > 0),
  final_amount integer not null check (final_amount >= 0),
  status text not null default 'reserved' check (status in ('reserved', 'redeemed', 'failed')),
  ziina_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  redeemed_at timestamptz
);

create unique index if not exists discount_redemptions_workspace_active_idx
  on public.discount_redemptions (workspace_id)
  where status in ('reserved', 'redeemed');
create index if not exists discount_redemptions_code_status_idx
  on public.discount_redemptions (code_key, status);

alter table public.discount_redemptions enable row level security;
revoke all on table public.discount_redemptions from anon, authenticated;

alter table public.billing_payment_attempts
  add column if not exists original_amount integer,
  add column if not exists discount_percentage smallint not null default 0,
  add column if not exists discount_redemption_id uuid references public.discount_redemptions(id);

create or replace function public.claim_rawi_discount(
  p_workspace_id uuid,
  p_user_id uuid,
  p_code_key text,
  p_discount_percentage smallint,
  p_max_uses integer,
  p_plan text,
  p_original_amount integer,
  p_final_amount integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  redemption public.discount_redemptions%rowtype;
  current_uses integer;
  next_period_end timestamptz;
  storage_limit bigint;
begin
  if p_discount_percentage not in (10, 50, 100)
     or p_plan not in ('creator', 'pro')
     or p_original_amount <= 0
     or p_final_amount < 0 then
    raise exception 'Invalid discount request';
  end if;

  if not exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = p_user_id
      and role in ('owner', 'admin')
  ) then raise exception 'Not authorized'; end if;

  perform pg_advisory_xact_lock(hashtext(p_code_key));

  update public.discount_redemptions
    set status = 'failed'
    where status = 'reserved' and created_at < now() - interval '1 hour';

  if exists (
    select 1 from public.discount_redemptions
    where workspace_id = p_workspace_id and status in ('reserved', 'redeemed')
  ) then raise exception 'A discount was already used for this workspace'; end if;

  select count(*) into current_uses
  from public.discount_redemptions
  where code_key = p_code_key and status in ('reserved', 'redeemed');
  if current_uses >= p_max_uses then raise exception 'This code has reached its usage limit'; end if;

  insert into public.discount_redemptions (
    workspace_id, user_id, code_key, discount_percentage, plan,
    original_amount, final_amount, status
  ) values (
    p_workspace_id, p_user_id, p_code_key, p_discount_percentage, p_plan,
    p_original_amount, p_final_amount,
    case when p_discount_percentage = 100 then 'redeemed' else 'reserved' end
  ) returning * into redemption;

  if p_discount_percentage = 100 then
    storage_limit := case p_plan
      when 'creator' then 200::bigint * 1024 * 1024 * 1024
      when 'pro' then 500::bigint * 1024 * 1024 * 1024
    end;
    select greatest(coalesce(current_period_end, now()), now()) + interval '30 days'
      into next_period_end
    from public.subscriptions where workspace_id = p_workspace_id;
    next_period_end := coalesce(next_period_end, now() + interval '30 days');

    update public.workspaces
      set plan = p_plan, storage_limit_bytes = storage_limit
      where id = p_workspace_id;

    insert into public.subscriptions (
      workspace_id, plan, status, current_period_end, provider
    ) values (
      p_workspace_id, p_plan, 'active', next_period_end, 'promo'
    ) on conflict (workspace_id) do update set
      plan = excluded.plan,
      status = excluded.status,
      current_period_end = excluded.current_period_end,
      ziina_payment_intent_id = null,
      provider = 'promo',
      updated_at = now();

    update public.discount_redemptions
      set redeemed_at = now() where id = redemption.id;
  end if;

  return jsonb_build_object(
    'redemption_id', redemption.id,
    'discount_percentage', redemption.discount_percentage,
    'final_amount', redemption.final_amount,
    'activated', p_discount_percentage = 100,
    'current_period_end', next_period_end
  );
end;
$$;

revoke all on function public.claim_rawi_discount(uuid, uuid, text, smallint, integer, text, integer, integer) from public, anon, authenticated;
grant execute on function public.claim_rawi_discount(uuid, uuid, text, smallint, integer, text, integer, integer) to service_role;
