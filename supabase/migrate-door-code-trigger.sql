-- Run this if add-guest fails after door_code was made required.
-- Fills door_code when the app does not send one (old deploy / CSV).

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
