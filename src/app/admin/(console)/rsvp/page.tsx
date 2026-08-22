import { AdminShell, SetupNotice, TypeBadge } from "@/components/admin/AdminUi";
import { EmptyState } from "@/components/ui/EmptyState";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { listGuests } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  GUEST_TYPES,
  RSVP_STATUSES,
  type GuestType,
  type RsvpStatus,
} from "@/lib/types";

type RsvpPageProps = {
  searchParams: Promise<{ type?: string; status?: string }>;
};

export default async function RsvpAdminPage({ searchParams }: RsvpPageProps) {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const params = await searchParams;
  const guestType = (GUEST_TYPES as readonly string[]).includes(
    params.type ?? "",
  )
    ? (params.type as GuestType)
    : "all";
  const status = (RSVP_STATUSES as readonly string[]).includes(
    params.status ?? "",
  )
    ? (params.status as RsvpStatus)
    : "all";
  const guests = (await listGuests({ guestType })).filter((guest) =>
    status === "all" ? true : guest.rsvp_status === status,
  );

  return (
    <AdminShell title="RSVP">
      <form className="mb-4 flex flex-wrap gap-2" action="/admin/rsvp">
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {RSVP_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
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
        <SubmitButton
          pendingLabel="Filtering…"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          Filter
        </SubmitButton>
      </form>

      {guests.length === 0 ? (
        <EmptyState title="No RSVPs match these filters." />
      ) : (
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Coming</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr
                key={guest.id}
                className="border-b border-zinc-100 last:border-0"
              >
                <td className="px-3 py-2">{guest.name}</td>
                <td className="px-3 py-2">
                  <TypeBadge type={guest.guest_type} />
                </td>
                <td className="px-3 py-2">{guest.rsvp_status}</td>
                <td className="px-3 py-2">{guest.rsvp_count ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </AdminShell>
  );
}
