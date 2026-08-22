import { InvitationSection } from "@/components/invitation/InvitationSection";
import { stay } from "@/data/content";
import { invitationMedia } from "@/data/media";

export function StaySection() {
  return (
    <InvitationSection image={invitationMedia.stay.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Stay & travel
      </p>
      <h2 className="font-display mt-4 text-3xl">{stay.name}</h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
        {stay.detail}
      </p>
      <a
        href={stay.mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-accent px-8 text-sm tracking-wide text-white"
      >
        Open maps
      </a>
    </InvitationSection>
  );
}
