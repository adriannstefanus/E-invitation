import { AdminShell, SetupNotice } from "@/components/admin/AdminUi";
import { getSiteSettings, listGuests } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { GUEST_TYPES } from "@/lib/types";

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const [guests, settings] = await Promise.all([
    listGuests(),
    getSiteSettings(),
  ]);
  const arrived = guests.filter((guest) => guest.checked_in_at);
  const rsvpYes = guests.filter((guest) => guest.rsvp_status === "yes");
  const rsvpNo = guests.filter((guest) => guest.rsvp_status === "no");
  const pending = guests.filter((guest) => guest.rsvp_status === "pending");

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Invited" value={guests.length} />
        <Stat label="RSVP yes" value={rsvpYes.length} />
        <Stat label="RSVP no" value={rsvpNo.length} />
        <Stat label="Pending" value={pending.length} />
        <Stat label="Arrived" value={arrived.length} />
        <Stat label="Not yet" value={guests.length - arrived.length} />
      </div>
      <h2 className="mt-8 text-sm font-medium text-zinc-500">By type</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        {GUEST_TYPES.map((type) => (
          <Stat
            key={type}
            label={settings.guestTypes[type].label}
            value={guests.filter((guest) => guest.guest_type === type).length}
          />
        ))}
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs tracking-wide text-zinc-500 uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
