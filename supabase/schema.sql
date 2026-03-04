-- Supabase Schema for Trustless Rewards System

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Campaigns Table (Matches Option A model)
create table public.campaigns (
  id bigint generated always as identity primary key,   -- Maps to on-chain uint256 campaignId
  partner_name text not null,
  title text not null,
  description text not null,
  reward_amount text not null,                          -- Formatted for UI, e.g., "5.00"
  reward_per_claim_wei text not null,                   -- Explicit in Wei format as string
  max_claims integer not null,
  currency text not null,                               -- "USDC" or "ETH"
  token_address text,                                   -- null for ETH
  total_escrowed text not null default '0',
  status text not null default 'active',                -- active, paused, closed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Completions Table (Users who have completed the partner action)
create table public.completions (
  id uuid default uuid_generate_v4() primary key,
  campaign_id bigint references public.campaigns(id) not null,
  user_address text not null,                           -- wallet address
  partner_reference text,                               -- e.g., external tweet ID or partner user ID
  status text not null default 'verified',              -- verified, revoked
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (campaign_id, user_address)                    -- Prevent duplicate completions for Option A
);

-- 3. Claims Table (Signed claims ready for on-chain execution, or already executed)
create table public.claims (
  id uuid default uuid_generate_v4() primary key,
  campaign_id bigint references public.campaigns(id) not null,
  user_address text not null,
  amount text not null,                                 -- Wei amount
  nonce integer not null,                               -- from contract mapping nonces[campaignId][user]
  expiry bigint not null,                               -- Unix timestamp
  signature text not null,                              -- EIP-712 hex signature
  status text not null default 'signed',                -- signed, claimed, expired
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  claimed_at timestamp with time zone,
  unique (campaign_id, user_address, nonce)             -- Unique nonce per user per campaign
);

-- 4. Sponsors / Partners (Optional for API Auth)
create table public.partners (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  api_key text not null unique,                         -- For authorized backend hit to report-completion
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Setup (Row Level Security)
alter table public.campaigns enable row level security;
alter table public.completions enable row level security;
alter table public.claims enable row level security;
alter table public.partners enable row level security;

-- Policies
create policy "Campaigns are viewable by everyone" on public.campaigns for select using (true);

-- Completions viewable by everyone (for public stats) or just the user
create policy "Completions are viewable by everyone" on public.completions for select using (true);
create policy "Completions insert restricted to service role" on public.completions for insert with check (false); -- Handled by backend

-- Claims are viewable by everyone (public ledger concept offchain)
create policy "Claims are viewable by everyone" on public.claims for select using (true);
create policy "Claims insert restricted to service role" on public.claims for insert with check (false); -- Handled by backend
create policy "Claims update restricted to service role" on public.claims for update using (false); -- Handled by backend
