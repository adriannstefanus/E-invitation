"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { InviteVisuals } from "@/lib/invite-visuals";

const InviteVisualsContext = createContext<InviteVisuals | null>(null);

export function InviteVisualsProvider({
  visuals,
  children,
}: {
  visuals: InviteVisuals;
  children: ReactNode;
}) {
  return (
    <InviteVisualsContext.Provider value={visuals}>
      {children}
    </InviteVisualsContext.Provider>
  );
}

export function useInviteVisuals() {
  return useContext(InviteVisualsContext);
}
