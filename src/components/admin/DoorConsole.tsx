"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { checkInGuest, lookupDoorGuest, undoCheckIn } from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/AdminControls";
import { DoorScanner } from "@/components/admin/DoorScanner";
import { TypeBadge } from "@/components/admin/AdminUi";
import { formatDoorCode } from "@/lib/door-code-format";
import {
  INVITE_EVENT_LABELS,
  guestInviteName,
  isWrongDoorEvent,
  type DoorGate,
  type Guest,
} from "@/lib/types";

type DoorConsoleProps = {
  guests: Guest[];
  gate: DoorGate;
};

type LookupState =
  | { status: "idle" }
  | { status: "missing"; message: string }
  | { status: "guest"; guest: Guest; method: "qr" | "manual" };

export function DoorConsole({ guests, gate }: DoorConsoleProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"waiting" | "arrived">("waiting");
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });
  const [arrivedCount, setArrivedCount] = useState(1);
  const [pending, setPending] = useState(false);
  const [code, setCode] = useState("");

  const waiting = useMemo(
    () => guests.filter((guest) => !guest.checked_in_at),
    [guests],
  );
  const arrived = useMemo(
    () =>
      guests
        .filter((guest) => guest.checked_in_at)
        .sort(
          (a, b) =>
            new Date(b.checked_in_at ?? 0).getTime() -
            new Date(a.checked_in_at ?? 0).getTime(),
        ),
    [guests],
  );
  const recent = arrived.slice(0, 10);
  const heads = arrived.reduce(
    (sum, guest) => sum + (guest.arrived_count ?? guest.invited_count),
    0,
  );
  const visible = tab === "waiting" ? waiting : arrived;

  async function showGuest(query: string, method: "qr" | "manual") {
    try {
      const result = await lookupDoorGuest(query);
      if (!result.ok) {
        setLookup({ status: "missing", message: result.error });
        return;
      }
      openGuest(result.guest, method);
    } catch {
      setLookup({
        status: "missing",
        message: "Could not look up that guest. Try the door code.",
      });
    }
  }

  function openGuest(guest: Guest, method: "qr" | "manual") {
    const expected =
      guest.rsvp_count && guest.rsvp_count > 0
        ? guest.rsvp_count
        : guest.invited_count;
    setArrivedCount(Math.min(guest.invited_count, Math.max(1, expected)));
    setLookup({ status: "guest", guest, method });
  }

  async function confirmCheckIn() {
    if (lookup.status !== "guest" || lookup.guest.checked_in_at) {
      return;
    }
    setPending(true);
    const formData = new FormData();
    formData.set("id", lookup.guest.id);
    formData.set("method", lookup.method);
    formData.set("arrived_count", String(arrivedCount));
    const result = await checkInGuest(formData);
    setPending(false);
    if (!result.ok) {
      setLookup({ status: "missing", message: result.error });
      return;
    }
    router.refresh();
    setLookup({ status: "idle" });
  }

  return (
    <div className="space-y-4">
      <form className="flex flex-wrap gap-2" action="/admin/door">
        <label className="flex min-h-12 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 text-base">
          This tablet
          <select name="gate" defaultValue={gate} className="bg-transparent outline-none">
            <option value="both">Both events</option>
            <option value="ceremony">Ceremony door</option>
            <option value="reception">Reception door</option>
          </select>
        </label>
        <button className="min-h-12 rounded-xl bg-zinc-900 px-4 text-base text-white">
          Set
        </button>
      </form>

      <div className="grid grid-cols-3 gap-2">
        <CountCard label="Waiting" value={waiting.length} />
        <CountCard label="Arrived" value={arrived.length} />
        <CountCard label="Heads in" value={heads} />
      </div>

      <DoorScanner onScan={(text) => void showGuest(text, "qr")} />

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          showGuest(code, "manual");
        }}
      >
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          inputMode="numeric"
          placeholder="6-digit door code"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-zinc-300 px-3 text-lg tracking-widest"
        />
        <button className="min-h-12 rounded-xl bg-zinc-900 px-4 text-base text-white">
          Find
        </button>
      </form>

      <form className="flex flex-wrap gap-2" action="/admin/door">
        <input type="hidden" name="gate" value={gate} />
        <input
          name="q"
          placeholder="Search name or code"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-zinc-300 px-3 text-base"
        />
        <button className="min-h-12 rounded-xl bg-zinc-900 px-4 text-base text-white">
          Search
        </button>
      </form>

      {lookup.status !== "idle" ? (
        <ResultCard
          lookup={lookup}
          gate={gate}
          arrivedCount={arrivedCount}
          pending={pending}
          onCount={setArrivedCount}
          onClose={() => setLookup({ status: "idle" })}
          onCheckIn={confirmCheckIn}
        />
      ) : null}

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-medium text-zinc-500 uppercase">Last in</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-base text-zinc-500">No check-ins yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-zinc-100">
            {recent.map((guest) => (
              <li key={guest.id} className="flex justify-between gap-3 py-2 text-base">
                <span className="font-medium">{guest.name}</span>
                <span className="text-zinc-500">
                  {formatWhen(guest.checked_in_at)} · {guest.arrived_count ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex gap-2">
        <TabButton active={tab === "waiting"} onClick={() => setTab("waiting")}>
          Waiting ({waiting.length})
        </TabButton>
        <TabButton active={tab === "arrived"} onClick={() => setTab("arrived")}>
          Arrived ({arrived.length})
        </TabButton>
      </div>

      <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {visible.length === 0 ? (
          <li className="px-4 py-8 text-center text-base text-zinc-500">
            No guests in this list.
          </li>
        ) : (
          visible.map((guest) => (
            <li key={guest.id} className="flex flex-wrap items-center gap-3 px-4 py-4">
              <button
                type="button"
                onClick={() => openGuest(guest, "manual")}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-lg font-medium">{guest.name}</p>
                <p className="text-sm text-zinc-500">
                  <TypeBadge type={guest.guest_type} />{" "}
                  {formatDoorCode(guest.door_code)} ·{" "}
                  {INVITE_EVENT_LABELS[guest.invited_to]}
                </p>
              </button>
              {guest.checked_in_at ? (
                <form action={undoCheckIn}>
                  <input type="hidden" name="id" value={guest.id} />
                  <ConfirmSubmit
                    label="Undo"
                    confirmLabel={`Undo check-in for ${guest.name}?`}
                    className="min-h-12 px-3 text-base text-zinc-500"
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => openGuest(guest, "manual")}
                  className="min-h-12 rounded-xl bg-zinc-900 px-4 text-base text-white"
                >
                  Check in
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ResultCard({
  lookup,
  gate,
  arrivedCount,
  pending,
  onCount,
  onClose,
  onCheckIn,
}: {
  lookup: Exclude<LookupState, { status: "idle" }>;
  gate: DoorGate;
  arrivedCount: number;
  pending: boolean;
  onCount: (value: number) => void;
  onClose: () => void;
  onCheckIn: () => void;
}) {
  if (lookup.status === "missing") {
    return (
      <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5">
        <p className="text-xl font-semibold text-red-800">Not found</p>
        <p className="mt-2 text-base text-red-700">{lookup.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 min-h-12 text-base text-red-800 underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  const { guest } = lookup;
  const already = Boolean(guest.checked_in_at);
  const wrongEvent = isWrongDoorEvent(gate, guest.invited_to);
  const rsvpFlag = guest.rsvp_status !== "yes";
  const tone = already
    ? "border-amber-400 bg-amber-50"
    : guest.guest_type === "vip"
      ? "border-amber-400 bg-amber-50"
      : guest.guest_type === "family"
        ? "border-stone-400 bg-stone-100"
        : guest.guest_type === "vendor"
          ? "border-sky-400 bg-sky-50"
          : "border-zinc-300 bg-white";

  return (
    <div className={`rounded-2xl border-2 p-5 ${tone}`}>
      <p className="text-sm tracking-wide text-zinc-500 uppercase">
        {already ? "Already arrived" : guest.guest_type}
      </p>
      <p className="mt-1 text-3xl font-semibold">{guest.name}</p>
      <p className="mt-1 text-lg text-zinc-700">{guestInviteName(guest)}</p>
      <p className="mt-3 text-base text-zinc-600">
        Party of {guest.invited_count} · {INVITE_EVENT_LABELS[guest.invited_to]} ·
        code {formatDoorCode(guest.door_code)}
      </p>
      {guest.notes ? (
        <p className="mt-2 text-base text-zinc-700">{guest.notes}</p>
      ) : null}
      {wrongEvent ? (
        <p className="mt-3 rounded-xl bg-red-100 px-3 py-2 text-base text-red-800">
          Wrong event for this door. Guest is invited to{" "}
          {INVITE_EVENT_LABELS[guest.invited_to].toLowerCase()}.
        </p>
      ) : null}
      {rsvpFlag ? (
        <p className="mt-3 rounded-xl bg-orange-100 px-3 py-2 text-base text-orange-900">
          RSVP is {guest.rsvp_status}. Check-in is still allowed.
        </p>
      ) : null}
      {already ? (
        <p className="mt-3 text-base text-amber-900">
          Checked in {formatWhen(guest.checked_in_at)} ·{" "}
          {guest.arrived_count ?? "—"} people
        </p>
      ) : (
        <label className="mt-4 flex items-center justify-between text-lg">
          How many arrived?
          <input
            type="number"
            min={1}
            max={guest.invited_count}
            value={arrivedCount}
            onChange={(event) =>
              onCount(
                Math.min(
                  guest.invited_count,
                  Math.max(1, Number(event.target.value) || 1),
                ),
              )
            }
            className="w-20 rounded-xl border border-zinc-300 px-2 py-2 text-right"
          />
        </label>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {!already ? (
          <button
            type="button"
            disabled={pending}
            onClick={onCheckIn}
            className="min-h-12 flex-1 rounded-xl bg-zinc-900 px-4 text-lg text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : "Confirm check-in"}
          </button>
        ) : (
          <form action={undoCheckIn}>
            <input type="hidden" name="id" value={guest.id} />
            <ConfirmSubmit
              label="Undo check-in"
              confirmLabel={`Undo check-in for ${guest.name}?`}
              className="min-h-12 rounded-xl border border-zinc-400 px-4 text-lg"
            />
          </form>
        )}
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 rounded-xl px-4 text-lg text-zinc-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3 text-center">
      <p className="text-xs tracking-wide text-zinc-500 uppercase">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 flex-1 rounded-xl text-base ${
        active ? "bg-zinc-900 text-white" : "border border-zinc-300 bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function formatWhen(value: string | null) {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
