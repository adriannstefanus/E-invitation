import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";
import type { InviteCopy } from "@/lib/site-settings";

export function LoveStorySection({
  beats,
}: {
  beats: InviteCopy["loveStory"];
}) {
  return (
    <InvitationSection image={invitationMedia.story.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">Our story</p>
      <div className="mt-6 w-full space-y-3">
        {beats.map((beat, index) => (
          <article
            key={`${beat.year}-${index}`}
            className="rounded-2xl border border-line bg-card/90 px-4 py-3 text-left"
          >
            <p className="text-xs tracking-[0.2em] text-accent uppercase">
              {beat.year}
            </p>
            <h3 className="font-display mt-1 text-2xl">{beat.title}</h3>
            <p className="mt-1 text-sm text-muted">{beat.text}</p>
          </article>
        ))}
      </div>
    </InvitationSection>
  );
}
