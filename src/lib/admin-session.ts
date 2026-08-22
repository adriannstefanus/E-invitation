const encoder = new TextEncoder();

async function hmacHex(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function adminSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET is not set.");
  }
  return secret;
}

export const ADMIN_COOKIE = "admin_session";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function createAdminSessionValue() {
  const exp = Date.now() + TTL_MS;
  const payload = `admin.${exp}`;
  const signature = await hmacHex(payload, adminSecret());
  return `${payload}.${signature}`;
}

export async function isAdminSessionValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  const parts = value.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [who, exp, signature] = parts;
  if (who !== "admin" || Number(exp) < Date.now()) {
    return false;
  }

  try {
    const expected = await hmacHex(`${who}.${exp}`, adminSecret());
    return expected === signature;
  } catch {
    return false;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
