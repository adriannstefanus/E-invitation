import { InvitationShell } from "@/components/invitation/InvitationShell";
import { getSiteSettings, listComments } from "@/lib/db";
import { readGuestName } from "@/lib/guest-name";
import { defaultSiteSettings } from "@/lib/site-settings";
import { isSupabaseConfigured } from "@/lib/supabase";

type HomeProps = {
  searchParams: Promise<{ to?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();
  const comments = configured ? await listComments(12) : [];
  const settings = configured ? await getSiteSettings() : defaultSiteSettings;

  return (
    <InvitationShell
      guestName={readGuestName(params.to)}
      comments={comments}
      settings={settings}
    />
  );
}
