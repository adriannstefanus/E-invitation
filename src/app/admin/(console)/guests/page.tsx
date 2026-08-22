import Link from "next/link";
import { createGuest, importGuestsCsv } from "@/app/admin/actions";
import { CopyText } from "@/components/admin/AdminControls";
import { AdminShell, SetupNotice, TypeBadge } from "@/components/admin/AdminUi";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormPageBusy } from "@/components/ui/PageBusy";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { listGuests } from "@/lib/db";
import { getSiteOrigin } from "@/lib/invite-url";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getWhatsAppInviteUrl } from "@/lib/whatsapp";
import {
  GUEST_TYPES,
  INVITE_EVENT_LABELS,
  INVITE_EVENTS,
  RSVP_STATUSES,
  type GuestType,
  type InviteEvent,
  type RsvpStatus,
} from "@/lib/types";

type GuestsPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    rsvp?: string;
    event?: string;
    door?: string;
    imported?: string;
    import?: string;
    error?: string;
    detail?: string;
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
  const invitedTo = (INVITE_EVENTS as readonly string[]).includes(
    params.event ?? "",
  )
    ? (params.event as InviteEvent)
    : "all";
  const attendance =
    params.door === "arrived" || params.door === "waiting"
      ? params.door
      : "all";

  const [guests, allGuests] = await Promise.all([
    listGuests({
      search: params.q,
      guestType,
      invitedTo,
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
          name="event"
          defaultValue={invitedTo}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="all">All events</option>
          {INVITE_EVENTS.map((value) => (
            <option key={value} value={value}>
              {INVITE_EVENT_LABELS[value]}
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
        <SubmitButton
          pendingLabel="Filtering…"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          Filter
        </SubmitButton>
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

      {guests.length === 0 ? (
        <EmptyState
          title="No guests match"
          body="Add one below or import a CSV."
        />
      ) : (
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Party</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">RSVP</th>
                <th className="px-3 py-2 font-medium">Door</th>
                <th className="px-3 py-2 font-medium">Invite</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => {
                const inviteUrl = inviteById[guest.id];
                const whatsappUrl = getWhatsAppInviteUrl(guest, inviteUrl);
                return (
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
                    {guest.invite_name ? (
                      <p className="max-w-48 truncate text-xs text-zinc-400">
                        Invite: {guest.invite_name}
                      </p>
                    ) : null}
                    {guest.notes ? (
                      <p className="max-w-48 truncate text-xs text-zinc-400">
                        {guest.notes}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    <TypeBadge type={guest.guest_type} />
                  </td>
                  <td className="px-3 py-2">
                    {INVITE_EVENT_LABELS[guest.invited_to]}
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
                    <div className="flex flex-wrap gap-2">
                      <CopyText value={inviteUrl} label="Copy link" />
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
      </div>
      )}

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
              Name on the invite
              <input
                name="invite_name"
                placeholder="Leave blank to use full name"
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
              Invited to
              <select
                name="invited_to"
                defaultValue="both"
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              >
                {INVITE_EVENTS.map((value) => (
                  <option key={value} value={value}>
                    {INVITE_EVENT_LABELS[value]}
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
            <SubmitButton
              pendingLabel="Saving…"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
            >
              Save and show QR
            </SubmitButton>
          </div>
        </form>

        <form
          action={importGuestsCsv}
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <FormPageBusy label="Importing guests…" />
          <h2 className="font-medium">CSV import</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Columns: name, invite_name, type, invited_to, invited_count, phone.
            Type can be regular, vip, family, or vendor. Event can be both,
            ceremony, or reception.
          </p>
          <input
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="mt-3 block w-full text-sm"
          />
          <SubmitButton
            pendingLabel="Importing…"
            className="mt-3 rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            Import
          </SubmitButton>
        </form>
      </div>
    </AdminShell>
  );
}
