import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";
import type { InviteCopy } from "@/lib/site-settings";

export function ParentsSection({
  families,
}: {
  families: InviteCopy["families"];
}) {
  return (
    <InvitationSection image={invitationMedia.parents.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        With their families
      </p>
      <h2 className="font-display mt-3 text-3xl">Turut mengundang</h2>
      <div className="mt-8 w-full space-y-4">
        <FamilyCard family={families.groom} />
        <FamilyCard family={families.bride} />
      </div>
    </InvitationSection>
  );
}

function FamilyCard({
  family,
}: {
  family: InviteCopy["families"]["bride"];
}) {
  return (
    <article className="rounded-2xl border border-line bg-card/90 px-5 py-5">
      <p className="text-xs tracking-[0.2em] text-muted uppercase">
        {family.title}
      </p>
      <p className="font-display mt-2 text-2xl">{family.names}</p>
    </article>
  );
}
