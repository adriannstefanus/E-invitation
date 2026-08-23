-- Public bucket for invite music (and later photos). Run in the SQL editor.
-- Uploads go through the admin server action with the service role key.

insert into storage.buckets (id, name, public, file_size_limit)
values ('invite-media', 'invite-media', true, 10485760)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760;

drop policy if exists "Public read invite-media" on storage.objects;
create policy "Public read invite-media"
on storage.objects
for select
using (bucket_id = 'invite-media');
