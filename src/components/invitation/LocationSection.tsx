import { InvitationSection } from "@/components/invitation/InvitationSection";
import { events } from "@/data/content";
import { invitationMedia } from "@/data/media";

export function LocationSection() {
  return (
    <InvitationSection image={invitationMedia.location.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">Location</p>
      <div className="mt-6 w-full space-y-3">
        {events.map((event) => (
          <article
            key={event.title}
            className="rounded-2xl border border-line bg-card/90 px-4 py-4"
          >
            <h2 className="font-display text-2xl">{event.title}</h2>
            <p className="mt-1 text-sm text-muted">{event.place}</p>
            <div className="mt-3 flex justify-center gap-2">
              <a
                href={event.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center rounded-full bg-accent px-4 text-xs tracking-wide text-white"
              >
                Maps
              </a>
              <a
                href={event.wazeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center rounded-full border border-line bg-card px-4 text-xs tracking-wide"
              >
                Waze
              </a>
            </div>
          </article>
        ))}
      </div>
    </InvitationSection>
  );
}
