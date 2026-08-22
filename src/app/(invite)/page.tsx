import { InvitationShell } from "@/components/invitation/InvitationShell";
import { listComments } from "@/lib/db";
import { readGuestName } from "@/lib/guest-name";
import { isSupabaseConfigured } from "@/lib/supabase";

type HomeProps = {
  searchParams: Promise<{ to?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const comments = isSupabaseConfigured() ? await listComments(12) : [];

  return (
    <InvitationShell guestName={readGuestName(params.to)} comments={comments} />
  );
}
