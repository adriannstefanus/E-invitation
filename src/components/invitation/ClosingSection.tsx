import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";

export function ClosingSection({
  brideName,
  groomName,
}: {
  brideName: string;
  groomName: string;
}) {
  return (
    <InvitationSection
      image={invitationMedia.closing.image}
      video={invitationMedia.closing.video}
      mediaAlt=""
    >
      <h2 className="font-display text-4xl">Thank you</h2>
      <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
        {brideName} and {groomName} look forward to celebrating with you.
      </p>
    </InvitationSection>
  );
}
