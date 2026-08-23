import type { ReactNode } from "react";

export const fieldClass =
  "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm";

export function StatusBadge({ status }: { status: "live" | "stub" | "mixed" }) {
  const label =
    status === "live" ? "Live" : status === "stub" ? "Stub" : "Live + stub";
  const className =
    status === "live"
      ? "bg-emerald-50 text-emerald-800"
      : status === "stub"
        ? "bg-amber-50 text-amber-800"
        : "bg-zinc-100 text-zinc-600";
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${className}`}
    >
      {label}
    </span>
  );
}

export function Group({
  id,
  title,
  status = "live",
  children,
}: {
  id: string;
  title: string;
  status?: "live" | "stub" | "mixed";
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-6 rounded-2xl border p-5 ${
        status === "stub"
          ? "border-dashed border-zinc-300 bg-zinc-50"
          : "border-zinc-200 bg-white"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <StatusBadge status={status} />
      </div>
      {children}
    </section>
  );
}

export function ItemHeading({
  children,
  status = "live",
}: {
  children: string;
  status?: "live" | "stub";
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-sm font-medium text-zinc-800">{children}</h3>
      <StatusBadge status={status} />
    </div>
  );
}

export function LaterItems({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-zinc-600">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start justify-between gap-3 rounded-lg border border-dashed border-amber-200 bg-amber-50/60 px-3 py-2"
        >
          <span>
            {item}
            <span className="mt-0.5 block text-xs text-amber-800/80">
              Not built yet
            </span>
          </span>
          <StatusBadge status="stub" />
        </li>
      ))}
    </ul>
  );
}
