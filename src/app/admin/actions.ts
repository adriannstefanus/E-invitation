"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionValue,
} from "@/lib/admin-session";
import { allocateDoorCodes, getGuestByDoorCode, getGuestById, getGuestByToken } from "@/lib/db";
import { isDoorCodeQuery } from "@/lib/door-code";
import { createGuestToken, parseInviteToken } from "@/lib/guest-token";
import { createServiceClient } from "@/lib/supabase";
import {
  isGuestType,
  isRsvpStatus,
  parseInviteEvent,
  type GiftKind,
} from "@/lib/types";

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
  const inviteName = String(formData.get("invite_name") ?? "").trim() || null;
  const guestType = String(formData.get("guest_type") ?? "regular");
  const invitedTo = parseInviteEvent(String(formData.get("invited_to") ?? ""));
  const invitedCount = Math.max(1, Number(formData.get("invited_count") ?? 1));
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name || !isGuestType(guestType)) {
    return;
  }

  try {
    const [doorCode] = await allocateDoorCodes(1);

    const { data, error } = await createServiceClient()
      .from("guests")
      .insert({
        name,
        invite_name: inviteName,
        token: createGuestToken(),
        door_code: doorCode,
        guest_type: guestType,
        invited_to: invitedTo,
        invited_count: invitedCount,
        phone,
        notes,
      })
      .select("id")
      .single();

    if (error || !data) {
      redirect(createGuestError(error?.message ?? "Database rejected the save."));
    }

    revalidatePath("/admin");
    revalidatePath("/admin/guests");
    redirect(`/admin/guests/${data.id}`);
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Unexpected error.";
    redirect(createGuestError(message));
  }
}

function createGuestError(message: string) {
  const detail = encodeURIComponent(message.slice(0, 180));
  return `/admin/guests?error=create&detail=${detail}`;
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function updateGuest(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const inviteName = String(formData.get("invite_name") ?? "").trim() || null;
  const guestType = String(formData.get("guest_type") ?? "regular");
  const invitedTo = parseInviteEvent(String(formData.get("invited_to") ?? ""));
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
      invite_name: inviteName,
      guest_type: guestType,
      invited_to: invitedTo,
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

export async function setGuestRsvp(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("rsvp_status") ?? "");
  if (!id || !isRsvpStatus(status)) {
    return;
  }

  const countRaw = Number(formData.get("rsvp_count") ?? 0);
  const patch =
    status === "pending"
      ? { rsvp_status: "pending", rsvp_count: null, rsvp_at: null }
      : status === "no"
        ? {
            rsvp_status: "no",
            rsvp_count: 0,
            rsvp_at: new Date().toISOString(),
          }
        : {
            rsvp_status: "yes",
            rsvp_count: Math.max(1, countRaw || 1),
            rsvp_at: new Date().toISOString(),
          };

  await createServiceClient().from("guests").update(patch).eq("id", id);
  const token = String(formData.get("token") ?? "");
  revalidatePath("/admin");
  revalidatePath("/admin/guests");
  revalidatePath("/admin/rsvp");
  revalidatePath(`/admin/guests/${id}`);
  if (token) {
    revalidatePath(`/g/${token}`);
  }
  redirect(`/admin/guests/${id}?rsvp=1`);
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

  const headerCells = splitCsvLine(lines[0]).map((cell) => cell.toLowerCase());
  const hasHeader = headerCells.includes("name");
  const start = hasHeader ? 1 : 0;
  const rows = lines
    .slice(start)
    .map((line) => {
      const cells = splitCsvLine(line);
      const name = csvCell(cells, headerCells, hasHeader, ["name"], 0);
      const type = csvCell(cells, headerCells, hasHeader, ["type"], 1);
      const invited = csvCell(
        cells,
        headerCells,
        hasHeader,
        ["invited_count"],
        2,
      );
      const phone = csvCell(cells, headerCells, hasHeader, ["phone"], 3);
      return {
        name,
        invite_name:
          csvCell(cells, headerCells, hasHeader, ["invite_name"], -1) || null,
        token: createGuestToken(),
        guest_type: isGuestType(type.toLowerCase())
          ? type.toLowerCase()
          : "regular",
        invited_to: parseInviteEvent(
          csvCell(cells, headerCells, hasHeader, ["invited_to", "event"], -1),
        ),
        invited_count: Math.max(1, Number(invited) || 1),
        phone: phone || null,
      };
    })
    .filter((row) => row.name);

  if (rows.length > 0) {
    const codes = await allocateDoorCodes(rows.length);
    const { error } = await createServiceClient()
      .from("guests")
      .insert(rows.map((row, index) => ({ ...row, door_code: codes[index] })));
    if (error) {
      redirect("/admin/guests?import=error");
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/guests");
  redirect(`/admin/guests?imported=${rows.length}`);
}

function splitCsvLine(line: string) {
  return line.split(",").map((part) => part.trim());
}

function csvCell(
  cells: string[],
  header: string[],
  hasHeader: boolean,
  names: string[],
  fallbackIndex: number,
) {
  if (hasHeader) {
    for (const name of names) {
      const index = header.indexOf(name);
      if (index >= 0) {
        return cells[index] ?? "";
      }
    }
    return "";
  }
  if (fallbackIndex < 0) {
    return "";
  }
  return cells[fallbackIndex] ?? "";
}

export async function lookupDoorGuest(query: string) {
  const raw = query.trim();
  if (!raw) {
    return { ok: false as const, error: "Enter a door code or scan a QR." };
  }

  const guest = isDoorCodeQuery(raw)
    ? await getGuestByDoorCode(raw)
    : await getGuestByToken(parseInviteToken(raw) ?? raw);

  if (!guest) {
    return { ok: false as const, error: "Guest not found." };
  }

  return { ok: true as const, guest };
}

export async function checkInGuest(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const doorCode = String(formData.get("door_code") ?? "").trim();
  const tokenRaw = String(formData.get("token") ?? "").trim();
  const method =
    String(formData.get("method") ?? "manual") === "qr" ? "qr" : "manual";
  const arrivedRaw = String(formData.get("arrived_count") ?? "").trim();

  let guest = id ? await getGuestById(id) : null;
  if (!guest && isDoorCodeQuery(doorCode || tokenRaw)) {
    guest = await getGuestByDoorCode(doorCode || tokenRaw);
  }
  if (!guest && tokenRaw) {
    const token = parseInviteToken(tokenRaw) ?? tokenRaw;
    guest = await getGuestByToken(token);
  }

  if (!guest) {
    return { ok: false as const, error: "Guest not found." };
  }

  if (guest.checked_in_at) {
    return {
      ok: true as const,
      already: true,
      name: guest.name,
      type: guest.guest_type,
    };
  }

  const defaultCount =
    guest.rsvp_count && guest.rsvp_count > 0
      ? guest.rsvp_count
      : guest.invited_count;
  const arrivedCount = arrivedRaw
    ? Math.min(
        guest.invited_count,
        Math.max(1, Number(arrivedRaw) || 1),
      )
    : defaultCount;

  const { error } = await createServiceClient()
    .from("guests")
    .update({
      checked_in_at: new Date().toISOString(),
      arrived_count: arrivedCount,
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
    name: guest.name,
    type: guest.guest_type,
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
