"use client";

import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";
import { fillCoverGreeting, formatWeddingWhen } from "@/lib/site-settings";

type CoverProps = {
  guestName: string;
  brideName: string;
  groomName: string;
  weddingAt?: string;
  greeting: string;
  opened: boolean;
  onOpen: () => void;
};

export function Cover({
  guestName,
  brideName,
  groomName,
  weddingAt,
  greeting,
  opened,
  onOpen,
}: CoverProps) {
  const when = weddingAt ? formatWeddingWhen(weddingAt) : null;
  const line = fillCoverGreeting(greeting, guestName);
  return (
    <InvitationSection
      image={invitationMedia.cover.image}
      video={invitationMedia.cover.video}
      mediaAlt=""
      priority
    >
      <p className="text-xs tracking-[0.35em] text-muted uppercase">
        The wedding of
      </p>
      <h1 className="font-display mt-6 text-5xl leading-tight text-foreground">
        {brideName}
        <span className="mt-2 block text-2xl font-normal italic text-accent">
          &amp;
        </span>
        {groomName}
      </h1>
      <p className="mt-10 max-w-xs text-sm leading-relaxed text-muted">
        Dear {guestName},
        <br />
        {line}
      </p>
      {when ? (
        <p className="mt-4 text-xs tracking-wide text-muted">{when}</p>
      ) : null}
      {opened ? (
        <p className="mt-12 animate-bounce text-xs tracking-[0.3em] text-muted uppercase">
          Swipe up
        </p>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="mt-12 min-h-12 rounded-full bg-accent px-8 text-sm tracking-wide text-white transition-opacity hover:opacity-90"
        >
          Open Invitation
        </button>
      )}
    </InvitationSection>
  );
}
