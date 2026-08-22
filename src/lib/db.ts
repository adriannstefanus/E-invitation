import { createServiceClient } from "@/lib/supabase";
import type {
  Gift,
  GuestbookComment,
  Guest,
  GuestType,
  RsvpStatus,
} from "@/lib/types";

export async function getGuestByToken(token: string) {
  const { data, error } = await createServiceClient()
    .from("guests")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Guest | null) ?? null;
}

export async function getGuestById(id: string) {
  const { data, error } = await createServiceClient()
    .from("guests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Guest | null) ?? null;
}

export async function listGuests(query?: {
  search?: string;
  guestType?: GuestType | "all";
  rsvpStatus?: RsvpStatus | "all";
  attendance?: "all" | "arrived" | "waiting";
}) {
  let request = createServiceClient().from("guests").select("*").order("name");

  const search = query?.search?.replace(/[%_,]/g, "").trim();
  if (search) {
    request = request.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  if (query?.guestType && query.guestType !== "all") {
    request = request.eq("guest_type", query.guestType);
  }
  if (query?.rsvpStatus && query.rsvpStatus !== "all") {
    request = request.eq("rsvp_status", query.rsvpStatus);
  }
  if (query?.attendance === "arrived") {
    request = request.not("checked_in_at", "is", null);
  }
  if (query?.attendance === "waiting") {
    request = request.is("checked_in_at", null);
  }

  const { data, error } = await request;
  if (error) {
    throw error;
  }
  return (data ?? []) as Guest[];
}

export async function listComments(limit?: number) {
  let request = createServiceClient()
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) {
    request = request.limit(limit);
  }

  const { data, error } = await request;
  if (error) {
    throw error;
  }
  return (data ?? []) as GuestbookComment[];
}

export async function listGifts() {
  const { data, error } = await createServiceClient()
    .from("gifts")
    .select("*")
    .order("received_at", { ascending: false });

  if (error) {
    throw error;
  }
  return (data ?? []) as Gift[];
}
