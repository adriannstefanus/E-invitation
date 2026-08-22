"use client";

import { useState } from "react";

export function CopyText({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyValue}
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export function ConfirmSubmit({
  label,
  confirmLabel,
  className,
}: {
  label: string;
  confirmLabel: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmLabel)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
