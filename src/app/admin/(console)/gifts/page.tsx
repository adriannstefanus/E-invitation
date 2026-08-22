import { createGift, deleteGift } from "@/app/admin/actions";
import { AdminShell, SetupNotice } from "@/components/admin/AdminUi";
import { listGifts, listGuests } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { GIFT_KINDS } from "@/lib/types";

export default async function GiftsAdminPage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const [gifts, guests] = await Promise.all([listGifts(), listGuests()]);

  return (
    <AdminShell title="Gifts">
      <form
        action={createGift}
        className="mb-6 rounded-xl border border-zinc-200 bg-white p-4"
      >
        <h2 className="font-medium">Log a gift</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input
            name="guest_name"
            required
            placeholder="Guest name"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <select
            name="guest_id"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">Not linked</option>
            {guests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.name}
              </option>
            ))}
          </select>
          <select
            name="kind"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {GIFT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount (angpao)"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <textarea
            name="note"
            placeholder="Note"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm md:col-span-2"
          />
        </div>
        <button className="mt-3 rounded-md bg-zinc-900 px-3 py-2 text-sm text-white">
          Save gift
        </button>
      </form>

      <ul className="space-y-3">
        {gifts.length === 0 ? (
          <li className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
            No gifts logged.
          </li>
        ) : (
          gifts.map((gift) => (
            <li
              key={gift.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div>
                <p className="font-medium">
                  {gift.guest_name} · {gift.kind}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {gift.amount ? `Amount ${gift.amount}` : "No amount"}
                  {gift.note ? ` · ${gift.note}` : ""}
                </p>
              </div>
              <form action={deleteGift}>
                <input type="hidden" name="id" value={gift.id} />
                <button className="text-sm text-red-600">Delete</button>
              </form>
            </li>
          ))
        )}
      </ul>
    </AdminShell>
  );
}
