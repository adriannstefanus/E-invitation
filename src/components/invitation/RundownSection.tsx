import { InvitationSection } from "@/components/invitation/InvitationSection";
import { rundown } from "@/data/content";
import { invitationMedia } from "@/data/media";

export function RundownSection() {
  return (
    <InvitationSection image={invitationMedia.rundown.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Day rundown
      </p>
      <ol className="mt-6 w-full space-y-2">
        {rundown.map((item) => (
          <li
            key={`${item.time}-${item.title}`}
            className="flex items-baseline justify-between gap-4 rounded-2xl border border-line bg-card/90 px-4 py-3 text-left"
          >
            <span className="text-sm text-accent">{item.time}</span>
            <span className="font-display text-xl">{item.title}</span>
          </li>
        ))}
      </ol>
    </InvitationSection>
  );
}
