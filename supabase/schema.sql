-- Victorian federal electoral divisions schema

create table if not exists divisions (
  id text primary key,
  name text not null,
  state text not null default 'VIC',
  area_km2 numeric,
  classification text,
  member_name text,
  member_party text,
  electors integer
);

create table if not exists division_metrics (
  division_id text references divisions(id) on delete cascade,
  metric_key text,
  metric_value numeric,
  metric_value_text text,
  unit text,
  source text,
  year integer,
  primary key (division_id, metric_key)
);

create index if not exists division_metrics_division_id_idx on division_metrics (division_id);

-- Public read-only dataset: enable RLS and allow anonymous SELECT only.
-- All writes happen via the seed script using the service role key, which
-- bypasses RLS, so no insert/update/delete policy is defined for anon.
alter table divisions enable row level security;
alter table division_metrics enable row level security;

drop policy if exists "Public read access" on divisions;
create policy "Public read access" on divisions
  for select using (true);

drop policy if exists "Public read access" on division_metrics;
create policy "Public read access" on division_metrics
  for select using (true);
