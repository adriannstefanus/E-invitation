-- Run this in the Supabase SQL editor.

alter table guests
add column if not exists invite_sent_at timestamptz;
