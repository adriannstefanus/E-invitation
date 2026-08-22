import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";
import type { SiteSettings } from "@/lib/site-settings";

export function DressCodeSection({
  dressCode,
}: {
  dressCode: SiteSettings["dressCode"];
}) {
  return (
    <InvitationSection image={invitationMedia.dressCode.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Dress code
      </p>
      <h2 className="font-display mt-3 text-3xl">{dressCode.label}</h2>
      <p className="mt-2 text-sm text-muted">{dressCode.note}</p>
      <div className="mt-8 flex justify-center gap-4">
        {dressCode.colors.map((color) => (
          <div key={`${color.name}-${color.hex}`} className="flex flex-col items-center gap-2">
            <span
              className="h-12 w-12 rounded-full border border-line"
              style={{ backgroundColor: color.hex }}
              aria-hidden
            />
            <span className="text-[10px] tracking-wide text-muted uppercase">
              {color.name}
            </span>
          </div>
        ))}
      </div>
    </InvitationSection>
  );
}
