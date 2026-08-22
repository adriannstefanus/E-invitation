-- Run this in the Supabase SQL editor.

create table if not exists site_settings (
  id text primary key default 'default',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

insert into site_settings (id, data)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;
