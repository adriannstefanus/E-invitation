import { InvitationSection } from "@/components/invitation/InvitationSection";
import {
  eventsForInvite,
  formatEventWhen,
  type InviteEventDetails,
} from "@/lib/site-settings";
import type { InviteEvent } from "@/lib/types";

export function EventsSection({
  invitedTo = "both",
  events,
}: {
  invitedTo?: InviteEvent;
  events: InviteEventDetails[];
}) {
  const visible = eventsForInvite(events, invitedTo);
  return (
    <InvitationSection section="events" mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Event details
      </p>
      <div className="mt-6 w-full space-y-3">
        {visible.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-line bg-card/90 px-5 py-5 text-center"
          >
            <h2 className="font-display text-3xl">{event.title}</h2>
            <p className="mt-2 text-sm text-accent">
              {formatEventWhen(event.date, event.time) ?? "Time to be announced"}
            </p>
            <p className="mt-1 text-sm text-muted">{event.place}</p>
          </article>
        ))}
      </div>
    </InvitationSection>
  );
}
