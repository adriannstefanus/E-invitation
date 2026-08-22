export const GUEST_TYPES = ["regular", "vip", "family", "vendor"] as const;
export const RSVP_STATUSES = ["pending", "yes", "no"] as const;
export const GIFT_KINDS = ["angpao", "physical"] as const;

export type GuestType = (typeof GUEST_TYPES)[number];
export type RsvpStatus = (typeof RSVP_STATUSES)[number];
export type CheckInMethod = "qr" | "manual";
export type GiftKind = (typeof GIFT_KINDS)[number];

export type Guest = {
  id: string;
  name: string;
  token: string;
  guest_type: GuestType;
  invited_count: number;
  phone: string | null;
  notes: string | null;
  rsvp_status: RsvpStatus;
  rsvp_count: number | null;
  rsvp_at: string | null;
  checked_in_at: string | null;
  arrived_count: number | null;
  check_in_method: CheckInMethod | null;
  created_at: string;
};

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
