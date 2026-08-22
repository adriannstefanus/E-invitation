import { checkInGuestForm, undoCheckIn } from "@/app/admin/actions";
import { AdminShell, SetupNotice, TypeBadge } from "@/components/admin/AdminUi";
import { DoorScanner } from "@/components/admin/DoorScanner";
import { listGuests } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { GUEST_TYPES, type GuestType } from "@/lib/types";

type DoorPageProps = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

export default async function DoorPage({ searchParams }: DoorPageProps) {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const params = await searchParams;
  const guestType = (GUEST_TYPES as readonly string[]).includes(
    params.type ?? "",
  )
    ? (params.type as GuestType)
    : "all";
  const guests = await listGuests({
    search: params.q,
    guestType,
  });

  return (
    <AdminShell title="Door">
      <DoorScanner />

      <form className="mt-6 flex flex-wrap gap-2" action="/admin/door">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search name"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <select
          name="type"
          defaultValue={guestType}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="all">All types</option>
          {GUEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white">
          Search
        </button>
      </form>

      <form action={checkInGuestForm} className="mt-4 flex gap-2">
        <input
          name="token"
          placeholder="Paste invite URL or token"
          className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input type="hidden" name="method" value="manual" />
        <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white">
          Check in
        </button>
      </form>

      <ul className="mt-6 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {guests.map((guest) => (
          <li
            key={guest.id}
            className="flex flex-wrap items-center gap-3 px-3 py-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{guest.name}</p>
              <p className="text-zinc-500">
                <TypeBadge type={guest.guest_type} />{" "}
                {guest.checked_in_at ? "Arrived" : "Waiting"}
              </p>
            </div>
            {guest.checked_in_at ? (
              <form action={undoCheckIn}>
                <input type="hidden" name="id" value={guest.id} />
                <button className="text-zinc-500 hover:text-zinc-900">
                  Undo
                </button>
              </form>
            ) : (
              <form action={checkInGuestForm}>
                <input type="hidden" name="token" value={guest.token} />
                <input type="hidden" name="method" value="manual" />
                <button className="rounded-md bg-zinc-900 px-3 py-1.5 text-white">
                  Check in
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
