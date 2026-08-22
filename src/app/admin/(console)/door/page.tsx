import { DoorConsole } from "@/components/admin/DoorConsole";
import { AdminShell, SetupNotice } from "@/components/admin/AdminUi";
import { listGuests } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { DOOR_GATES, type DoorGate } from "@/lib/types";

type DoorPageProps = {
  searchParams: Promise<{ q?: string; gate?: string }>;
};

export default async function DoorPage({ searchParams }: DoorPageProps) {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const params = await searchParams;
  const gate = (DOOR_GATES as readonly string[]).includes(params.gate ?? "")
    ? (params.gate as DoorGate)
    : "both";
  const guests = await listGuests({
    search: params.q,
  });

  return (
    <AdminShell title="Door" compact>
      <DoorConsole guests={guests} gate={gate} />
    </AdminShell>
  );
}
