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
import { InviteBusyProvider } from "@/components/invitation/InviteBusy";
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
import type { GuestbookComment, InviteEvent, RsvpStatus } from "@/lib/types";
import type { SiteSettings } from "@/lib/site-settings";

type InvitationShellProps = {
  guestName: string;
  guestToken?: string;
  inviteUrl?: string;
  rsvpStatus?: RsvpStatus;
  rsvpCount?: number | null;
  invitedTo?: InviteEvent;
  doorCode?: string;
  comments?: Pick<GuestbookComment, "id" | "name" | "message">[];
  settings: SiteSettings;
};

export function InvitationShell({
  guestName,
  guestToken,
  inviteUrl,
  rsvpStatus = "pending",
  rsvpCount,
  invitedTo = "both",
  doorCode,
  comments = [],
  settings,
}: InvitationShellProps) {
  const [opened, setOpened] = useState(false);
  const couple = settings.couple;

  return (
    <div data-theme={settings.theme} className="h-dvh bg-[var(--chrome)]">
      <div
        className={`invitation-snap relative isolate mx-auto h-dvh w-full max-w-[430px] bg-background shadow-[0_0_40px_color-mix(in_srgb,var(--foreground)_12%,transparent)] ${
          opened ? "snap-y snap-mandatory overflow-y-auto" : "overflow-hidden"
        }`}
      >
        <InviteBusyProvider>
          <Cover
            guestName={guestName}
            brideName={couple.brideName}
            groomName={couple.groomName}
            weddingAt={couple.weddingAt}
            opened={opened}
            onOpen={() => setOpened(true)}
          />

          {opened ? (
            <>
              <MusicToggle />
              {inviteUrl ? (
                <QrSection
                  guestName={guestName}
                  inviteUrl={inviteUrl}
                  doorCode={doorCode}
                />
              ) : null}
              <CoupleSection
                brideName={couple.brideName}
                groomName={couple.groomName}
              />
              <VerseSection />
              <ParentsSection />
              <CountdownSection weddingAt={couple.weddingAt} />
              <BrideDetailSection
                person={{
                  role: "The bride",
                  name: couple.brideName,
                  fullName: couple.brideFullName,
                  parents: couple.brideParents,
                }}
              />
              <GroomDetailSection
                person={{
                  role: "The groom",
                  name: couple.groomName,
                  fullName: couple.groomFullName,
                  parents: couple.groomParents,
                }}
              />
              <LoveStorySection />
              <WeddingPartySection />
              <EventsSection invitedTo={invitedTo} events={settings.events} />
              <LocationSection invitedTo={invitedTo} events={settings.events} />
              <RundownSection />
              <DressCodeSection dressCode={settings.dressCode} />
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
              <GiftSection accounts={settings.bankAccounts} />
              <FaqSection faq={settings.faq} />
              <CommentsSection
                guestName={guestName}
                guestToken={guestToken}
                comments={comments}
              />
              <ClosingSection
                brideName={couple.brideName}
                groomName={couple.groomName}
              />
            </>
          ) : null}
        </InviteBusyProvider>
      </div>
    </div>
  );
}
