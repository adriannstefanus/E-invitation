import { InvitationSection } from "@/components/invitation/InvitationSection";
import { PhotoSlot } from "@/components/invitation/PhotoSlot";
import { invitationMedia } from "@/data/media";

type Person = {
  role: string;
  name: string;
  fullName: string;
  parents: string;
};

export function BrideDetailSection({ person }: { person: Person }) {
  return (
    <PersonDetailSection
      person={person}
      photo={invitationMedia.couple.bride}
      background={invitationMedia.bride.background}
    />
  );
}

export function GroomDetailSection({ person }: { person: Person }) {
  return (
    <PersonDetailSection
      person={person}
      photo={invitationMedia.couple.groom}
      background={invitationMedia.groom.background}
    />
  );
}

function PersonDetailSection({
  person,
  photo,
  background,
}: {
  person: Person;
  photo: string;
  background: string;
}) {
  return (
    <InvitationSection image={background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        {person.role}
      </p>
      <PhotoSlot
        src={photo}
        alt={person.name}
        className="mt-6 aspect-[3/4] w-[58%] max-h-[40dvh] rounded-t-full"
      />
      <h2 className="font-display mt-5 text-4xl">{person.name}</h2>
      <p className="mt-2 text-sm text-foreground">{person.fullName}</p>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
        {person.parents}
      </p>
    </InvitationSection>
  );
}
