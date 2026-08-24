export const INVITE_MEDIA_BUCKET = "invite-media";
export const INVITE_MUSIC_MAX_BYTES = 10 * 1024 * 1024;
export const INVITE_MUSIC_ACCEPT = ".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a";
export const INVITE_MUSIC_OBJECT_BASE = "music/background";
export const INVITE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const INVITE_VIDEO_MAX_BYTES = 8 * 1024 * 1024;
export const INVITE_GALLERY_MAX = 12;
export const INVITE_IMAGE_ACCEPT =
  ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
export const INVITE_VIDEO_ACCEPT = ".mp4,video/mp4";

export const INVITE_VISUAL_SLOTS = [
  "coverImage",
  "coverVideo",
  "closingImage",
  "closingVideo",
  "bride",
  "groom",
  "gallery",
  "party",
  "backdropImage",
  "backdropVideo",
] as const;

export type InviteVisualSlot = (typeof INVITE_VISUAL_SLOTS)[number];
export type InviteImageExt = "jpg" | "png" | "webp";
export type InviteVideoExt = "mp4";

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

const IMAGE_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const VIDEO_MIME = new Set(["video/mp4"]);
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"] as const;

export function isInviteVisualSlot(value: string): value is InviteVisualSlot {
  return (INVITE_VISUAL_SLOTS as readonly string[]).includes(value);
}

export function isVisualImageSlot(slot: InviteVisualSlot) {
  return (
    slot !== "coverVideo" &&
    slot !== "closingVideo" &&
    slot !== "backdropVideo"
  );
}

export function inviteVisualObjectPath(
  slot: InviteVisualSlot,
  ext: InviteImageExt | InviteVideoExt,
  extra?: { index?: number; id?: string; section?: string },
) {
  if (slot === "backdropImage" && extra?.section) {
    return `sections/${extra.section}/image.${ext}`;
  }
  if (slot === "backdropVideo" && extra?.section) {
    return `sections/${extra.section}/video.${ext}`;
  }
  if (slot === "coverImage") {
    return `cover/image.${ext}`;
  }
  if (slot === "coverVideo") {
    return `cover/video.${ext}`;
  }
  if (slot === "closingImage") {
    return `closing/image.${ext}`;
  }
  if (slot === "closingVideo") {
    return `closing/video.${ext}`;
  }
  if (slot === "bride") {
    return `people/bride.${ext}`;
  }
  if (slot === "groom") {
    return `people/groom.${ext}`;
  }
  if (slot === "party") {
    return `party/${extra?.index ?? 0}.${ext}`;
  }
  return `gallery/${extra?.id ?? crypto.randomUUID()}.${ext}`;
}

export function inviteVisualSiblingPaths(
  slot: InviteVisualSlot,
  extra?: { index?: number; section?: string },
) {
  if (slot === "backdropVideo" && extra?.section) {
    return [`sections/${extra.section}/video.mp4`];
  }
  if (slot === "backdropImage" && extra?.section) {
    return IMAGE_EXTS.map(
      (ext) =>
        `sections/${extra.section}/image.${ext === "jpeg" ? "jpg" : ext}`,
    );
  }
  if (slot === "coverVideo" || slot === "closingVideo") {
    const base = slot === "coverVideo" ? "cover/video" : "closing/video";
    return [`${base}.mp4`];
  }
  if (slot === "gallery") {
    return [];
  }
  const prefix =
    slot === "coverImage"
      ? "cover/image"
      : slot === "closingImage"
        ? "closing/image"
        : slot === "bride"
          ? "people/bride"
          : slot === "groom"
            ? "people/groom"
            : `party/${extra?.index ?? 0}`;
  return IMAGE_EXTS.map((ext) => `${prefix}.${ext === "jpeg" ? "jpg" : ext}`);
}

export function inviteVisualContentType(ext: InviteImageExt | InviteVideoExt) {
  if (ext === "mp4") {
    return "video/mp4";
  }
  if (ext === "png") {
    return "image/png";
  }
  if (ext === "webp") {
    return "image/webp";
  }
  return "image/jpeg";
}

export function classifyInviteImage(input: {
  name: string;
  type: string;
  header: Uint8Array;
}): InviteImageExt | null {
  const ext = normalizeImageExt(extensionOf(input.name));
  const mime = input.type.trim().toLowerCase();
  const magic = sniffInviteImage(input.header);

  if (magic && (ext === magic || IMAGE_MIME.has(mime) || !ext)) {
    return magic;
  }
  if (!magic && ext && (!mime || IMAGE_MIME.has(mime))) {
    return ext;
  }
  return null;
}

export function classifyInviteVideo(input: {
  name: string;
  type: string;
  header: Uint8Array;
}): InviteVideoExt | null {
  const ext = extensionOf(input.name);
  const mime = input.type.trim().toLowerCase();
  const magic = sniffInviteVideo(input.header);

  if (ext !== "mp4" && mime !== "video/mp4") {
    return null;
  }
  if (magic === "mp4" || (!magic && (ext === "mp4" || VIDEO_MIME.has(mime)))) {
    return "mp4";
  }
  return null;
}

export function objectPathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${INVITE_MEDIA_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

function extensionOf(name: string) {
  const match = name.trim().toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function normalizeImageExt(ext: string): InviteImageExt | "" {
  if (ext === "jpeg" || ext === "jpg") {
    return "jpg";
  }
  if (ext === "png" || ext === "webp") {
    return ext;
  }
  return "";
}

function sniffInviteImage(header: Uint8Array): InviteImageExt | null {
  if (header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return "jpg";
  }
  if (
    header.length >= 4 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47
  ) {
    return "png";
  }
  if (
    header.length >= 12 &&
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

function sniffInviteVideo(header: Uint8Array): InviteVideoExt | null {
  if (
    header.length >= 8 &&
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70
  ) {
    return "mp4";
  }
  return null;
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
