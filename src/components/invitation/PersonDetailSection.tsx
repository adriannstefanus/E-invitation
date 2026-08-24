import { InvitationSection } from "@/components/invitation/InvitationSection";
import { PhotoSlot } from "@/components/invitation/PhotoSlot";

type Person = {
  role: string;
  name: string;
  fullName: string;
  parents: string;
};

export function BrideDetailSection({
  person,
  photo,
}: {
  person: Person;
  photo: string;
}) {
  return (
    <PersonDetailSection person={person} photo={photo} section="bride" />
  );
}

export function GroomDetailSection({
  person,
  photo,
}: {
  person: Person;
  photo: string;
}) {
  return (
    <PersonDetailSection person={person} photo={photo} section="groom" />
  );
}

function PersonDetailSection({
  person,
  photo,
  section,
}: {
  person: Person;
  photo: string;
  section: "bride" | "groom";
}) {
  return (
    <InvitationSection section={section} mediaAlt="">
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
