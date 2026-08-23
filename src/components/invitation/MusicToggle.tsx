"use client";

import { useEffect, useRef, useState } from "react";

export function MusicToggle({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (enabled) {
      void audio.play().catch(() => setEnabled(false));
      return;
    }
    audio.pause();
  }, [enabled]);

  if (!src) {
    return null;
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
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
    </>
  );
}
