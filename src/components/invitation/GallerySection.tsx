import { InvitationSection } from "@/components/invitation/InvitationSection";
import { PhotoSlot } from "@/components/invitation/PhotoSlot";
import { invitationMedia } from "@/data/media";

export function GallerySection() {
  return (
    <InvitationSection>
      <p className="text-xs tracking-[0.3em] text-muted uppercase">Gallery</p>
      <div className="mt-6 grid h-[58dvh] w-full grid-cols-2 grid-rows-2 gap-2">
        {invitationMedia.gallery.map((src, index) => (
          <PhotoSlot
            key={src}
            src={src}
            alt={`Gallery photo ${index + 1}`}
            className="min-h-0 h-full rounded-xl"
          />
        ))}
      </div>
    </InvitationSection>
  );
}
