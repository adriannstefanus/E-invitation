"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { FlashTone } from "@/lib/flash";

export type ToastInput = {
  tone?: FlashTone;
  message: string;
  duration?: number;
};

type ToastItem = {
  id: number;
  tone: FlashTone;
  message: string;
  duration: number;
};

type ToastContextValue = {
  toast: (input: ToastInput | string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context.toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((input: ToastInput | string) => {
    const tone = typeof input === "string" ? "success" : (input.tone ?? "success");
    const message = typeof input === "string" ? input : input.message;
    const duration =
      typeof input === "string"
        ? 3500
        : (input.duration ?? (tone === "error" ? 5200 : 3500));

    const next: ToastItem = {
      id: ++idRef.current,
      tone,
      message,
      duration,
    };
    setToasts((current) => [...current.slice(-2), next]);
  }, []);

  function dismiss(id: number) {
    setToasts((current) => current.filter((item) => item.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ol className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] mx-auto flex w-[min(100%-2rem,28rem)] flex-col gap-2 pb-[env(safe-area-inset-bottom)]">
        {toasts.map((item) => (
          <ToastCard
            key={item.id}
            item={item}
            onDone={() => dismiss(item.id)}
          />
        ))}
      </ol>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  onDone,
}: {
  item: ToastItem;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, item.duration);
    return () => window.clearTimeout(timer);
  }, [item.duration, onDone]);

  const toneClass =
    item.tone === "error"
      ? "bg-red-700"
      : item.tone === "warning"
        ? "bg-amber-800"
        : "bg-zinc-900";

  return (
    <li
      role="status"
      aria-live="polite"
      className={`pointer-events-auto rounded-xl px-4 py-3 text-sm leading-relaxed text-white shadow-lg ${toneClass}`}
    >
      {item.message}
    </li>
  );
}
