import { BackLink } from "@/components/admin/BackLink";

export default function AdminNotFound() {
  return (
    <div className="min-h-dvh bg-zinc-100 px-4 py-16 text-zinc-900">
      <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          That guest or admin page does not exist.
        </p>
        <div className="mt-4">
          <BackLink href="/admin">Back to dashboard</BackLink>
        </div>
      </div>
    </div>
  );
}
