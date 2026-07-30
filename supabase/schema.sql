create table if not exists modules (
  id text primary key,
  title text not null,
  description text not null,
  icon_key text not null,
  icon_bg text not null,
  bar_color text not null,
  order_index int not null default 0,
  locked boolean not null default false,
  hidden boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into modules (id, title, description, icon_key, icon_bg, bar_color, order_index, locked, hidden)
values
  ('binary-arithmetic', 'Binary arithmetic', 'Addition, overflow, two''s complement', 'binary', '#E6F1FB', '#195FA5', 0, false, false),
  ('single-cycle', 'Single cycle', 'Datapath, control signals', 'cpu', '#E9F2DD', '#3F681B', 1, false, false),
  ('pipeline', '5-stage pipeline', 'IF, ID, EX, MEM, WB', 'rows', '#EDECFD', '#4F4898', 2, false, false),
  ('machine-instructions', 'Machine instructions', 'Instruction types, opcodes', 'monitor-cog', '#fef9e0', '#f9ab00', 3, true, false),
  ('hazards', 'Hazards and detection', 'Data, control, structural', 'alert-triangle', '#FAEEDC', '#b6761d', 4, true, false),
  ('caching', 'Caching', 'Direct-mapped, set associative', 'database', '#FBECE6', '#b15636', 5, true, true)
on conflict (id) do nothing;

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  type text not null check (type in ('visit', 'click', 'question', 'simulation')),
  outcome text check (outcome in ('correct', 'incorrect', 'partial')),
  score numeric,
  max_score numeric,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_module_idx on analytics_events (module);
create index if not exists analytics_events_created_at_idx on analytics_events (created_at);

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table modules enable row level security;
alter table analytics_events enable row level security;

create policy "anyone can read modules"
  on modules for select
  using (true);

create policy "anyone can insert an analytics event"
  on analytics_events for insert
  with check (true);
