import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/invitation/ComingSoon";
import { InvitationShell } from "@/components/invitation/InvitationShell";
import { getGuestByToken, getSiteSettings, listComments } from "@/lib/db";
import { getInviteUrl } from "@/lib/invite-url";
import { isSupabaseConfigured } from "@/lib/supabase";
import { guestInviteName } from "@/lib/types";

type GuestInvitePageProps = {
  params: Promise<{ token: string }>;
};

export default async function GuestInvitePage({
  params,
}: GuestInvitePageProps) {
  if (!isSupabaseConfigured()) {
    notFound();
  }

  const { token } = await params;
  const guest = await getGuestByToken(token);
  if (!guest) {
    notFound();
  }

  const [inviteUrl, comments, settings] = await Promise.all([
    getInviteUrl(guest.token),
    listComments(12),
    getSiteSettings(),
  ]);

  if (!settings.published) {
    return <ComingSoon settings={settings} />;
  }

  return (
    <InvitationShell
      guestName={guestInviteName(guest)}
      guestToken={guest.token}
      inviteUrl={inviteUrl}
      rsvpStatus={guest.rsvp_status}
      rsvpCount={guest.rsvp_count}
      invitedTo={guest.invited_to}
      doorCode={guest.door_code}
      comments={comments}
      settings={settings}
    />
  );
}
