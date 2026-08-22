import Link from "next/link";
import { createGuest, importGuestsCsv } from "@/app/admin/actions";
import { CopyText } from "@/components/admin/AdminControls";
import { AdminShell, SetupNotice, TypeBadge } from "@/components/admin/AdminUi";
import { listGuests } from "@/lib/db";
import { getSiteOrigin } from "@/lib/invite-url";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  GUEST_TYPES,
  RSVP_STATUSES,
  type GuestType,
  type RsvpStatus,
} from "@/lib/types";

type GuestsPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    rsvp?: string;
    door?: string;
    imported?: string;
    import?: string;
    error?: string;
  }>;
};

export default async function GuestsPage({ searchParams }: GuestsPageProps) {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const params = await searchParams;
  const guestType = (GUEST_TYPES as readonly string[]).includes(
    params.type ?? "",
  )
    ? (params.type as GuestType)
    : "all";
  const rsvpStatus = (RSVP_STATUSES as readonly string[]).includes(
    params.rsvp ?? "",
  )
    ? (params.rsvp as RsvpStatus)
    : "all";
  const attendance =
    params.door === "arrived" || params.door === "waiting"
      ? params.door
      : "all";

  const [guests, allGuests] = await Promise.all([
    listGuests({
      search: params.q,
      guestType,
      rsvpStatus,
      attendance,
    }),
    listGuests(),
  ]);

  const origin = await getSiteOrigin();
  const inviteById = Object.fromEntries(
    guests.map((guest) => [
      guest.id,
      origin ? `${origin}/g/${guest.token}` : `/g/${guest.token}`,
    ]),
  );

  return (
    <AdminShell title="Guests">
      <p className="mb-4 text-sm text-zinc-600">
        {allGuests.length} on the list ·{" "}
        {allGuests.filter((g) => g.rsvp_status === "yes").length} RSVP yes ·{" "}
        {allGuests.filter((g) => g.checked_in_at).length} arrived
        {guests.length !== allGuests.length ? ` · ${guests.length} shown` : ""}
      </p>

      {params.imported ? (
        <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Imported {params.imported} guest{params.imported === "1" ? "" : "s"}.
        </p>
      ) : null}
      {params.import === "empty" ? (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          The CSV was empty.
        </p>
      ) : null}
      {params.import === "error" || params.error === "create" ? (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not save guests. Check the file and try again.
        </p>
      ) : null}

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/guests">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search name or phone"
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
        <select
          name="rsvp"
          defaultValue={rsvpStatus}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="all">All RSVP</option>
          {RSVP_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          name="door"
          defaultValue={attendance}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="all">All door</option>
          <option value="arrived">Arrived</option>
          <option value="waiting">Not yet</option>
        </select>
        <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white">
          Filter
        </button>
        <a
          href="/admin/guests"
          className="rounded-md px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900"
        >
          Reset
        </a>
      </form>

      <div className="mb-3 flex flex-wrap gap-3 text-sm">
        <a href="/admin/guests/export" className="underline">
          Export CSV
        </a>
        <a href="/admin/guests/template" className="underline">
          Download import template
        </a>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        {guests.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No guests match. Add one below or import a CSV.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Party</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">RSVP</th>
                <th className="px-3 py-2 font-medium">Door</th>
                <th className="px-3 py-2 font-medium">Invite</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr
                  key={guest.id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/guests/${guest.id}`}
                      className="font-medium hover:underline"
                    >
                      {guest.name}
                    </Link>
                    {guest.notes ? (
                      <p className="max-w-48 truncate text-xs text-zinc-400">
                        {guest.notes}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    <TypeBadge type={guest.guest_type} />
                  </td>
                  <td className="px-3 py-2">{guest.invited_count}</td>
                  <td className="px-3 py-2 text-zinc-600">
                    {guest.phone || "—"}
                  </td>
                  <td className="px-3 py-2">
                    {guest.rsvp_status}
                    {guest.rsvp_count != null ? ` · ${guest.rsvp_count}` : ""}
                  </td>
                  <td className="px-3 py-2">
                    {guest.checked_in_at ? "Arrived" : "Waiting"}
                  </td>
                  <td className="px-3 py-2">
                    <CopyText value={inviteById[guest.id]} label="Copy link" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <form
          action={createGuest}
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <h2 className="font-medium">Add guest</h2>
          <div className="mt-3 space-y-3">
            <label className="block text-sm">
              Full name
              <input
                name="name"
                required
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Type
              <select
                name="guest_type"
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              >
                {GUEST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Party size (seats / plus-ones)
              <input
                name="invited_count"
                type="number"
                min={1}
                defaultValue={1}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Phone
              <input
                name="phone"
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Notes
              <textarea
                name="notes"
                rows={2}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
            <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white">
              Save and show QR
            </button>
          </div>
        </form>

        <form
          action={importGuestsCsv}
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <h2 className="font-medium">CSV import</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Columns: name, type, invited_count, phone. Type can be regular,
            vip, family, or vendor.
          </p>
          <input
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="mt-3 block w-full text-sm"
          />
          <button className="mt-3 rounded-md bg-zinc-900 px-3 py-2 text-sm text-white">
            Import
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
