import { headers } from "next/headers";

export async function getSiteOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}

export async function getInviteUrl(token: string) {
  const origin = await getSiteOrigin();
  return origin ? `${origin}/g/${token}` : `/g/${token}`;
}
