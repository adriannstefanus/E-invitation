export const GUEST_TYPES = ["regular", "vip", "family", "vendor"] as const;
export const RSVP_STATUSES = ["pending", "yes", "no"] as const;
export const INVITE_EVENTS = ["both", "ceremony", "reception"] as const;
export const GIFT_KINDS = ["angpao", "physical"] as const;

export type GuestType = (typeof GUEST_TYPES)[number];
export type RsvpStatus = (typeof RSVP_STATUSES)[number];
export type InviteEvent = (typeof INVITE_EVENTS)[number];
export type CheckInMethod = "qr" | "manual";
export type GiftKind = (typeof GIFT_KINDS)[number];

export const INVITE_EVENT_LABELS: Record<InviteEvent, string> = {
  both: "Both events",
  ceremony: "Ceremony only",
  reception: "Reception only",
};

export function isGuestType(value: string): value is GuestType {
  return (GUEST_TYPES as readonly string[]).includes(value);
}

export function isRsvpStatus(value: string): value is RsvpStatus {
  return (RSVP_STATUSES as readonly string[]).includes(value);
}

export function parseInviteEvent(value: string | undefined | null): InviteEvent {
  const raw = (value ?? "").trim().toLowerCase();
  if (raw === "ceremony" || raw === "akad") {
    return "ceremony";
  }
  if (raw === "reception" || raw === "resepsi") {
    return "reception";
  }
  return "both";
}

export type Guest = {
  id: string;
  name: string;
  invite_name: string | null;
  token: string;
  guest_type: GuestType;
  invited_to: InviteEvent;
  door_code: string;
  invited_count: number;
  phone: string | null;
  notes: string | null;
  rsvp_status: RsvpStatus;
  rsvp_count: number | null;
  rsvp_at: string | null;
  checked_in_at: string | null;
  arrived_count: number | null;
  check_in_method: CheckInMethod | null;
  invite_sent_at: string | null;
  created_at: string;
};

export function guestInviteName(guest: Pick<Guest, "name" | "invite_name">) {
  return guest.invite_name?.trim() || guest.name;
}

export const DOOR_GATES = ["both", "ceremony", "reception"] as const;
export type DoorGate = (typeof DOOR_GATES)[number];

export function isWrongDoorEvent(gate: DoorGate, invitedTo: InviteEvent) {
  if (gate === "both" || invitedTo === "both") {
    return false;
  }
  return gate !== invitedTo;
}

export type GuestbookComment = {
  id: string;
  guest_id: string | null;
  name: string;
  message: string;
  created_at: string;
};

export type Gift = {
  id: string;
  guest_id: string | null;
  guest_name: string;
  kind: GiftKind;
  amount: number | null;
  note: string | null;
  received_at: string;
};
