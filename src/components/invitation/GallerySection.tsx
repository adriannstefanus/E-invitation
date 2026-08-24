import { InvitationSection } from "@/components/invitation/InvitationSection";
import { PhotoSlot } from "@/components/invitation/PhotoSlot";

export function GallerySection({ photos }: { photos: string[] }) {
  return (
    <InvitationSection section="gallery">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">Gallery</p>
      <div
        className={`mt-6 grid w-full grid-cols-2 gap-2 ${
          photos.length <= 4
            ? "h-[58dvh] grid-rows-2"
            : "max-h-[58dvh] overflow-y-auto"
        }`}
      >
        {photos.map((src, index) => (
          <PhotoSlot
            key={`${src}-${index}`}
            src={src}
            alt={`Gallery photo ${index + 1}`}
            className={
              photos.length <= 4
                ? "min-h-0 h-full rounded-xl"
                : "aspect-[3/4] rounded-xl"
            }
          />
        ))}
      </div>
    </InvitationSection>
  );
}
