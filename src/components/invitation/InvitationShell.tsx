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
import {
  inviteThemeStyle,
  isSectionVisible,
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
  const couple = settings.couple;
  const copy = settings.copy;
  const show = (id: Parameters<typeof isSectionVisible>[1]) =>
    isSectionVisible(settings, id);

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
            onOpen={() => setOpened(true)}
          />

          {opened ? (
            <>
              <MusicToggle src={settings.musicUrl} />
              {inviteUrl && show("qr") ? (
                <QrSection
                  guestName={guestName}
                  inviteUrl={inviteUrl}
                  doorCode={doorCode}
                />
              ) : null}
              {show("couple") ? (
                <CoupleSection
                  brideName={couple.brideName}
                  groomName={couple.groomName}
                />
              ) : null}
              {show("verse") ? <VerseSection verse={copy.verse} /> : null}
              {show("parents") ? (
                <ParentsSection families={copy.families} />
              ) : null}
              {show("countdown") ? (
                <CountdownSection weddingAt={couple.weddingAt} />
              ) : null}
              {show("bride") ? (
                <BrideDetailSection
                  person={{
                    role: "The bride",
                    name: couple.brideName,
                    fullName: couple.brideFullName,
                    parents: couple.brideParents,
                  }}
                />
              ) : null}
              {show("groom") ? (
                <GroomDetailSection
                  person={{
                    role: "The groom",
                    name: couple.groomName,
                    fullName: couple.groomFullName,
                    parents: couple.groomParents,
                  }}
                />
              ) : null}
              {show("loveStory") ? (
                <LoveStorySection beats={copy.loveStory} />
              ) : null}
              {show("weddingParty") ? (
                <WeddingPartySection party={copy.weddingParty} />
              ) : null}
              {show("events") ? (
                <EventsSection invitedTo={invitedTo} events={settings.events} />
              ) : null}
              {show("location") ? (
                <LocationSection
                  invitedTo={invitedTo}
                  events={settings.events}
                />
              ) : null}
              {show("rundown") ? (
                <RundownSection items={copy.rundown} />
              ) : null}
              {show("dressCode") ? (
                <DressCodeSection dressCode={settings.dressCode} />
              ) : null}
              {show("stay") ? <StaySection stay={copy.stay} /> : null}
              {show("liveStream") ? (
                <LiveStreamSection liveStream={copy.liveStream} />
              ) : null}
              {show("instagram") ? (
                <InstagramSection instagram={copy.instagram} />
              ) : null}
              {show("rsvp") ? (
                <RsvpSection
                  guestName={guestName}
                  guestToken={guestToken}
                  rsvpStatus={rsvpStatus}
                  rsvpCount={rsvpCount}
                  rsvpOpensAt={settings.rsvpOpensAt}
                  rsvpClosesAt={settings.rsvpClosesAt}
                />
              ) : null}
              {show("gallery") ? <GallerySection /> : null}
              {show("gifts") ? (
                <GiftSection accounts={settings.bankAccounts} />
              ) : null}
              {show("faq") ? <FaqSection faq={settings.faq} /> : null}
              {show("comments") ? (
                <CommentsSection
                  guestName={guestName}
                  guestToken={guestToken}
                  comments={comments}
                />
              ) : null}
              {show("closing") ? (
                <ClosingSection
                  brideName={couple.brideName}
                  groomName={couple.groomName}
                />
              ) : null}
            </>
          ) : null}
        </InviteBusyProvider>
      </div>
    </div>
  );
}
