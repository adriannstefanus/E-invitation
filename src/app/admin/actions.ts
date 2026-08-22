"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionValue,
} from "@/lib/admin-session";
import { createGuestToken, parseInviteToken } from "@/lib/guest-token";
import { createServiceClient } from "@/lib/supabase";
import { GUEST_TYPES, type GiftKind, type GuestType } from "@/lib/types";

function isGuestType(value: string): value is GuestType {
  return (GUEST_TYPES as readonly string[]).includes(value);
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || password !== expected) {
    redirect("/admin/login?error=1");
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await createAdminSessionValue(), adminCookieOptions());
  redirect("/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function createGuest(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const guestType = String(formData.get("guest_type") ?? "regular");
  const invitedCount = Math.max(1, Number(formData.get("invited_count") ?? 1));
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name || !isGuestType(guestType)) {
    return;
  }

  const { data, error } = await createServiceClient()
    .from("guests")
    .insert({
      name,
      token: createGuestToken(),
      guest_type: guestType,
      invited_count: invitedCount,
      phone,
      notes,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/admin/guests?error=create");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/guests");
  redirect(`/admin/guests/${data.id}`);
}

export async function updateGuest(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const guestType = String(formData.get("guest_type") ?? "regular");
  const invitedCount = Math.max(1, Number(formData.get("invited_count") ?? 1));
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!id || !name || !isGuestType(guestType)) {
    return;
  }

  await createServiceClient()
    .from("guests")
    .update({
      name,
      guest_type: guestType,
      invited_count: invitedCount,
      phone,
      notes,
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/guests");
  revalidatePath(`/admin/guests/${id}`);
  redirect(`/admin/guests/${id}?saved=1`);
}

export async function deleteGuest(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }
  await createServiceClient().from("guests").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/guests");
  redirect("/admin/guests");
}

export async function importGuestsCsv(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/guests?import=empty");
  }

  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    redirect("/admin/guests?import=empty");
  }

  const start = lines[0].toLowerCase().includes("name") ? 1 : 0;
  const rows = lines
    .slice(start)
    .map((line) => {
      const [name, type, invited, phone] = line
        .split(",")
        .map((part) => part.trim());
      return {
        name,
        token: createGuestToken(),
        guest_type: isGuestType(type?.toLowerCase() ?? "")
          ? type.toLowerCase()
          : "regular",
        invited_count: Math.max(1, Number(invited) || 1),
        phone: phone || null,
      };
    })
    .filter((row) => row.name);

  if (rows.length > 0) {
    const { error } = await createServiceClient().from("guests").insert(rows);
    if (error) {
      redirect("/admin/guests?import=error");
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/guests");
  redirect(`/admin/guests?imported=${rows.length}`);
}

export async function checkInGuest(formData: FormData) {
  const token = parseInviteToken(String(formData.get("token") ?? "")) ?? "";
  const method =
    String(formData.get("method") ?? "manual") === "qr" ? "qr" : "manual";
  const arrived = Math.max(1, Number(formData.get("arrived_count") ?? 1));

  if (!token) {
    return { ok: false as const, error: "Could not read a guest token." };
  }

  const { data: guest, error: lookupError } = await createServiceClient()
    .from("guests")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (lookupError || !guest) {
    return { ok: false as const, error: "Guest not found." };
  }

  if (guest.checked_in_at) {
    return {
      ok: true as const,
      already: true,
      name: guest.name as string,
      type: guest.guest_type as string,
    };
  }

  const arrivedCount =
    guest.rsvp_count && guest.rsvp_count > 0
      ? guest.rsvp_count
      : guest.invited_count;

  const { error } = await createServiceClient()
    .from("guests")
    .update({
      checked_in_at: new Date().toISOString(),
      arrived_count: method === "manual" ? arrived : arrivedCount,
      check_in_method: method,
    })
    .eq("id", guest.id);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/door");
  revalidatePath("/admin/guests");
  revalidatePath(`/admin/guests/${guest.id}`);
  return {
    ok: true as const,
    already: false,
    name: guest.name as string,
    type: guest.guest_type as string,
  };
}

function safeAdminNext(value: string) {
  return value.startsWith("/admin/") ? value : null;
}

export async function checkInGuestForm(formData: FormData) {
  await checkInGuest(formData);
  const next = safeAdminNext(String(formData.get("next") ?? ""));
  if (next) {
    redirect(next);
  }
}

export async function undoCheckIn(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }
  await createServiceClient()
    .from("guests")
    .update({
      checked_in_at: null,
      arrived_count: null,
      check_in_method: null,
    })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/door");
  revalidatePath("/admin/guests");
  revalidatePath(`/admin/guests/${id}`);
  const next = safeAdminNext(String(formData.get("next") ?? ""));
  if (next) {
    redirect(next);
  }
}

export async function regenerateGuestToken(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  await createServiceClient()
    .from("guests")
    .update({ token: createGuestToken() })
    .eq("id", id);

  revalidatePath(`/admin/guests/${id}`);
  revalidatePath("/admin/guests");
  redirect(`/admin/guests/${id}?rotated=1`);
}

export async function deleteComment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }
  await createServiceClient().from("comments").delete().eq("id", id);
  revalidatePath("/admin/comments");
  revalidatePath("/");
}

export async function createGift(formData: FormData) {
  const guestId = String(formData.get("guest_id") ?? "") || null;
  const guestName = String(formData.get("guest_name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "angpao") as GiftKind;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!guestName || (kind !== "angpao" && kind !== "physical")) {
    return;
  }

  await createServiceClient()
    .from("gifts")
    .insert({
      guest_id: guestId,
      guest_name: guestName,
      kind,
      amount: amountRaw ? Number(amountRaw) : null,
      note,
    });

  revalidatePath("/admin/gifts");
  redirect("/admin/gifts");
}

export async function deleteGift(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }
  await createServiceClient().from("gifts").delete().eq("id", id);
  revalidatePath("/admin/gifts");
}
