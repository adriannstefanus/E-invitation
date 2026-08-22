import type { ReactNode } from "react";
import Link from "next/link";

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="size-4 shrink-0"
      aria-hidden
    >
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BackLink({
  href,
  children,
  className = "mb-6",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 ${className}`}
    >
      <ChevronLeftIcon />
      {children}
    </Link>
  );
}
