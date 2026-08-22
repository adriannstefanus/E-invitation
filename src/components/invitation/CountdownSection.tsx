"use client";

import { useEffect, useState } from "react";
import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";
import { countdownTarget, formatWeddingWhen } from "@/lib/site-settings";

export function CountdownSection({ weddingAt }: { weddingAt: string }) {
  const remaining = useCountdown(weddingAt);

  return (
    <InvitationSection image={invitationMedia.countdown.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">Countdown</p>
      <div className="mt-6 grid w-full grid-cols-4 gap-2">
        <TimeBox value={remaining?.days ?? "--"} label="Days" />
        <TimeBox value={remaining?.hours ?? "--"} label="Hours" />
        <TimeBox value={remaining?.mins ?? "--"} label="Mins" />
        <TimeBox value={remaining?.secs ?? "--"} label="Secs" />
      </div>
      <p className="mt-4 text-xs text-muted">
        {formatWeddingWhen(weddingAt) ?? "Date to be announced"}
      </p>
    </InvitationSection>
  );
}

function useCountdown(weddingAt: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!weddingAt) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [weddingAt]);

  const target = countdownTarget(weddingAt);
  if (Number.isNaN(target)) {
    return null;
  }

  const diff = Math.max(0, target - now);
  return {
    days: String(Math.floor(diff / 86_400_000)),
    hours: String(Math.floor((diff / 3_600_000) % 24)).padStart(2, "0"),
    mins: String(Math.floor((diff / 60_000) % 60)).padStart(2, "0"),
    secs: String(Math.floor((diff / 1000) % 60)).padStart(2, "0"),
  };
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-card/90 px-2 py-4">
      <p className="font-display text-2xl">{value}</p>
      <p className="mt-1 text-[10px] tracking-wider text-muted uppercase">
        {label}
      </p>
    </div>
  );
}
