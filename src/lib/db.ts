import { cache } from "react";
import { createDoorCode } from "@/lib/door-code";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  defaultSiteSettings,
  mergeSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";
import type {
  Gift,
  GuestbookComment,
  Guest,
  GuestType,
  InviteEvent,
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

export async function getGuestByDoorCode(code: string) {
  const { data, error } = await createServiceClient()
    .from("guests")
    .select("*")
    .eq("door_code", code.trim())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Guest | null) ?? null;
}

export async function allocateDoorCodes(count: number) {
  const { data, error } = await createServiceClient()
    .from("guests")
    .select("door_code");
  if (error) {
    throw error;
  }

  const used = new Set(
    (data ?? [])
      .map((row) => row.door_code as string | null)
      .filter((value): value is string => Boolean(value)),
  );
  const codes: string[] = [];
  let attempts = 0;
  while (codes.length < count && attempts < Math.max(50, count * 40)) {
    attempts += 1;
    const code = createDoorCode();
    if (!used.has(code)) {
      used.add(code);
      codes.push(code);
    }
  }
  if (codes.length < count) {
    throw new Error("Could not allocate unique door codes.");
  }
  return codes;
}

export async function listGuests(query?: {
  search?: string;
  guestType?: GuestType | "all";
  invitedTo?: InviteEvent | "all";
  rsvpStatus?: RsvpStatus | "all";
  attendance?: "all" | "arrived" | "waiting";
}) {
  let request = createServiceClient().from("guests").select("*").order("name");

  const search = query?.search?.replace(/[%_,]/g, "").trim();
  if (search) {
    request = request.or(
      `name.ilike.%${search}%,invite_name.ilike.%${search}%,phone.ilike.%${search}%,door_code.eq.${search}`,
    );
  }
  if (query?.guestType && query.guestType !== "all") {
    request = request.eq("guest_type", query.guestType);
  }
  if (query?.invitedTo && query.invitedTo !== "all") {
    request = request.eq("invited_to", query.invitedTo);
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

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured()) {
    return defaultSiteSettings;
  }

  try {
    const { data, error } = await createServiceClient()
      .from("site_settings")
      .select("data")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      return defaultSiteSettings;
    }

    return mergeSiteSettings(data?.data);
  } catch {
    return defaultSiteSettings;
  }
});

export async function saveSiteSettings(next: SiteSettings) {
  const { error } = await createServiceClient()
    .from("site_settings")
    .upsert({
      id: "default",
      data: next,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw error;
  }
}
