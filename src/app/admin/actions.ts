"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionValue,
} from "@/lib/admin-session";
import { allocateDoorCodes, getGuestByDoorCode, getGuestById, getGuestByToken, getSiteSettings, saveSiteSettings } from "@/lib/db";
import {
  INVITE_SECTIONS,
  mergeSectionOrder,
  combineDateTime,
  dropMatchingPresetColors,
  isInviteSectionId,
  isThemeId,
  mergeSiteSettings,
  sanitizeThemeColors,
  type InviteSectionId,
  type SiteSettings,
} from "@/lib/site-settings";
import { isDoorCodeQuery } from "@/lib/door-code";
import { createGuestToken, parseInviteToken } from "@/lib/guest-token";
import {
  INVITE_MEDIA_BUCKET,
  INVITE_MUSIC_MAX_BYTES,
  INVITE_IMAGE_MAX_BYTES,
  INVITE_VIDEO_MAX_BYTES,
  INVITE_GALLERY_MAX,
  classifyInviteMusic,
  classifyInviteImage,
  classifyInviteVideo,
  inviteMusicContentType,
  inviteMusicObjectPath,
  inviteVisualContentType,
  inviteVisualObjectPath,
  inviteVisualSiblingPaths,
  isInviteVisualSlot,
  isVisualImageSlot,
  objectPathFromPublicUrl,
  otherInviteMusicExt,
  type InviteVisualSlot,
} from "@/lib/invite-media";
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

export async function saveInvitationSettings(formData: FormData) {
  const section = String(formData.get("section") ?? "");
  const current = await getSiteSettings();
  let next = { ...current };

  try {
    if (section === "couple") {
      next = {
        ...next,
        couple: {
          brideName: String(formData.get("brideName") ?? "").trim() || "Bride",
          groomName: String(formData.get("groomName") ?? "").trim() || "Groom",
          brideFullName: String(formData.get("brideFullName") ?? "").trim(),
          groomFullName: String(formData.get("groomFullName") ?? "").trim(),
          brideParents: String(formData.get("brideParents") ?? "").trim(),
          groomParents: String(formData.get("groomParents") ?? "").trim(),
          weddingAt: combineDateTime(
            String(formData.get("weddingDate") ?? "").trim(),
            String(formData.get("weddingTime") ?? "").trim(),
          ),
        },
      };
    } else if (section === "theme") {
      const theme = String(formData.get("theme") ?? "");
      if (!isThemeId(theme)) {
        redirect("/admin/invitation?error=settings");
      }
      next = {
        ...next,
        theme,
        colors: dropMatchingPresetColors(
          theme,
          sanitizeThemeColors(parseJsonPayload(formData.get("payload"))),
        ),
      };
    } else if (section === "events") {
      next = {
        ...next,
        events: [
          {
            id: "ceremony",
            title: String(formData.get("ceremony_title") ?? "").trim() || "Ceremony",
            date: String(formData.get("ceremony_date") ?? "").trim(),
            time: String(formData.get("ceremony_time") ?? "").trim(),
            place: String(formData.get("ceremony_place") ?? "").trim(),
            mapsUrl: String(formData.get("ceremony_maps") ?? "").trim(),
            wazeUrl: String(formData.get("ceremony_waze") ?? "").trim(),
          },
          {
            id: "reception",
            title: String(formData.get("reception_title") ?? "").trim() || "Reception",
            date: String(formData.get("reception_date") ?? "").trim(),
            time: String(formData.get("reception_time") ?? "").trim(),
            place: String(formData.get("reception_place") ?? "").trim(),
            mapsUrl: String(formData.get("reception_maps") ?? "").trim(),
            wazeUrl: String(formData.get("reception_waze") ?? "").trim(),
          },
        ],
      };
    } else if (section === "whatsapp") {
      const payload = asRecordList(parseJsonPayload(formData.get("payload")));
      if (payload.length === 0) {
        redirect("/admin/invitation?error=settings");
      }
      next = {
        ...next,
        whatsappTemplates: payload.map((item, index) => ({
          id: String(item.id ?? `tpl-${index + 1}`),
          name: String(item.name ?? "").trim() || `Template ${index + 1}`,
          body: String(item.body ?? "").trim(),
        })),
      };
    } else if (section === "banks") {
      const payload = asRecordList(parseJsonPayload(formData.get("payload")));
      next = {
        ...next,
        bankAccounts: payload.map((item) => ({
          bank: String(item.bank ?? "").trim(),
          holder: String(item.holder ?? "").trim(),
          number: String(item.number ?? "").trim(),
        })),
      };
    } else if (section === "faq") {
      const payload = asRecordList(parseJsonPayload(formData.get("payload")));
      next = {
        ...next,
        faq: payload.map((item) => ({
          question: String(item.question ?? "").trim(),
          answer: String(item.answer ?? "").trim(),
        })),
      };
    } else if (section === "dress") {
      const payload = asRecordList(parseJsonPayload(formData.get("payload")));
      next = {
        ...next,
        dressCode: {
          label: String(formData.get("label") ?? "").trim(),
          note: String(formData.get("note") ?? "").trim(),
          colors: payload.map((item) => ({
            name: String(item.name ?? "").trim(),
            hex: String(item.hex ?? "").trim() || "#d4b896",
          })),
        },
      };
    } else if (section === "guestTypes") {
      const payload = parseJsonPayload(formData.get("payload"));
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        redirect("/admin/invitation?error=settings");
      }
      next = mergeSiteSettings({
        ...next,
        guestTypes: payload as SiteSettings["guestTypes"],
      });
    } else if (section === "opening") {
      next = {
        ...next,
        copy: {
          ...next.copy,
          coverGreeting: String(formData.get("coverGreeting") ?? "").trim(),
        },
      };
    } else if (section === "sections") {
      const payload = parseJsonPayload(formData.get("payload"));
      const row =
        payload && typeof payload === "object" && !Array.isArray(payload)
          ? (payload as Record<string, unknown>)
          : null;
      const visibleIds = Array.isArray(row?.visible)
        ? row.visible.map(String)
        : Array.isArray(payload)
          ? payload.map(String)
          : [];
      const selected = new Set(visibleIds);
      next = {
        ...next,
        sectionOrder: mergeSectionOrder(row?.order),
        sections: Object.fromEntries(
          INVITE_SECTIONS.map((item) => [item.id, selected.has(item.id)]),
        ) as Record<InviteSectionId, boolean>,
      };
    } else if (section === "copy") {
      const payload = parseJsonPayload(formData.get("payload"));
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        redirect("/admin/invitation?error=settings");
      }
      next = mergeSiteSettings({
        ...next,
        copy: {
          ...next.copy,
          ...(payload as Partial<SiteSettings["copy"]>),
        },
      });
    } else if (section === "mediaGallery") {
      const payload = parseJsonPayload(formData.get("payload"));
      const requested = Array.isArray(payload) ? payload.map(String) : [];
      const allowed = new Set(next.media.gallery);
      const ordered = requested.filter((url) => allowed.has(url));
      for (const url of next.media.gallery) {
        if (!ordered.includes(url)) {
          ordered.push(url);
        }
      }
      next = {
        ...next,
        media: { ...next.media, gallery: ordered },
      };
    } else if (section === "goLive") {
      next = {
        ...next,
        published: formData.get("published") === "on",
        rsvpOpensAt: String(formData.get("rsvpOpensAt") ?? "").trim(),
        rsvpClosesAt: String(formData.get("rsvpClosesAt") ?? "").trim(),
      };
    } else {
      redirect("/admin/invitation?error=settings");
    }

    await saveSiteSettings(next);
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    redirect("/admin/invitation?error=settings");
  }

  revalidateInvite();
  redirect("/admin/invitation?saved=invite");
}

export async function uploadInviteMusic(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/invitation?error=music-type");
  }
  if (file.size > INVITE_MUSIC_MAX_BYTES) {
    redirect("/admin/invitation?error=music-size");
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ext = classifyInviteMusic({
    name: file.name,
    type: file.type,
    header,
  });
  if (!ext) {
    redirect("/admin/invitation?error=music-type");
  }

  const path = inviteMusicObjectPath(ext);
  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const storage = createServiceClient().storage.from(INVITE_MEDIA_BUCKET);
    const { error: uploadError } = await storage.upload(path, bytes, {
      contentType: inviteMusicContentType(ext),
      upsert: true,
      cacheControl: "3600",
    });

    if (uploadError) {
      redirect(musicStorageRedirect(uploadError.message));
    }

    await storage.remove([inviteMusicObjectPath(otherInviteMusicExt(ext))]);

    const { data } = storage.getPublicUrl(path);
    const current = await getSiteSettings();
    await saveSiteSettings({
      ...current,
      musicUrl: `${data.publicUrl}?v=${Date.now()}`,
    });
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    redirect("/admin/invitation?error=music");
  }

  revalidateInvite();
  redirect("/admin/invitation?saved=music");
}

export async function clearInviteMusic() {
  const storage = createServiceClient().storage.from(INVITE_MEDIA_BUCKET);
  await storage.remove([
    inviteMusicObjectPath("mp3"),
    inviteMusicObjectPath("m4a"),
  ]);

  const current = await getSiteSettings();
  try {
    await saveSiteSettings({ ...current, musicUrl: "" });
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    redirect("/admin/invitation?error=settings");
  }

  revalidateInvite();
  redirect("/admin/invitation?saved=music-cleared");
}

export async function prepareInviteVisualUpload(formData: FormData) {
  const slot = String(formData.get("slot") ?? "");
  if (!isInviteVisualSlot(slot)) {
    return { ok: false as const, error: "media-type" as const };
  }

  const index = Number(formData.get("index") ?? -1);
  const sectionId = String(formData.get("sectionId") ?? "");
  const fileName = String(formData.get("fileName") ?? "");
  const fileType = String(formData.get("fileType") ?? "");
  const fileSize = Number(formData.get("fileSize") ?? 0);
  const header = bytesFromBase64(String(formData.get("header") ?? ""));

  const image = isVisualImageSlot(slot);
  const maxBytes = image ? INVITE_IMAGE_MAX_BYTES : INVITE_VIDEO_MAX_BYTES;
  if (!fileSize || fileSize > maxBytes) {
    return { ok: false as const, error: "media-size" as const };
  }

  const current = await getSiteSettings();
  if (slot === "gallery" && current.media.gallery.length >= INVITE_GALLERY_MAX) {
    return { ok: false as const, error: "media-gallery-full" as const };
  }
  if (slot === "party" && (index < 0 || index >= current.copy.weddingParty.length)) {
    return { ok: false as const, error: "media-type" as const };
  }
  if (
    (slot === "backdropImage" || slot === "backdropVideo") &&
    (!isInviteSectionId(sectionId) || sectionId === "qr")
  ) {
    return { ok: false as const, error: "media-type" as const };
  }

  const ext = image
    ? classifyInviteImage({ name: fileName, type: fileType, header })
    : classifyInviteVideo({ name: fileName, type: fileType, header });
  if (!ext) {
    return { ok: false as const, error: "media-type" as const };
  }

  const path = inviteVisualObjectPath(slot, ext, {
    index: slot === "party" ? index : undefined,
    id: slot === "gallery" ? crypto.randomUUID() : undefined,
    section:
      slot === "backdropImage" || slot === "backdropVideo"
        ? sectionId
        : undefined,
  });
  const contentType = inviteVisualContentType(ext);

  try {
    const storage = createServiceClient().storage.from(INVITE_MEDIA_BUCKET);
    const { data, error } = await storage.createSignedUploadUrl(path, {
      upsert: slot !== "gallery",
    });
    if (error || !data?.signedUrl) {
      return {
        ok: false as const,
        error: mediaStorageError(error?.message ?? ""),
      };
    }
    return {
      ok: true as const,
      path: data.path ?? path,
      signedUrl: data.signedUrl,
      token: data.token ?? "",
      contentType,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false as const, error: mediaStorageError(message) };
  }
}

export async function commitInviteVisual(formData: FormData) {
  const slotValue = String(formData.get("slot") ?? "");
  const path = String(formData.get("path") ?? "").replace(/^\/+/, "");
  const index = Number(formData.get("index") ?? -1);
  if (!isInviteVisualSlot(slotValue)) {
    redirect("/admin/invitation?error=media-type");
  }
  const slot = slotValue;
  const sectionId = String(formData.get("sectionId") ?? "");
  if (
    !/^(cover|closing|people|party|gallery|sections)\//.test(path)
  ) {
    redirect("/admin/invitation?error=media-type");
  }
  if (
    (slot === "backdropImage" || slot === "backdropVideo") &&
    (!isInviteSectionId(sectionId) ||
      sectionId === "qr" ||
      !path.startsWith(`sections/${sectionId}/`))
  ) {
    redirect("/admin/invitation?error=media-type");
  }

  const storage = createServiceClient().storage.from(INVITE_MEDIA_BUCKET);
  const { data } = storage.getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;
  const current = await getSiteSettings();

  if (slot === "party" && (index < 0 || index >= current.copy.weddingParty.length)) {
    redirect("/admin/invitation?error=media-type");
  }

  const stale = inviteVisualSiblingPaths(slot, {
    index,
    section: isInviteSectionId(sectionId) ? sectionId : undefined,
  }).filter((item) => item !== path);
  if (stale.length > 0) {
    await storage.remove(stale);
  }

  try {
    await saveSiteSettings(
      applyVisualUrl(
        current,
        slot,
        url,
        index,
        isInviteSectionId(sectionId) ? sectionId : "",
      ),
    );
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    redirect("/admin/invitation?error=settings");
  }

  revalidateInvite();
  redirect("/admin/invitation?saved=media");
}

export async function clearInviteVisual(formData: FormData) {
  const slotValue = String(formData.get("slot") ?? "");
  const index = Number(formData.get("index") ?? -1);
  if (!isInviteVisualSlot(slotValue)) {
    redirect("/admin/invitation?error=media-type");
  }
  const slot = slotValue;

  const current = await getSiteSettings();
  const url = String(formData.get("url") ?? "");
  const sectionId = String(formData.get("sectionId") ?? "");
  const { next, removed } = clearVisualUrl(
    current,
    slot,
    index,
    url,
    isInviteSectionId(sectionId) ? sectionId : "",
  );
  const paths = removed
    .map(objectPathFromPublicUrl)
    .filter((value): value is string => Boolean(value));
  if (paths.length > 0) {
    await createServiceClient().storage.from(INVITE_MEDIA_BUCKET).remove(paths);
  }

  try {
    await saveSiteSettings(next);
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    redirect("/admin/invitation?error=settings");
  }

  revalidateInvite();
  redirect("/admin/invitation?saved=media-cleared");
}

function applyVisualUrl(
  settings: SiteSettings,
  slot: InviteVisualSlot,
  url: string,
  index: number,
  sectionId: InviteSectionId | "",
): SiteSettings {
  const media = { ...settings.media };
  if (slot === "gallery") {
    media.gallery = [...media.gallery, url].slice(0, INVITE_GALLERY_MAX);
  } else if (slot === "party") {
    const party = [...media.party];
    while (party.length <= index) {
      party.push("");
    }
    party[index] = url;
    media.party = party;
  } else if (slot === "backdropImage" || slot === "backdropVideo") {
    if (!sectionId) {
      return settings;
    }
    const current = media.backdrops[sectionId] ?? { image: "", video: "" };
    media.backdrops = {
      ...media.backdrops,
      [sectionId]: {
        ...current,
        [slot === "backdropImage" ? "image" : "video"]: url,
      },
    };
    if (sectionId === "closing") {
      if (slot === "backdropImage") {
        media.closingImage = url;
      } else {
        media.closingVideo = url;
      }
    }
  } else {
    media[slot] = url;
  }
  return { ...settings, media };
}

function clearVisualUrl(
  settings: SiteSettings,
  slot: InviteVisualSlot,
  index: number,
  url = "",
  sectionId: InviteSectionId | "" = "",
) {
  const media = { ...settings.media };
  const removed: string[] = [];
  if (slot === "gallery") {
    const found = url ? media.gallery.indexOf(url) : index;
    if (found >= 0 && found < media.gallery.length) {
      removed.push(media.gallery[found]);
      media.gallery = media.gallery.filter((_, item) => item !== found);
    }
  } else if (slot === "party") {
    const party = [...media.party];
    if (index >= 0) {
      if (party[index]) {
        removed.push(party[index]);
      }
      party[index] = "";
      media.party = party;
    }
  } else if (slot === "backdropImage" || slot === "backdropVideo") {
    if (sectionId) {
      const current = media.backdrops[sectionId] ?? { image: "", video: "" };
      const key = slot === "backdropImage" ? "image" : "video";
      if (current[key]) {
        removed.push(current[key]);
      }
      media.backdrops = {
        ...media.backdrops,
        [sectionId]: { ...current, [key]: "" },
      };
      if (sectionId === "closing") {
        const legacy = slot === "backdropImage" ? "closingImage" : "closingVideo";
        if (media[legacy] && media[legacy] !== current[key]) {
          removed.push(media[legacy]);
        }
        media[legacy] = "";
      }
    }
  } else if (media[slot]) {
    removed.push(media[slot]);
    media[slot] = "";
  }
  return { next: { ...settings, media }, removed };
}

function bytesFromBase64(value: string) {
  if (!value) {
    return new Uint8Array();
  }
  return new Uint8Array(Buffer.from(value, "base64"));
}

function mediaStorageError(message: string) {
  if (/bucket/i.test(message) || /not found/i.test(message)) {
    return "media-storage" as const;
  }
  return "media" as const;
}

function revalidateInvite() {
  revalidatePath("/");
  revalidatePath("/g", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/invitation");
  revalidatePath("/admin/invitation/preview");
}

function musicStorageRedirect(message: string) {
  if (/bucket/i.test(message) || /not found/i.test(message)) {
    return "/admin/invitation?error=music-storage";
  }
  return "/admin/invitation?error=music";
}

function parseJsonPayload(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string" || !value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asRecordList(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

export async function setInviteSent(id: string, sent: boolean) {
  if (!id) {
    return { ok: false };
  }

  const { error } = await createServiceClient()
    .from("guests")
    .update({ invite_sent_at: sent ? new Date().toISOString() : null })
    .eq("id", id);

  if (error) {
    return { ok: false };
  }

  revalidatePath("/admin/guests");
  revalidatePath(`/admin/guests/${id}`);
  return { ok: true };
}

export async function markInviteSent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const sent = formData.get("sent") !== "0";
  const next = String(formData.get("next") ?? "/admin/guests");
  const result = await setInviteSent(id, sent);
  redirect(`${guestPath(next)}${result.ok ? "?saved=sent" : "?error=sent"}`);
}

export async function resetCheckIns() {
  const { error } = await createServiceClient()
    .from("guests")
    .update({
      checked_in_at: null,
      arrived_count: null,
      check_in_method: null,
    })
    .gte("invited_count", 1);

  if (error) {
    redirect("/admin/invitation?error=reset");
  }

  revalidateAdminData();
  redirect("/admin/invitation?saved=reset-door");
}

export async function resetGuestbook() {
  const { error } = await createServiceClient()
    .from("comments")
    .delete()
    .gt("created_at", "1970-01-01");

  if (error) {
    redirect("/admin/invitation?error=reset");
  }

  revalidateAdminData();
  redirect("/admin/invitation?saved=reset-guestbook");
}

export async function resetGifts() {
  const { error } = await createServiceClient()
    .from("gifts")
    .delete()
    .gt("received_at", "1970-01-01");

  if (error) {
    redirect("/admin/invitation?error=reset");
  }

  revalidateAdminData();
  redirect("/admin/invitation?saved=reset-gifts");
}

export async function wipeGuests(formData: FormData) {
  if (String(formData.get("confirm") ?? "").trim() !== "RESET") {
    redirect("/admin/invitation?error=wipe");
  }

  const { error } = await createServiceClient()
    .from("guests")
    .delete()
    .gte("invited_count", 1);

  if (error) {
    redirect("/admin/invitation?error=reset");
  }

  revalidateAdminData();
  redirect("/admin/invitation?saved=wipe");
}

function guestPath(next: string) {
  return next.startsWith("/admin/guests") ? next.split("?")[0] : "/admin/guests";
}

function revalidateAdminData() {
  revalidatePath("/");
  revalidatePath("/g", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/invitation");
  revalidatePath("/admin/guests");
  revalidatePath("/admin/door");
  revalidatePath("/admin/rsvp");
  revalidatePath("/admin/comments");
  revalidatePath("/admin/gifts");
}
