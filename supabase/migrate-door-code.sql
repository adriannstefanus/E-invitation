-- Run this in the Supabase SQL editor if guests already exists.

alter table guests add column if not exists door_code text;

do $$
declare
  r record;
  code text;
begin
  for r in select id from guests where door_code is null loop
    loop
      code := (100000 + floor(random() * 900000)::int)::text;
      exit when not exists (select 1 from guests where door_code = code);
    end loop;
    update guests set door_code = code where id = r.id;
  end loop;
end $$;

alter table guests alter column door_code set not null;

create unique index if not exists guests_door_code_key on guests (door_code);
