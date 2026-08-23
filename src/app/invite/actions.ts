"use server";

import { revalidatePath } from "next/cache";
import { getGuestByToken, getSiteSettings } from "@/lib/db";
import { rsvpWindowState } from "@/lib/site-settings";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export async function submitRsvp(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured yet." };
  }

  const token = String(formData.get("token") ?? "");
  const attending = String(formData.get("attending") ?? "");
  const guests = Number(formData.get("guests") ?? 1);

  if (!token || (attending !== "yes" && attending !== "no")) {
    return { ok: false, error: "Open your personal invite link to RSVP." };
  }

  const guest = await getGuestByToken(token);
  if (!guest) {
    return { ok: false, error: "Guest not found." };
  }

  const settings = await getSiteSettings();
  const windowState = rsvpWindowState(
    settings.rsvpOpensAt,
    settings.rsvpClosesAt,
  );
  if (windowState === "soon") {
    return { ok: false, error: "RSVP is not open yet." };
  }
  if (windowState === "closed") {
    return { ok: false, error: "RSVP is closed." };
  }

  const { error } = await createServiceClient()
    .from("guests")
    .update({
      rsvp_status: attending,
      rsvp_count: attending === "yes" ? Math.max(1, guests) : 0,
      rsvp_at: new Date().toISOString(),
    })
    .eq("id", guest.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/g/${token}`);
  revalidatePath("/admin");
  revalidatePath("/admin/rsvp");
  return { ok: true };
}

export async function submitComment(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured yet." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const token = String(formData.get("token") ?? "");

  if (!name || !message) {
    return { ok: false, error: "Name and message are required." };
  }

  let guestId: string | null = null;
  if (token) {
    const guest = await getGuestByToken(token);
    guestId = guest?.id ?? null;
  }

  const { error } = await createServiceClient().from("comments").insert({
    guest_id: guestId,
    name,
    message,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  if (token) {
    revalidatePath(`/g/${token}`);
  }
  revalidatePath("/admin/comments");
  return { ok: true };
}
