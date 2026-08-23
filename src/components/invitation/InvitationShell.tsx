"use client";

import { useRef, useState, type ReactNode, Fragment } from "react";
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
import {
  MusicToggle,
  type MusicToggleHandle,
} from "@/components/invitation/MusicToggle";
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
import {
  inviteThemeStyle,
  isSectionVisible,
  orderedInviteSections,
  type InviteSectionId,
  type SiteSettings,
} from "@/lib/site-settings";

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
  const musicRef = useRef<MusicToggleHandle>(null);
  const couple = settings.couple;
  const copy = settings.copy;

  function renderSection(id: InviteSectionId): ReactNode {
    if (!isSectionVisible(settings, id)) {
      return null;
    }

    switch (id) {
      case "qr":
        return inviteUrl ? (
          <QrSection
            guestName={guestName}
            inviteUrl={inviteUrl}
            doorCode={doorCode}
          />
        ) : null;
      case "couple":
        return (
          <CoupleSection
            brideName={couple.brideName}
            groomName={couple.groomName}
          />
        );
      case "verse":
        return <VerseSection verse={copy.verse} />;
      case "parents":
        return <ParentsSection families={copy.families} />;
      case "countdown":
        return <CountdownSection weddingAt={couple.weddingAt} />;
      case "bride":
        return (
          <BrideDetailSection
            person={{
              role: "The bride",
              name: couple.brideName,
              fullName: couple.brideFullName,
              parents: couple.brideParents,
            }}
          />
        );
      case "groom":
        return (
          <GroomDetailSection
            person={{
              role: "The groom",
              name: couple.groomName,
              fullName: couple.groomFullName,
              parents: couple.groomParents,
            }}
          />
        );
      case "loveStory":
        return <LoveStorySection beats={copy.loveStory} />;
      case "weddingParty":
        return <WeddingPartySection party={copy.weddingParty} />;
      case "events":
        return <EventsSection invitedTo={invitedTo} events={settings.events} />;
      case "location":
        return (
          <LocationSection invitedTo={invitedTo} events={settings.events} />
        );
      case "rundown":
        return <RundownSection items={copy.rundown} />;
      case "dressCode":
        return <DressCodeSection dressCode={settings.dressCode} />;
      case "stay":
        return <StaySection stay={copy.stay} />;
      case "liveStream":
        return <LiveStreamSection liveStream={copy.liveStream} />;
      case "instagram":
        return <InstagramSection instagram={copy.instagram} />;
      case "rsvp":
        return (
          <RsvpSection
            guestName={guestName}
            guestToken={guestToken}
            rsvpStatus={rsvpStatus}
            rsvpCount={rsvpCount}
            rsvpOpensAt={settings.rsvpOpensAt}
            rsvpClosesAt={settings.rsvpClosesAt}
          />
        );
      case "gallery":
        return <GallerySection />;
      case "gifts":
        return <GiftSection accounts={settings.bankAccounts} />;
      case "faq":
        return <FaqSection faq={settings.faq} />;
      case "comments":
        return (
          <CommentsSection
            guestName={guestName}
            guestToken={guestToken}
            comments={comments}
          />
        );
      case "closing":
        return (
          <ClosingSection
            brideName={couple.brideName}
            groomName={couple.groomName}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div
      data-theme={settings.theme}
      className="h-dvh bg-[var(--chrome)]"
      style={inviteThemeStyle(settings.colors)}
    >
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
            greeting={copy.coverGreeting}
            opened={opened}
            onOpen={() => {
              setOpened(true);
              musicRef.current?.start();
            }}
          />

          {settings.musicUrl ? (
            <MusicToggle
              ref={musicRef}
              src={settings.musicUrl}
              visible={opened}
            />
          ) : null}

          {opened
            ? orderedInviteSections(settings).map((id) => (
                <Fragment key={id}>{renderSection(id)}</Fragment>
              ))
            : null}
        </InviteBusyProvider>
      </div>
    </div>
  );
}
