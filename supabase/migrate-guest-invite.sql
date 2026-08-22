-- Run this in the Supabase SQL editor if guests already exists.

do $$ begin
  create type invite_event as enum ('both', 'ceremony', 'reception');
exception
  when duplicate_object then null;
end $$;

alter table guests add column if not exists invite_name text;
alter table guests add column if not exists invited_to invite_event not null default 'both';
