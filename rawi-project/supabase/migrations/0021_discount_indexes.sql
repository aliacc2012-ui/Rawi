create index if not exists billing_payment_attempts_discount_redemption_idx
  on public.billing_payment_attempts (discount_redemption_id);
create index if not exists discount_redemptions_user_idx
  on public.discount_redemptions (user_id);
