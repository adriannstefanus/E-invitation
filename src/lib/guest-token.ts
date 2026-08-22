import { randomBytes } from "crypto";

export function createGuestToken() {
  return randomBytes(18).toString("base64url");
}

export { parseInviteToken } from "@/lib/parse-invite-token";
