import { AdminShell, SetupNotice } from "@/components/admin/AdminUi";
import { InvitationSettings } from "@/components/admin/InvitationSettings";
import { getSiteSettings } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export default async function InvitationCustomizePage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const settings = await getSiteSettings();

  return (
    <AdminShell title="Invitation">
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-zinc-600">
        Public invite settings, grouped by module. Run{" "}
        <code>supabase/migrate-site-settings.sql</code> if save fails,{" "}
        <code>supabase/migrate-invite-sent.sql</code> for invite-sent tracking,
        and <code>supabase/migrate-invite-media.sql</code> before uploading
        music.
      </p>
      <InvitationSettings settings={settings} />
    </AdminShell>
  );
}
