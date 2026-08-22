import { notFound } from "next/navigation";
import { InvitationShell } from "@/components/invitation/InvitationShell";
import { getGuestByToken, listComments } from "@/lib/db";
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

  const [inviteUrl, comments] = await Promise.all([
    getInviteUrl(guest.token),
    listComments(12),
  ]);

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
    />
  );
}
