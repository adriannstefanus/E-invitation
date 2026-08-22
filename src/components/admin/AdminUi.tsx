import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/guests", label: "Guests" },
  { href: "/admin/door", label: "Door" },
  { href: "/admin/rsvp", label: "RSVP" },
  { href: "/admin/comments", label: "Guestbook" },
  { href: "/admin/gifts", label: "Gifts" },
  { href: "/admin/invitation", label: "Invitation" },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-zinc-100 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <p className="mr-2 text-sm font-medium">Admin</p>
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAdmin} className="ml-auto">
            <button
              type="submit"
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="min-h-dvh bg-zinc-100 px-4 py-16 text-zinc-900">
      <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Supabase is not configured</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Create a project, run <code>supabase/schema.sql</code> in the SQL
          editor, then copy keys into <code>.env.local</code> from{" "}
          <code>.env.example</code>.
        </p>
      </div>
    </div>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const tone =
    type === "vip"
      ? "bg-amber-100 text-amber-900"
      : type === "family"
        ? "bg-stone-200 text-stone-800"
        : type === "vendor"
          ? "bg-sky-100 text-sky-900"
          : "bg-zinc-100 text-zinc-700";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs tracking-wide uppercase ${tone}`}
    >
      {type}
    </span>
  );
}
