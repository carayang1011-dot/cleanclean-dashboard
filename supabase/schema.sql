-- ========== 5.1 KPI 設定 ==========
create table public.settings (
  id int primary key default 1,
  h1_target bigint not null default 2500000,
  monthly_target jsonb not null default '{"1":420000,"2":420000,"3":420000,"4":420000,"5":420000,"6":400000}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ========== 5.2 KOL / KOC 主表 ==========
create table public.kols (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text,
  platform text,
  category text,
  start_date date,
  end_date date,
  status text,
  note text,
  followers text,
  orders int,
  revenue numeric(12,2),
  aov numeric(10,2),
  commission_rate numeric(5,2),
  commission_amount numeric(12,2),
  contact_owner text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by text
);
create index kols_start_date_idx on public.kols(start_date);
create index kols_status_idx on public.kols(status);

-- ========== 5.3 其他合作專案 ==========
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  status text,
  stage text,
  next_step text,
  owner text,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by text
);

-- ========== 5.4 每月開團數統計 ==========
create table public.monthly_stats (
  month int primary key,
  big_host_actual int,
  big_host_target int default 3,
  small_host_actual int,
  small_host_target int default 3,
  month_achieved boolean,
  updated_at timestamptz default now(),
  updated_by text
);

-- ========== 5.5 Podcast 合作 ==========
create table public.podcasts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  status text,
  stage text,
  next_step text,
  owner text,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by text
);

-- ========== 5.6 代言人名單 ==========
create table public.endorsers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  recommender text,
  reason text,
  followers text,
  url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by text
);

-- ========== 5.7 邀約名單 ==========
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  owner text not null,
  status text,
  type text,
  name text not null,
  followers text,
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
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by text
);
create index invitations_owner_idx on public.invitations(owner);
create index invitations_status_idx on public.invitations(status);
create index invitations_name_idx on public.invitations(name);
create index invitations_first_contact_date_idx on public.invitations(first_contact_date);

-- ========== 5.8 週報 / 月報 / 會議記錄 ==========
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  content text,
  date date,
  participants text[],
  attachment_url text,
  author text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by text
);
create index reports_kind_date_idx on public.reports(kind, date desc);

-- ========== 5.9 RLS 全開放 ==========
alter table public.settings enable row level security;
alter table public.kols enable row level security;
alter table public.projects enable row level security;
alter table public.monthly_stats enable row level security;
alter table public.podcasts enable row level security;
alter table public.endorsers enable row level security;
alter table public.invitations enable row level security;
alter table public.reports enable row level security;

create policy "public all" on public.settings for all using (true) with check (true);
create policy "public all" on public.kols for all using (true) with check (true);
create policy "public all" on public.projects for all using (true) with check (true);
create policy "public all" on public.monthly_stats for all using (true) with check (true);
create policy "public all" on public.podcasts for all using (true) with check (true);
create policy "public all" on public.endorsers for all using (true) with check (true);
create policy "public all" on public.invitations for all using (true) with check (true);
create policy "public all" on public.reports for all using (true) with check (true);

-- ========== 5.9 歷史合作名單（KOC 348 筆匯入資料）==========
create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  source text,
  paid text,
  collab_type text,
  level text,
  year int,
  start_date date,
  end_date date,
  creator text,
  platform text,
  url text,
  product text,
  system text,
  material text,
  owner text,
  status text,
  discount text,
  commission_rate numeric(5,4),
  fee_pretax numeric(12,2),
  fee_tax numeric(12,2),
  orders int,
  revenue numeric(12,2),
  commission_amount numeric(12,2),
  aov numeric(10,2),
  ad_auth text,
  note text,
  shipping_info text,
  transfer_info text,
  transfer_amount numeric(12,2),
  payment_date date,
  tax_receipt text,
  transfer_note text
);
create index if not exists history_start_date_idx on public.history(start_date);
create index if not exists history_creator_idx on public.history(creator);
create index if not exists history_owner_idx on public.history(owner);
alter table public.history enable row level security;
create policy "public all" on public.history for all using (true) with check (true);

-- ========== 5.10 updated_at trigger ==========
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

do $$ declare t text; begin
  for t in select unnest(array['kols','projects','monthly_stats','podcasts','endorsers','invitations','reports','settings']) loop
    execute format('drop trigger if exists trg_%s_touch on public.%s', t, t);
    execute format('create trigger trg_%s_touch before update on public.%s for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;
