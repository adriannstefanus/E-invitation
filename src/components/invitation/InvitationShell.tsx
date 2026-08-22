"use client";

import { useState } from "react";
import { ClosingSection } from "@/components/invitation/ClosingSection";
import { CommentsSection } from "@/components/invitation/CommentsSection";
import { CountdownSection } from "@/components/invitation/CountdownSection";
import { CoupleSection } from "@/components/invitation/CoupleSection";
import { Cover } from "@/components/invitation/Cover";
import { DressCodeSection } from "@/components/invitation/DressCodeSection";
import { EventsSection } from "@/components/invitation/EventsSection";
import { FaqSection } from "@/components/invitation/FaqSection";
import { GallerySection } from "@/components/invitation/GallerySection";
import { GiftSection } from "@/components/invitation/GiftSection";
import { InstagramSection } from "@/components/invitation/InstagramSection";
import { LiveStreamSection } from "@/components/invitation/LiveStreamSection";
import { LocationSection } from "@/components/invitation/LocationSection";
import { LoveStorySection } from "@/components/invitation/LoveStorySection";
import { MusicToggle } from "@/components/invitation/MusicToggle";
import { ParentsSection } from "@/components/invitation/ParentsSection";
import {
  BrideDetailSection,
  GroomDetailSection,
} from "@/components/invitation/PersonDetailSection";
import { QrSection } from "@/components/invitation/QrSection";
import { RsvpSection } from "@/components/invitation/RsvpSection";
import { RundownSection } from "@/components/invitation/RundownSection";
import { StaySection } from "@/components/invitation/StaySection";
import { VerseSection } from "@/components/invitation/VerseSection";
import { WeddingPartySection } from "@/components/invitation/WeddingPartySection";

import type { GuestbookComment, RsvpStatus } from "@/lib/types";

type InvitationShellProps = {
  guestName: string;
  guestToken?: string;
  inviteUrl?: string;
  rsvpStatus?: RsvpStatus;
  rsvpCount?: number | null;
  comments?: Pick<GuestbookComment, "id" | "name" | "message">[];
};

export function InvitationShell({
  guestName,
  guestToken,
  inviteUrl,
  rsvpStatus = "pending",
  rsvpCount,
  comments = [],
}: InvitationShellProps) {
  const [opened, setOpened] = useState(false);

  return (
    <div className="h-dvh bg-[#e8e0d4]">
      <div
        className={`invitation-snap relative mx-auto h-dvh w-full max-w-[430px] bg-background shadow-[0_0_40px_rgba(63,58,52,0.12)] ${
          opened ? "snap-y snap-mandatory overflow-y-auto" : "overflow-hidden"
        }`}
      >
        <Cover
          guestName={guestName}
          opened={opened}
          onOpen={() => setOpened(true)}
        />

        {opened ? (
          <>
            <MusicToggle />
            {inviteUrl ? (
              <QrSection guestName={guestName} inviteUrl={inviteUrl} />
            ) : null}
            <CoupleSection />
            <VerseSection />
            <ParentsSection />
            <CountdownSection />
            <BrideDetailSection />
            <GroomDetailSection />
            <LoveStorySection />
            <WeddingPartySection />
            <EventsSection />
            <LocationSection />
            <RundownSection />
            <DressCodeSection />
            <StaySection />
            <LiveStreamSection />
            <InstagramSection />
            <RsvpSection
              guestName={guestName}
              guestToken={guestToken}
              rsvpStatus={rsvpStatus}
              rsvpCount={rsvpCount}
            />
            <GallerySection />
            <GiftSection />
            <FaqSection />
            <CommentsSection
              guestName={guestName}
              guestToken={guestToken}
              comments={comments}
            />
            <ClosingSection />
          </>
        ) : null}
      </div>
    </div>
  );
}
