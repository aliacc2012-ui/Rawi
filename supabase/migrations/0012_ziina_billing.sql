-- Ziina monthly-pass billing state.
-- Keeps payment-intent mapping server-side so webhook data never needs to carry workspace IDs.

alter table public.subscriptions
  add column if not exists ziina_payment_intent_id text,
  add column if not exists provider text not null default 'ziina';

create unique index if not exists idx_subscriptions_ziina_payment_intent
  on public.subscriptions (ziina_payment_intent_id)
  where ziina_payment_intent_id is not null;
