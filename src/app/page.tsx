import { InvitationShell } from "@/components/invitation/InvitationShell";
import { readGuestName } from "@/lib/guest-name";

type HomeProps = {
  searchParams: Promise<{ to?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  return <InvitationShell guestName={readGuestName(params.to)} />;
}
