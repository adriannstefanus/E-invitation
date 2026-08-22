import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";

export function CountdownSection() {
  return (
    <InvitationSection image={invitationMedia.countdown.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">Countdown</p>
      <div className="mt-6 grid w-full grid-cols-4 gap-2">
        <TimeBox value="--" label="Days" />
        <TimeBox value="--" label="Hours" />
        <TimeBox value="--" label="Mins" />
        <TimeBox value="--" label="Secs" />
      </div>
      <p className="mt-4 text-xs text-muted">Date placeholder</p>
    </InvitationSection>
  );
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
