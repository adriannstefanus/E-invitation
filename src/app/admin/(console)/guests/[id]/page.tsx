import { notFound } from "next/navigation";
import {
  checkInGuestForm,
  deleteGuest,
  regenerateGuestToken,
  setGuestRsvp,
  undoCheckIn,
  updateGuest,
} from "@/app/admin/actions";
import { BackLink } from "@/components/admin/BackLink";
import { ConfirmSubmit, CopyText } from "@/components/admin/AdminControls";
import { AdminShell, SetupNotice, TypeBadge } from "@/components/admin/AdminUi";
import { QrImage } from "@/components/admin/QrImage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { formatDoorCode } from "@/lib/door-code-format";
import { getGuestById } from "@/lib/db";
import { getInviteUrl } from "@/lib/invite-url";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getWhatsAppInviteUrl } from "@/lib/whatsapp";
import {
  GUEST_TYPES,
  INVITE_EVENT_LABELS,
  INVITE_EVENTS,
  RSVP_STATUSES,
} from "@/lib/types";

type GuestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GuestDetailPage({
  params,
}: GuestDetailPageProps) {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const { id } = await params;
  const guest = await getGuestById(id);
  if (!guest) {
    notFound();
  }

  const inviteUrl = await getInviteUrl(guest.token);
  const whatsappUrl = getWhatsAppInviteUrl(guest, inviteUrl);
  const rsvpWhen = formatWhen(guest.rsvp_at);
  const arrivedWhen = formatWhen(guest.checked_in_at);

  return (
    <AdminShell title={guest.name}>
      <BackLink href="/admin/guests">Back to guests</BackLink>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TypeBadge type={guest.guest_type} />
        <span className="text-sm text-zinc-500">
          Party of {guest.invited_count} · {INVITE_EVENT_LABELS[guest.invited_to]}{" "}
          · RSVP {guest.rsvp_status}
          {guest.rsvp_count != null ? ` (${guest.rsvp_count})` : ""} ·{" "}
          {guest.checked_in_at
            ? `Arrived${guest.check_in_method ? ` via ${guest.check_in_method}` : ""}`
            : "Not checked in"}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form
          action={updateGuest}
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <h2 className="font-medium">Details</h2>
          <input type="hidden" name="id" value={guest.id} />
          <div className="mt-3 space-y-3">
            <label className="block text-sm">
              Full name
              <input
                name="name"
                defaultValue={guest.name}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Name on the invite
              <input
                name="invite_name"
                defaultValue={guest.invite_name ?? ""}
                placeholder="Leave blank to use full name"
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Type
              <select
                name="guest_type"
                defaultValue={guest.guest_type}
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
                defaultValue={guest.invited_to}
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
              Party size
              <input
                name="invited_count"
                type="number"
                min={1}
                defaultValue={guest.invited_count}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Phone
              <input
                name="phone"
                defaultValue={guest.phone ?? ""}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Notes
              <textarea
                name="notes"
                defaultValue={guest.notes ?? ""}
                rows={3}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
            <SubmitButton
              pendingLabel="Saving…"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
            >
              Save changes
            </SubmitButton>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="font-medium">Invite / QR</h2>
            <p className="mt-2 text-lg font-medium tracking-widest">
              Door code {formatDoorCode(guest.door_code)}
            </p>
            <p className="mt-2 break-all text-sm text-zinc-600">{inviteUrl}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyText
                value={guest.door_code ?? ""}
                label="Copy code"
              />
              <CopyText value={inviteUrl} label="Copy link" />
              {whatsappUrl ? (
                <>
                  <CopyText value={whatsappUrl} label="Copy WhatsApp" />
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                  >
                    WhatsApp guest
                  </a>
                </>
              ) : (
                <span className="px-1 py-1.5 text-sm text-zinc-400">
                  Add a phone to send WhatsApp
                </span>
              )}
              <a
                href={inviteUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
              >
                Open invite
              </a>
            </div>
            <div className="mt-4">
              <QrImage
                value={inviteUrl}
                downloadName={`${guest.name.replaceAll(" ", "-").toLowerCase()}-qr.png`}
              />
            </div>
            <form action={regenerateGuestToken} className="mt-4">
              <input type="hidden" name="id" value={guest.id} />
              <ConfirmSubmit
                label="Rotate link"
                confirmLabel="This invalidates the current QR. Continue?"
                className="text-sm text-zinc-500 hover:text-zinc-900"
              />
            </form>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="font-medium">RSVP</h2>
            <p className="mt-2 text-sm text-zinc-600">
              {guest.rsvp_status}
              {guest.rsvp_count != null ? ` · ${guest.rsvp_count} coming` : ""}
              {rsvpWhen ? ` · ${rsvpWhen}` : " · no reply yet"}
            </p>
            <form action={setGuestRsvp} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={guest.id} />
              <input type="hidden" name="token" value={guest.token} />
              <label className="block text-sm">
                Status
                <select
                  name="rsvp_status"
                  defaultValue={guest.rsvp_status}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                >
                  {RSVP_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Coming (if yes)
                <input
                  name="rsvp_count"
                  type="number"
                  min={1}
                  defaultValue={guest.rsvp_count ?? guest.invited_count}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                />
              </label>
              <SubmitButton
                pendingLabel="Saving…"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white"
              >
                Save RSVP
              </SubmitButton>
            </form>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="font-medium">Door</h2>
            <p className="mt-2 text-sm text-zinc-600">
              {guest.checked_in_at
                ? `Arrived${guest.arrived_count ? ` · ${guest.arrived_count}` : ""}${guest.check_in_method ? ` · ${guest.check_in_method}` : ""}${arrivedWhen ? ` · ${arrivedWhen}` : ""}`
                : "Not checked in"}
            </p>
            {guest.checked_in_at ? (
              <form action={undoCheckIn} className="mt-3">
                <input type="hidden" name="id" value={guest.id} />
                <input
                  type="hidden"
                  name="next"
                  value={`/admin/guests/${guest.id}?undone=1`}
                />
                <SubmitButton
                  pendingLabel="Undoing…"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
                >
                  Undo check-in
                </SubmitButton>
              </form>
            ) : (
              <form action={checkInGuestForm} className="mt-3">
                <input type="hidden" name="token" value={guest.token} />
                <input type="hidden" name="method" value="manual" />
                <input
                  type="hidden"
                  name="next"
                  value={`/admin/guests/${guest.id}?arrived=1`}
                />
                <SubmitButton
                  pendingLabel="Saving…"
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white"
                >
                  Mark arrived
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </div>

      <form action={deleteGuest} className="mt-8">
        <input type="hidden" name="id" value={guest.id} />
        <ConfirmSubmit
          label="Delete guest"
          confirmLabel={`Delete ${guest.name}? Their invite link will stop working.`}
          className="text-sm text-red-600 hover:underline"
        />
      </form>
    </AdminShell>
  );
}

function formatWhen(value: string | null) {
  if (!value) {
    return null;
  }
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
