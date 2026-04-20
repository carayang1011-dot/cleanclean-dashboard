-- cleanclean-dashboard Supabase Schema
-- Run this in Supabase SQL Editor

create table if not exists kols (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text,
  level text,
  platform text,
  category text,
  start_date date,
  end_date date,
  status text,
  note text,
  followers integer,
  orders integer,
  revenue numeric,
  aov numeric,
  commission_rate numeric,
  commission_amount numeric,
  contact_owner text,
  updated_by text
);

create table if not exists invitations (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  owner text,
  status text,
  type text,
  name text,
  followers integer,
  url text,
  ig_url text,
  fb_url text,
  product text,
  contact_log text,
  quote text,
  final_spec text,
  ad_authorization text,
  note text,
  shipping_info text,
  gift text,
  schedule text,
  first_contact_date date,
  updated_by text
);

create table if not exists endorsers (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text,
  recommender text,
  reason text,
  followers integer,
  url text,
  updated_by text
);

create table if not exists projects (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text,
  type text,
  status text,
  stage text,
  next_step text,
  owner text,
  start_date date,
  end_date date,
  updated_by text
);

create table if not exists podcasts (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text,
  type text,
  status text,
  stage text,
  next_step text,
  owner text,
  start_date date,
  end_date date,
  updated_by text
);

create table if not exists reports (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by text,
  participants text,
  attachment_url text,
  kind text,
  title text,
  date date,
  author text,
  content text
);

create table if not exists monthly_stats (
  month integer primary key,
  big_host_actual numeric,
  big_host_target numeric,
  small_host_actual numeric,
  small_host_target numeric,
  month_achieved numeric,
  updated_at timestamptz default now(),
  updated_by text
);

create table if not exists settings (
  id text primary key,
  h1_target numeric,
  monthly_target numeric,
  updated_at timestamptz default now()
);
