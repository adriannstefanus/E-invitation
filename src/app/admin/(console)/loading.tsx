export default function AdminLoading() {
  return (
    <div className="min-h-dvh bg-zinc-100 text-zinc-900">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
          <div className="h-7 w-20 animate-pulse rounded-md bg-zinc-100" />
          <div className="h-7 w-16 animate-pulse rounded-md bg-zinc-100" />
          <div className="h-7 w-14 animate-pulse rounded-md bg-zinc-100" />
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 h-8 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-24 animate-pulse rounded-xl bg-white" />
          <div className="h-24 animate-pulse rounded-xl bg-white" />
          <div className="h-24 animate-pulse rounded-xl bg-white" />
        </div>
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-white" />
      </div>
    </div>
  );
}
