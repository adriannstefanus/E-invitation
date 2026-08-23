import { InvitationShell } from "@/components/invitation/InvitationShell";
import { getSiteSettings } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { defaultSiteSettings } from "@/lib/site-settings";

export default async function InvitationPreviewPage() {
  const settings = isSupabaseConfigured()
    ? await getSiteSettings()
    : defaultSiteSettings;

  return <InvitationShell guestName="Preview" settings={settings} />;
}
