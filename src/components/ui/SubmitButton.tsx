"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  children: ReactNode;
};

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const busy = pending || Boolean(disabled);

  return (
    <button
      type="submit"
      disabled={busy}
      className={`disabled:opacity-60 ${className}`}
      {...props}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
