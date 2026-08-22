import type { ReactNode } from "react";
import { GuestTypeProvider } from "@/components/admin/TypeBadge";
import { getSiteSettings } from "@/lib/db";
import { defaultSiteSettings } from "@/lib/site-settings";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = isSupabaseConfigured()
    ? await getSiteSettings()
    : defaultSiteSettings;

  return (
    <GuestTypeProvider types={settings.guestTypes}>{children}</GuestTypeProvider>
  );
}
