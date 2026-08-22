"use client";

import { Suspense, type ReactNode } from "react";
import { FlashToasts } from "@/components/ui/FlashToasts";
import { ToastProvider } from "@/components/ui/Toast";

export function AppFeedback({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Suspense fallback={null}>
        <FlashToasts />
      </Suspense>
    </ToastProvider>
  );
}
