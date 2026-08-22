export function EmptyState({
  title,
  body,
}: {
  title: string;
  body?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center">
      <p className="font-medium text-zinc-800">{title}</p>
      {body ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
          {body}
        </p>
      ) : null}
    </div>
  );
}
