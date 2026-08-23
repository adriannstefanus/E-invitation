import {
  formatWeddingWhen,
  inviteThemeStyle,
  type SiteSettings,
} from "@/lib/site-settings";

export function ComingSoon({ settings }: { settings: SiteSettings }) {
  const couple = settings.couple;
  const when = formatWeddingWhen(couple.weddingAt);

  return (
    <div
      data-theme={settings.theme}
      className="h-dvh bg-[var(--chrome)]"
      style={inviteThemeStyle(settings.colors)}
    >
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col items-center justify-center bg-background px-8 text-center shadow-[0_0_40px_color-mix(in_srgb,var(--foreground)_12%,transparent)]">
        <p className="text-xs tracking-[0.35em] text-muted uppercase">
          The wedding of
        </p>
        <h1 className="font-display mt-6 text-5xl leading-tight text-foreground">
          {couple.brideName}
          <span className="mt-2 block text-2xl font-normal italic text-accent">
            &amp;
          </span>
          {couple.groomName}
        </h1>
        {when ? (
          <p className="mt-6 text-sm text-muted">{when}</p>
        ) : null}
        <p className="mt-10 text-sm text-muted">Coming soon.</p>
      </div>
    </div>
  );
}
