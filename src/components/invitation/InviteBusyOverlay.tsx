export function InviteBusyOverlay({
  label = "Please wait",
}: {
  label?: string;
}) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 mx-auto flex h-dvh w-full max-w-[430px] items-center justify-center bg-background/45 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-card/90 px-7 py-6 shadow-sm">
        <span
          className="inline-block size-8 animate-spin rounded-full border-2 border-accent border-r-transparent"
          aria-hidden
        />
        <p className="text-xs tracking-[0.28em] text-muted uppercase">
          {label}
        </p>
      </div>
    </div>
  );
}
