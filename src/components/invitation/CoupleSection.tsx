import { InvitationSection } from "@/components/invitation/InvitationSection";
import { PhotoSlot } from "@/components/invitation/PhotoSlot";

export function CoupleSection({
  brideName,
  groomName,
  bridePhoto,
  groomPhoto,
}: {
  brideName: string;
  groomName: string;
  bridePhoto: string;
  groomPhoto: string;
}) {
  return (
    <InvitationSection section="couple" mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        The couple
      </p>
      <div className="mt-8 grid w-full grid-cols-2 gap-5">
        <PersonSlot src={bridePhoto} label={brideName} />
        <PersonSlot src={groomPhoto} label={groomName} />
      </div>
    </InvitationSection>
  );
}

function PersonSlot({ src, label }: { src: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <PhotoSlot
        src={src}
        alt={label}
        className="aspect-[3/4] w-full rounded-t-full"
      />
      <h2 className="font-display text-2xl">{label}</h2>
    </div>
  );
}
