"use client";

import type { ReactNode } from "react";
import { MediaBackdrop } from "@/components/invitation/MediaBackdrop";

type InvitationSectionProps = {
  children: ReactNode;
  image?: string;
  video?: string;
  mediaAlt?: string;
  priority?: boolean;
};

export function InvitationSection({
  children,
  image,
  video,
  mediaAlt = "",
  priority = false,
}: InvitationSectionProps) {
  return (
    <section className="relative flex h-dvh w-full shrink-0 snap-start snap-always flex-col items-center overflow-hidden">
      <MediaBackdrop
        image={image}
        video={video}
        alt={mediaAlt}
        priority={priority}
      />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8 text-center">
        {children}
      </div>
    </section>
  );
}
