export const INVITE_MEDIA_BUCKET = "invite-media";
export const INVITE_MUSIC_MAX_BYTES = 10 * 1024 * 1024;
export const INVITE_MUSIC_ACCEPT = ".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a";
export const INVITE_MUSIC_OBJECT_BASE = "music/background";

export type InviteMusicExt = "mp3" | "m4a";

const MP3_MIME = new Set(["audio/mpeg", "audio/mp3", "audio/x-mpeg"]);
const M4A_MIME = new Set([
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
]);

export function inviteMusicObjectPath(ext: InviteMusicExt) {
  return `${INVITE_MUSIC_OBJECT_BASE}.${ext}`;
}

export function inviteMusicContentType(ext: InviteMusicExt) {
  return ext === "mp3" ? "audio/mpeg" : "audio/mp4";
}

export function otherInviteMusicExt(ext: InviteMusicExt): InviteMusicExt {
  return ext === "mp3" ? "m4a" : "mp3";
}

export function classifyInviteMusic(input: {
  name: string;
  type: string;
  header: Uint8Array;
}): InviteMusicExt | null {
  const ext = extensionOf(input.name);
  const mime = input.type.trim().toLowerCase();
  const magic = sniffInviteMusic(input.header);

  if (magic === "mp3" && (ext === "mp3" || MP3_MIME.has(mime))) {
    return "mp3";
  }
  if (magic === "m4a" && (ext === "m4a" || M4A_MIME.has(mime))) {
    return "m4a";
  }
  if (!magic && ext === "mp3" && (!mime || MP3_MIME.has(mime))) {
    return "mp3";
  }
  if (!magic && ext === "m4a" && (!mime || M4A_MIME.has(mime))) {
    return "m4a";
  }

  return null;
}

function extensionOf(name: string) {
  const match = name.trim().toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function sniffInviteMusic(header: Uint8Array): InviteMusicExt | null {
  if (header.length >= 3 && header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33) {
    return "mp3";
  }

  if (header.length >= 2 && header[0] === 0xff && (header[1] & 0xe0) === 0xe0) {
    return "mp3";
  }

  if (
    header.length >= 8 &&
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70
  ) {
    return "m4a";
  }

  return null;
}
