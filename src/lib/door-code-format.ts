export function isDoorCodeQuery(value: string) {
  return /^\d{4,6}$/.test(value.trim());
}

export function formatDoorCode(code: string | null | undefined) {
  const digits = (code ?? "").replace(/\D/g, "");
  if (digits.length === 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  return digits || "—";
}
