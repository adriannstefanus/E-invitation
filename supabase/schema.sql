-- Run this in the Supabase SQL editor.

create type guest_type as enum ('regular', 'vip', 'family', 'vendor');
create type rsvp_status as enum ('pending', 'yes', 'no');
create type check_in_method as enum ('qr', 'manual');
create type gift_kind as enum ('angpao', 'physical');
create type invite_event as enum ('both', 'ceremony', 'reception');

create table guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_name text,
  token text not null unique,
  guest_type guest_type not null default 'regular',
  invited_to invite_event not null default 'both',
  door_code text not null unique,
  invited_count integer not null default 1 check (invited_count >= 1),
  phone text,
  notes text,
  rsvp_status rsvp_status not null default 'pending',
  rsvp_count integer,
  rsvp_at timestamptz,
  checked_in_at timestamptz,
  arrived_count integer,
  check_in_method check_in_method,
  invite_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests (id) on delete set null,
  name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table gifts (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests (id) on delete set null,
  guest_name text not null,
  kind gift_kind not null,
  amount numeric,
  note text,
  received_at timestamptz not null default now()
);

create index guests_name_idx on guests (name);
create index guests_type_idx on guests (guest_type);
create index guests_rsvp_idx on guests (rsvp_status);
create index guests_checked_in_idx on guests (checked_in_at);
create index comments_created_idx on comments (created_at desc);
create index gifts_received_idx on gifts (received_at desc);

alter table guests enable row level security;
alter table comments enable row level security;
alter table gifts enable row level security;

create table if not exists site_settings (
  id text primary key default 'default',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

insert into site_settings (id, data)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;

create or replace function guests_set_door_code()
returns trigger
language plpgsql
as $$
declare
  code text;
begin
  if new.door_code is not null and new.door_code <> '' then
    return new;
  end if;

  loop
    code := (100000 + floor(random() * 900000)::int)::text;
    exit when not exists (select 1 from guests where door_code = code);
  end loop;

  new.door_code := code;
  return new;
end;
$$;

drop trigger if exists guests_set_door_code on guests;
create trigger guests_set_door_code
before insert on guests
for each row
execute function guests_set_door_code();
