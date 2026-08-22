import { formatDoorCode } from "@/lib/door-code-format";
import { guestInviteName, type Guest } from "@/lib/types";

export function toWhatsAppPhone(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  let international = digits;
  if (digits.startsWith("00")) {
    international = digits.slice(2);
  } else if (digits.startsWith("0")) {
    international = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8") && digits.length >= 9 && digits.length <= 13) {
    international = `62${digits}`;
  }

  if (international.length < 10 || international.length > 15) {
    return null;
  }
  return international;
}

export function whatsappInviteMessage(guest: Guest, inviteUrl: string) {
  const name = guestInviteName(guest);
  const code = guest.door_code
    ? `\nDoor code: ${formatDoorCode(guest.door_code)}`
    : "";
  return `Hi ${name}, this is your wedding invitation:\n${inviteUrl}${code}`;
}

export function getWhatsAppInviteUrl(guest: Guest, inviteUrl: string) {
  const text = encodeURIComponent(whatsappInviteMessage(guest, inviteUrl));
  const phone = toWhatsAppPhone(guest.phone);
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}
