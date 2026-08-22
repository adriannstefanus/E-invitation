"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/Spinner";

export function PageBusy({
  show,
  label = "Working…",
}: {
  show: boolean;
  label?: string;
}) {
  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 px-4"
      role="alertdialog"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-sm text-zinc-900 shadow-lg">
        <Spinner className="size-5" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function FormPageBusy({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <PageBusy show={pending} label={label} />;
}
