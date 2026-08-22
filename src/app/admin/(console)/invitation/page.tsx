import { AdminShell } from "@/components/admin/AdminUi";
import { EmptyState } from "@/components/ui/EmptyState";

export default function InvitationCustomizePage() {
  return (
    <AdminShell title="Invitation">
      <EmptyState
        title="Theme colors and section copy"
        body="Coming soon. This module will let you edit colors and each invitation section. The public invite still reads from the current files."
      />
    </AdminShell>
  );
}
