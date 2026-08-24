"use client";

import type { ReactNode } from "react";
import { MediaBackdrop } from "@/components/invitation/MediaBackdrop";
import { useInviteVisuals } from "@/components/invitation/InviteVisualsContext";
import type { InviteSectionId } from "@/lib/site-settings";

type InvitationSectionProps = {
  children: ReactNode;
  section?: InviteSectionId;
  image?: string;
  video?: string;
  mediaAlt?: string;
  priority?: boolean;
};

export function InvitationSection({
  children,
  section,
  image,
  video,
  mediaAlt = "",
  priority = false,
}: InvitationSectionProps) {
  const visuals = useInviteVisuals();
  const backdrop = section ? visuals?.backdrops[section] : undefined;

  return (
    <section className="relative flex h-dvh w-full shrink-0 snap-start snap-always flex-col items-center overflow-hidden">
      <MediaBackdrop
        image={image ?? backdrop?.image}
        video={video ?? backdrop?.video}
        alt={mediaAlt}
        priority={priority}
      />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8 text-center">
        {children}
      </div>
    </section>
  );
}
