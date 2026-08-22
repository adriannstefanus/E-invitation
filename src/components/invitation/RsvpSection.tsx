"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";

type RsvpRecord = {
  name: string;
  attending: "yes" | "no";
  guests: number;
};

const STORAGE_KEY = "invitation-rsvp";
const RSVP_EVENT = "invitation-rsvp";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(RSVP_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(RSVP_EVENT, onChange);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

function getServerSnapshot() {
  return "";
}

function parseRsvp(raw: string): RsvpRecord | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as RsvpRecord;
  } catch {
    return null;
  }
}

type RsvpSectionProps = {
  guestName: string;
};

export function RsvpSection({ guestName }: RsvpSectionProps) {
  const saved = parseRsvp(
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot),
  );
  const defaultName = guestName === "Guest" ? "" : guestName;
  const [name, setName] = useState(saved?.name ?? defaultName);
  const [attending, setAttending] = useState<"yes" | "no">(
    saved?.attending ?? "yes",
  );
  const [guests, setGuests] = useState(saved?.guests ?? 1);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      return;
    }
    const record: RsvpRecord = { name: nextName, attending, guests };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new Event(RSVP_EVENT));
  }

  return (
    <InvitationSection image={invitationMedia.rsvp.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">RSVP</p>
      <h2 className="font-display mt-3 text-3xl">Will you join us?</h2>
      <form className="mt-5 w-full space-y-3 text-left" onSubmit={handleSubmit}>
        <label className="block">
          <span className="sr-only">Name</span>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="min-h-11 w-full rounded-xl border border-line bg-card/90 px-3 text-sm outline-none"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAttending("yes")}
            className={`min-h-11 rounded-xl border text-sm ${
              attending === "yes"
                ? "border-accent bg-accent text-white"
                : "border-line bg-card/90"
            }`}
          >
            Attend
          </button>
          <button
            type="button"
            onClick={() => setAttending("no")}
            className={`min-h-11 rounded-xl border text-sm ${
              attending === "no"
                ? "border-accent bg-accent text-white"
                : "border-line bg-card/90"
            }`}
          >
            Cannot
          </button>
        </div>
        {attending === "yes" ? (
          <label className="flex items-center justify-between rounded-xl border border-line bg-card/90 px-3 py-2 text-sm">
            Guests
            <input
              type="number"
              min={1}
              max={10}
              value={guests}
              onChange={(event) => setGuests(Number(event.target.value) || 1)}
              className="w-16 bg-transparent text-right outline-none"
            />
          </label>
        ) : null}
        <button
          type="submit"
          className="min-h-11 w-full rounded-full bg-accent text-sm tracking-wide text-white"
        >
          {saved ? "Update RSVP" : "Send RSVP"}
        </button>
      </form>
      {saved ? (
        <p className="mt-3 text-sm text-muted">
          Saved: {saved.attending === "yes" ? "attending" : "cannot attend"}
        </p>
      ) : null}
    </InvitationSection>
  );
}
