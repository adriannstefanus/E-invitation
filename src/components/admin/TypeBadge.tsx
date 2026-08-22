"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultSiteSettings, type GuestTypeStyle } from "@/lib/site-settings";
import { GUEST_TYPES, type GuestType } from "@/lib/types";

const GuestTypeContext = createContext<Record<GuestType, GuestTypeStyle>>(
  defaultSiteSettings.guestTypes,
);

export function GuestTypeProvider({
  types,
  children,
}: {
  types: Record<GuestType, GuestTypeStyle>;
  children: ReactNode;
}) {
  return (
    <GuestTypeContext.Provider value={types}>{children}</GuestTypeContext.Provider>
  );
}

export function useGuestTypes() {
  return useContext(GuestTypeContext);
}

export function TypeBadge({ type }: { type: string }) {
  const types = useGuestTypes();
  const style =
    type in types
      ? types[type as GuestType]
      : defaultSiteSettings.guestTypes.regular;

  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-xs tracking-wide uppercase"
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      {style.label}
    </span>
  );
}

export function GuestTypeOptions({ includeAll = false }: { includeAll?: boolean }) {
  const types = useGuestTypes();
  return (
    <>
      {includeAll ? <option value="all">All types</option> : null}
      {GUEST_TYPES.map((type) => (
        <option key={type} value={type}>
          {types[type].label}
        </option>
      ))}
    </>
  );
}
