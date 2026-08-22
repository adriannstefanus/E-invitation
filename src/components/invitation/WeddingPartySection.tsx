import { InvitationSection } from "@/components/invitation/InvitationSection";
import { PhotoSlot } from "@/components/invitation/PhotoSlot";
import { weddingParty } from "@/data/content";
import { invitationMedia } from "@/data/media";

export function WeddingPartySection() {
  return (
    <InvitationSection image={invitationMedia.party.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Wedding party
      </p>
      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        {weddingParty.map((person, index) => (
          <article key={`${person.role}-${index}`} className="text-center">
            <PhotoSlot
              src={invitationMedia.party.portraits[index]!}
              alt={person.name}
              className="aspect-square w-full rounded-full"
            />
            <h3 className="font-display mt-2 text-lg">{person.name}</h3>
            <p className="text-xs text-muted">{person.role}</p>
          </article>
        ))}
      </div>
    </InvitationSection>
  );
}
