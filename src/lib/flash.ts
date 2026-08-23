export type FlashTone = "success" | "error" | "warning";

export type Flash = {
  tone: FlashTone;
  message: string;
};

export const FLASH_PARAM_KEYS = [
  "imported",
  "import",
  "error",
  "detail",
  "saved",
  "arrived",
  "undone",
  "rsvp",
  "rotated",
] as const;

export function flashFromSearchParams(
  params: { get(name: string): string | null },
  pathname: string,
): Flash | null {
  if (pathname === "/admin/login") {
    return null;
  }

  const imported = params.get("imported");
  if (imported) {
    return {
      tone: "success",
      message: `Imported ${imported} guest${imported === "1" ? "" : "s"}.`,
    };
  }

  if (params.get("import") === "empty") {
    return { tone: "warning", message: "The CSV was empty." };
  }

  if (params.get("import") === "error") {
    return {
      tone: "error",
      message: "Could not import the CSV. Check the file and try again.",
    };
  }

  if (params.get("error") === "settings") {
    return {
      tone: "error",
      message: "Could not save invitation settings. Run the site_settings SQL if this is the first time.",
    };
  }

  if (params.get("error") === "sent") {
    return {
      tone: "error",
      message: "Could not mark invite sent. Run supabase/migrate-invite-sent.sql.",
    };
  }

  if (params.get("error") === "reset") {
    return { tone: "error", message: "Could not reset that data. Try again." };
  }

  if (params.get("error") === "wipe") {
    return { tone: "error", message: "Type RESET to wipe all guests." };
  }

  if (params.get("error") === "create") {
    const detail = params.get("detail");
    return {
      tone: "error",
      message: detail
        ? `Could not save the guest: ${detail}`
        : "Could not save the guest. Try again.",
    };
  }

  if (params.get("saved") === "invite") {
    return { tone: "success", message: "Invitation settings saved." };
  }

  if (params.get("saved") === "sent") {
    return { tone: "success", message: "Invite sent status updated." };
  }

  if (params.get("saved") === "reset-door") {
    return { tone: "warning", message: "All check-ins were cleared." };
  }

  if (params.get("saved") === "reset-guestbook") {
    return { tone: "warning", message: "Guestbook wishes were deleted." };
  }

  if (params.get("saved") === "reset-gifts") {
    return { tone: "warning", message: "Logged gifts were deleted." };
  }

  if (params.get("saved") === "wipe") {
    return { tone: "warning", message: "All guests were deleted." };
  }

  if (params.get("saved")) {
    return { tone: "success", message: "Guest details saved." };
  }

  if (params.get("arrived")) {
    return { tone: "success", message: "Marked as arrived." };
  }

  if (params.get("undone")) {
    return { tone: "warning", message: "Check-in was undone." };
  }

  if (params.get("rsvp")) {
    return { tone: "success", message: "RSVP updated." };
  }

  if (params.get("rotated")) {
    return {
      tone: "warning",
      message: "Invite link was rotated. The old QR no longer works.",
    };
  }

  return null;
}
