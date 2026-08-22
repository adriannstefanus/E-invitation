import { listGuests } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | null) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured.", { status: 503 });
  }

  const guests = await listGuests();
  const header = [
    "name",
    "type",
    "invited_count",
    "phone",
    "notes",
    "rsvp_status",
    "rsvp_count",
    "checked_in",
    "token",
  ];
  const lines = [
    header.join(","),
    ...guests.map((guest) =>
      [
        csvCell(guest.name),
        csvCell(guest.guest_type),
        csvCell(guest.invited_count),
        csvCell(guest.phone),
        csvCell(guest.notes),
        csvCell(guest.rsvp_status),
        csvCell(guest.rsvp_count),
        csvCell(guest.checked_in_at ? "yes" : "no"),
        csvCell(guest.token),
      ].join(","),
    ),
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="guests.csv"',
    },
  });
}
