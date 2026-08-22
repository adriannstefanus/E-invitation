import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions";

export { TypeBadge } from "@/components/admin/TypeBadge";

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
  compact = false,
}: {
  title: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const nav = compact
    ? links.filter((link) => link.href === "/admin" || link.href === "/admin/door")
    : links;

  return (
    <div className="min-h-dvh bg-zinc-100 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div
          className={`mx-auto flex flex-wrap items-center gap-3 px-4 py-3 ${
            compact ? "max-w-3xl" : "max-w-5xl"
          }`}
        >
          <p className="mr-2 text-sm font-medium">Admin</p>
          <nav className="flex flex-wrap gap-2 text-sm">
            {nav.map((link) => (
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
              className="min-h-10 text-sm text-zinc-500 hover:text-zinc-900"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main
        className={`mx-auto px-4 py-6 ${compact ? "max-w-3xl" : "max-w-5xl"}`}
      >
        <h1
          className={`mb-6 font-semibold tracking-tight ${
            compact ? "text-3xl" : "text-2xl"
          }`}
        >
          {title}
        </h1>
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
