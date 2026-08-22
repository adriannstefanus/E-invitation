"use client";

import { FormEvent, useState } from "react";
import { submitRsvp } from "@/app/invite/actions";
import { InvitationSection } from "@/components/invitation/InvitationSection";
import { useInviteBusy } from "@/components/invitation/InviteBusy";
import { useToast } from "@/components/ui/Toast";
import { invitationMedia } from "@/data/media";
import type { RsvpStatus } from "@/lib/types";

type RsvpSectionProps = {
  guestName: string;
  guestToken?: string;
  rsvpStatus?: RsvpStatus;
  rsvpCount?: number | null;
};

export function RsvpSection({
  guestName,
  guestToken,
  rsvpStatus = "pending",
  rsvpCount,
}: RsvpSectionProps) {
  const defaultName = guestName === "Guest" ? "" : guestName;
  const [name, setName] = useState(defaultName);
  const [attending, setAttending] = useState<"yes" | "no">(
    rsvpStatus === "no" ? "no" : "yes",
  );
  const [guests, setGuests] = useState(
    rsvpCount && rsvpCount > 0 ? rsvpCount : 1,
  );
  const [saved, setSaved] = useState(rsvpStatus !== "pending");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const setBusy = useInviteBusy();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    setBusy(true);
    try {
      const result = await submitRsvp(new FormData(event.currentTarget));
      if (!result.ok) {
        const message = result.error ?? "Could not send RSVP.";
        setError(message);
        toast({ tone: "error", message });
        return;
      }
      setSaved(true);
      toast("RSVP saved.");
    } finally {
      setPending(false);
      setBusy(false);
    }
  }

  return (
    <InvitationSection image={invitationMedia.rsvp.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">RSVP</p>
      <h2 className="font-display mt-3 text-3xl">Will you join us?</h2>
      {!guestToken ? (
        <p className="mt-5 max-w-xs text-sm text-muted">
          Open your personal invite link to send an RSVP.
        </p>
      ) : (
        <form
          className="mt-5 w-full space-y-3 text-left"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="token" value={guestToken} />
          <input type="hidden" name="attending" value={attending} />
          <label className="block">
            <span className="sr-only">Name</span>
            <input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              readOnly
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
                name="guests"
                min={1}
                max={10}
                value={guests}
                onChange={(event) => setGuests(Number(event.target.value) || 1)}
                className="w-16 bg-transparent text-right outline-none"
              />
            </label>
          ) : (
            <input type="hidden" name="guests" value={0} />
          )}
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full rounded-full bg-accent text-sm tracking-wide text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : saved ? "Update RSVP" : "Send RSVP"}
          </button>
        </form>
      )}
      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}
      {saved && guestToken ? (
        <p className="mt-3 text-sm text-muted">
          Saved: {attending === "yes" ? "attending" : "cannot attend"}
        </p>
      ) : null}
    </InvitationSection>
  );
}
