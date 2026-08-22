import { AdminShell } from "@/components/admin/AdminUi";

export default function InvitationCustomizePage() {
  return (
    <AdminShell title="Invitation">
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8">
        <p className="text-sm font-medium">Theme colors and section copy</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-600">
          Coming soon. This module will let you edit colors and each invitation
          section. The public invite still reads from the current files.
        </p>
      </div>
    </AdminShell>
  );
}
