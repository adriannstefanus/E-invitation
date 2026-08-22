"use client";

import { useState } from "react";

export function MusicToggle() {
  const [enabled, setEnabled] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={enabled ? "Pause music" : "Play music"}
      onClick={() => setEnabled((value) => !value)}
      className="fixed right-[max(1rem,calc(50%-215px+1rem))] bottom-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-card text-accent shadow-sm"
    >
      {enabled ? (
        <span aria-hidden className="text-lg leading-none">
          ♪
        </span>
      ) : (
        <span aria-hidden className="text-xs tracking-wide">
          off
        </span>
      )}
    </button>
  );
}
