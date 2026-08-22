import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function AdminConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
