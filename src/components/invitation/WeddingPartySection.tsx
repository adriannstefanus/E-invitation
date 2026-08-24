import { InvitationSection } from "@/components/invitation/InvitationSection";
import { PhotoSlot } from "@/components/invitation/PhotoSlot";
import type { InviteCopy } from "@/lib/site-settings";

export function WeddingPartySection({
  party,
  portraits,
}: {
  party: InviteCopy["weddingParty"];
  portraits: string[];
}) {
  return (
    <InvitationSection section="weddingParty" mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Wedding party
      </p>
      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        {party.map((person, index) => {
          const src = portraits[index];
          return (
            <article key={`${person.role}-${index}`} className="text-center">
              {src ? (
                <PhotoSlot
                  src={src}
                  alt={person.name}
                  className="aspect-square w-full rounded-full"
                />
              ) : (
                <div className="aspect-square w-full rounded-full border border-line bg-card" />
              )}
              <h3 className="font-display mt-2 text-lg">{person.name}</h3>
              <p className="text-xs text-muted">{person.role}</p>
            </article>
          );
        })}
      </div>
    </InvitationSection>
  );
}
