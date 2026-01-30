-- 1. Subscriptions Table
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text check (plan in ('basic', 'pro')) not null default 'basic',
  status text check (status in ('trial', 'active', 'past_due', 'canceled')) not null default 'trial',
  trial_ends_at timestamp with time zone,
  current_period_end timestamp with time zone,
  mercado_pago_subscription_id text,
  created_at timestamp with time zone default now()
);

-- RLS for Subscriptions
alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- 2. Ensure Profiles have default Admin role (Application logic handled, but RLS here)
-- Update existing RLS if needed, ensuring Admins can read everything they need.
-- (Assuming existing profile policies are sufficient, checking next steps)
