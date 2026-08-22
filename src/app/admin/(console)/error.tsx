"use client";

import { BackLink } from "@/components/admin/BackLink";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-dvh bg-zinc-100 px-4 py-16 text-zinc-900">
      <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          This admin page failed to load. Try again, or go back to the
          dashboard.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-zinc-400">Ref {error.digest}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-xl bg-zinc-900 px-3.5 text-sm text-white"
          >
            Try again
          </button>
          <BackLink href="/admin" className="">
            Back to dashboard
          </BackLink>
        </div>
      </div>
    </div>
  );
}
