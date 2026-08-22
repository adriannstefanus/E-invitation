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

  if (params.get("error") === "create") {
    const detail = params.get("detail");
    return {
      tone: "error",
      message: detail
        ? `Could not save the guest: ${detail}`
        : "Could not save the guest. Try again.",
    };
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
