import { InviteBusyOverlay } from "@/components/invitation/InviteBusyOverlay";

export default function InviteLoading() {
  return (
    <div className="h-dvh bg-[var(--chrome)]">
      <div className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-background shadow-[0_0_40px_rgba(63,58,52,0.12)]">
        <div className="h-full bg-[radial-gradient(ellipse_at_center,var(--card),var(--background))]" />
        <InviteBusyOverlay />
      </div>
    </div>
  );
}
