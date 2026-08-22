export function readGuestName(to: string | string[] | undefined): string {
  const raw = Array.isArray(to) ? to[0] : to;
  if (!raw) {
    return "Guest";
  }

  try {
    return decodeURIComponent(raw.replace(/\+/g, " ")).trim() || "Guest";
  } catch {
    return raw.trim() || "Guest";
  }
}
