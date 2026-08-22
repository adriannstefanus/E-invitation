"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { InviteBusyOverlay } from "@/components/invitation/InviteBusyOverlay";

type InviteBusyContextValue = {
  setBusy: (busy: boolean) => void;
};

const InviteBusyContext = createContext<InviteBusyContextValue | null>(null);

export function InviteBusyProvider({ children }: { children: ReactNode }) {
  const [busy, setBusy] = useState(false);
  const value = useMemo(() => ({ setBusy }), []);

  return (
    <InviteBusyContext.Provider value={value}>
      {children}
      {busy ? <InviteBusyOverlay /> : null}
    </InviteBusyContext.Provider>
  );
}

export function useInviteBusy() {
  const context = useContext(InviteBusyContext);
  if (!context) {
    throw new Error("useInviteBusy must be used within InviteBusyProvider");
  }
  return context.setBusy;
}
