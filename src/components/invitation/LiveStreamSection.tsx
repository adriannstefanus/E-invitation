import { InvitationSection } from "@/components/invitation/InvitationSection";
import { liveStream } from "@/data/content";
import { invitationMedia } from "@/data/media";

export function LiveStreamSection() {
  return (
    <InvitationSection
      image={invitationMedia.liveStream.background}
      mediaAlt=""
    >
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Live stream
      </p>
      <h2 className="font-display mt-4 text-3xl">{liveStream.label}</h2>
      <p className="mt-3 max-w-xs text-sm text-muted">
        Join online if you cannot be there in person.
      </p>
      <a
        href={liveStream.url}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-accent px-8 text-sm tracking-wide text-white"
      >
        Open stream
      </a>
    </InvitationSection>
  );
}
