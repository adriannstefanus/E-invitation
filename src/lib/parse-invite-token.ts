export function parseInviteToken(raw: string) {
  const value = raw.trim();
  try {
    const url = new URL(value);
    const match = url.pathname.match(/\/g\/([^/]+)/);
    return match?.[1] ?? null;
  } catch {
    const match = value.match(/\/g\/([^/?#]+)/);
    if (match?.[1]) {
      return match[1];
    }
    if (/^[A-Za-z0-9_-]{16,}$/.test(value)) {
      return value;
    }
    return null;
  }
}
