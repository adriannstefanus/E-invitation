import {
  bankAccounts,
  dressCode,
  events,
  faq,
  families,
  instagram,
  liveStream,
  loveStory,
  personDetails,
  rundown,
  stay,
  verse,
  weddingParty,
} from "@/data/content";
import { formatDoorCode } from "@/lib/door-code-format";
import {
  GUEST_TYPES,
  guestInviteName,
  type Guest,
  type GuestType,
  type InviteEvent,
} from "@/lib/types";

export const THEME_IDS = ["cream", "sage", "burgundy", "navy", "blush"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export type InviteEventDetails = {
  id: "ceremony" | "reception";
  title: string;
  date: string;
  time: string;
  place: string;
  mapsUrl: string;
  wazeUrl: string;
};

export type BankAccount = {
  bank: string;
  holder: string;
  number: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type DressColor = {
  name: string;
  hex: string;
};

export type WhatsAppTemplate = {
  id: string;
  name: string;
  body: string;
};

export type GuestTypeStyle = {
  label: string;
  bg: string;
  fg: string;
};

export const INVITE_SECTIONS = [
  { id: "qr", label: "QR / door code" },
  { id: "couple", label: "The couple" },
  { id: "verse", label: "Verse" },
  { id: "parents", label: "Parents" },
  { id: "countdown", label: "Countdown" },
  { id: "bride", label: "Bride detail" },
  { id: "groom", label: "Groom detail" },
  { id: "loveStory", label: "Love story" },
  { id: "weddingParty", label: "Wedding party" },
  { id: "events", label: "Event details" },
  { id: "location", label: "Location" },
  { id: "rundown", label: "Rundown" },
  { id: "dressCode", label: "Dress code" },
  { id: "stay", label: "Stay and travel" },
  { id: "liveStream", label: "Live stream" },
  { id: "instagram", label: "Instagram" },
  { id: "rsvp", label: "RSVP" },
  { id: "gallery", label: "Gallery" },
  { id: "gifts", label: "Gifts" },
  { id: "faq", label: "FAQ" },
  { id: "comments", label: "Guestbook" },
  { id: "closing", label: "Closing" },
] as const;

export type InviteSectionId = (typeof INVITE_SECTIONS)[number]["id"];

export type InviteCopy = {
  coverGreeting: string;
  verse: { label: string; text: string; source: string };
  families: {
    bride: { title: string; names: string };
    groom: { title: string; names: string };
  };
  loveStory: { year: string; title: string; text: string }[];
  weddingParty: { name: string; role: string }[];
  rundown: { time: string; title: string }[];
  stay: { name: string; detail: string; mapsUrl: string };
  liveStream: { label: string; url: string };
  instagram: { hashtag: string; filterUrl: string };
};

export type SiteSettings = {
  theme: ThemeId;
  couple: {
    brideName: string;
    groomName: string;
    brideFullName: string;
    groomFullName: string;
    brideParents: string;
    groomParents: string;
    weddingAt: string;
  };
  events: InviteEventDetails[];
  bankAccounts: BankAccount[];
  faq: FaqItem[];
  dressCode: {
    label: string;
    note: string;
    colors: DressColor[];
  };
  whatsappTemplates: WhatsAppTemplate[];
  colors: ThemeColorOverrides;
  guestTypes: Record<GuestType, GuestTypeStyle>;
  copy: InviteCopy;
  sections: Record<InviteSectionId, boolean>;
  musicUrl: string;
  published: boolean;
  rsvpOpensAt: string;
  rsvpClosesAt: string;
};

export const THEME_PRESETS: Record<
  ThemeId,
  { label: string; hint: string }
> = {
  cream: { label: "Cream", hint: "Warm ivory" },
  sage: { label: "Sage", hint: "Soft green" },
  burgundy: { label: "Burgundy", hint: "Wine" },
  navy: { label: "Navy", hint: "Evening blue" },
  blush: { label: "Blush", hint: "Dusty rose" },
};

export const CUSTOM_THEME_TOKENS = [
  "accent",
  "background",
  "foreground",
] as const;
export type CustomThemeToken = (typeof CUSTOM_THEME_TOKENS)[number];
export type ThemeColorOverrides = Partial<Record<CustomThemeToken, string>>;

export const THEME_PRESET_COLORS: Record<
  ThemeId,
  Record<CustomThemeToken, string>
> = {
  cream: {
    accent: "#8a6a4f",
    background: "#f7f1e8",
    foreground: "#3f3a34",
  },
  sage: {
    accent: "#5c7a62",
    background: "#eef3ea",
    foreground: "#2f3b32",
  },
  burgundy: {
    accent: "#8b3d4a",
    background: "#f6eeec",
    foreground: "#3a2a2c",
  },
  navy: {
    accent: "#3d5a80",
    background: "#eef1f6",
    foreground: "#243044",
  },
  blush: {
    accent: "#c47b86",
    background: "#f8eeed",
    foreground: "#4a3236",
  },
};

export const CUSTOM_THEME_TOKEN_LABELS: Record<CustomThemeToken, string> = {
  accent: "Accent",
  background: "Paper",
  foreground: "Text",
};

export const defaultSiteSettings: SiteSettings = {
  theme: "cream",
  couple: {
    brideName: personDetails.bride.name,
    groomName: personDetails.groom.name,
    brideFullName: personDetails.bride.fullName,
    groomFullName: personDetails.groom.fullName,
    brideParents: personDetails.bride.parents,
    groomParents: personDetails.groom.parents,
    weddingAt: "",
  },
  events: events.map((event) => ({
    ...event,
    date: "",
    time: /^\d{2}:\d{2}/.test(event.time) ? event.time.slice(0, 5) : "",
  })),
  bankAccounts: bankAccounts.map((account) => ({ ...account })),
  faq: faq.map((item) => ({ ...item })),
  dressCode: {
    label: dressCode.label,
    note: dressCode.note,
    colors: dressCode.colors.map((color) => ({ ...color })),
  },
  whatsappTemplates: [
    {
      id: "en",
      name: "English",
      body: "Hi {name},\n\nYou are invited to our wedding:\n{url}\nDoor code: {door_code}",
    },
    {
      id: "id",
      name: "Indonesian",
      body: "Halo {name},\n\nIni undangan pernikahan kami:\n{url}\nKode pintu: {door_code}",
    },
    {
      id: "ceremony",
      name: "Ceremony only",
      body: "Hi {name},\n\nYou are invited to the ceremony:\n{url}\nDoor code: {door_code}",
    },
  ],
  guestTypes: {
    regular: { label: "Regular", bg: "#f4f4f5", fg: "#3f3f46" },
    vip: { label: "VIP", bg: "#fef3c7", fg: "#78350f" },
    family: { label: "Family", bg: "#e7e5e4", fg: "#44403c" },
    vendor: { label: "Vendor", bg: "#e0f2fe", fg: "#0c4a6e" },
  },
  copy: {
    coverGreeting: "you are invited to celebrate with us.",
    verse: { ...verse },
    families: {
      bride: { ...families.bride },
      groom: { ...families.groom },
    },
    loveStory: loveStory.map((beat) => ({ ...beat })),
    weddingParty: weddingParty.map((person) => ({ ...person })),
    rundown: rundown.map((item) => ({ ...item })),
    stay: { ...stay },
    liveStream: { ...liveStream },
    instagram: { ...instagram },
  },
  sections: Object.fromEntries(
    INVITE_SECTIONS.map((section) => [section.id, true]),
  ) as Record<InviteSectionId, boolean>,
  musicUrl: "",
  published: true,
  rsvpOpensAt: "",
  rsvpClosesAt: "",
  colors: {},
};

export function isThemeId(value: string): value is ThemeId {
  return (THEME_IDS as readonly string[]).includes(value);
}

export function eventsForInvite(
  allEvents: InviteEventDetails[],
  invitedTo: InviteEvent = "both",
) {
  if (invitedTo === "both") {
    return allEvents;
  }
  return allEvents.filter((event) => event.id === invitedTo);
}

export function mergeSiteSettings(raw: unknown): SiteSettings {
  const parsed =
    raw && typeof raw === "object" ? (raw as Partial<SiteSettings>) : {};
  const guestTypes = { ...defaultSiteSettings.guestTypes };
  for (const type of GUEST_TYPES) {
    guestTypes[type] = {
      ...defaultSiteSettings.guestTypes[type],
      ...(parsed.guestTypes?.[type] ?? {}),
    };
  }

  const theme = parsed.theme ?? "";
  return {
    theme: isThemeId(theme) ? theme : defaultSiteSettings.theme,
    couple: { ...defaultSiteSettings.couple, ...parsed.couple },
    events:
      Array.isArray(parsed.events) && parsed.events.length > 0
        ? parsed.events.map((event, index) => ({
            ...(defaultSiteSettings.events[index] ??
              defaultSiteSettings.events[0]),
            ...event,
          }))
        : defaultSiteSettings.events,
    bankAccounts: Array.isArray(parsed.bankAccounts)
      ? parsed.bankAccounts
      : defaultSiteSettings.bankAccounts,
    faq: Array.isArray(parsed.faq) ? parsed.faq : defaultSiteSettings.faq,
    dressCode: {
      ...defaultSiteSettings.dressCode,
      ...parsed.dressCode,
      colors: parsed.dressCode?.colors ?? defaultSiteSettings.dressCode.colors,
    },
    whatsappTemplates:
      Array.isArray(parsed.whatsappTemplates) &&
      parsed.whatsappTemplates.length > 0
        ? parsed.whatsappTemplates
        : defaultSiteSettings.whatsappTemplates,
    guestTypes,
    copy: mergeCopy(parsed.copy),
    sections: mergeSections(parsed.sections),
    musicUrl:
      typeof parsed.musicUrl === "string"
        ? parsed.musicUrl
        : defaultSiteSettings.musicUrl,
    published:
      typeof parsed.published === "boolean"
        ? parsed.published
        : defaultSiteSettings.published,
    rsvpOpensAt:
      typeof parsed.rsvpOpensAt === "string"
        ? parsed.rsvpOpensAt
        : defaultSiteSettings.rsvpOpensAt,
    rsvpClosesAt:
      typeof parsed.rsvpClosesAt === "string"
        ? parsed.rsvpClosesAt
        : defaultSiteSettings.rsvpClosesAt,
    colors: sanitizeThemeColors(parsed.colors),
  };
}

function mergeCopy(raw: Partial<InviteCopy> | undefined): InviteCopy {
  const copy = raw ?? {};
  return {
    coverGreeting:
      copy.coverGreeting ?? defaultSiteSettings.copy.coverGreeting,
    verse: { ...defaultSiteSettings.copy.verse, ...copy.verse },
    families: {
      bride: {
        ...defaultSiteSettings.copy.families.bride,
        ...copy.families?.bride,
      },
      groom: {
        ...defaultSiteSettings.copy.families.groom,
        ...copy.families?.groom,
      },
    },
    loveStory: Array.isArray(copy.loveStory)
      ? copy.loveStory
      : defaultSiteSettings.copy.loveStory,
    weddingParty: Array.isArray(copy.weddingParty)
      ? copy.weddingParty
      : defaultSiteSettings.copy.weddingParty,
    rundown: Array.isArray(copy.rundown)
      ? copy.rundown
      : defaultSiteSettings.copy.rundown,
    stay: { ...defaultSiteSettings.copy.stay, ...copy.stay },
    liveStream: {
      ...defaultSiteSettings.copy.liveStream,
      ...copy.liveStream,
    },
    instagram: {
      ...defaultSiteSettings.copy.instagram,
      ...copy.instagram,
    },
  };
}

function mergeSections(
  raw: Partial<Record<InviteSectionId, boolean>> | undefined,
): Record<InviteSectionId, boolean> {
  const sections = { ...defaultSiteSettings.sections };
  for (const section of INVITE_SECTIONS) {
    const value = raw?.[section.id];
    if (typeof value === "boolean") {
      sections[section.id] = value;
    }
  }
  return sections;
}

export function isSectionVisible(
  settings: SiteSettings,
  id: InviteSectionId,
) {
  return settings.sections[id] !== false;
}

export function fillCoverGreeting(greeting: string, guestName: string) {
  return greeting.replaceAll("{name}", guestName);
}

export function rsvpWindowState(
  opensAt: string,
  closesAt: string,
  now = new Date(),
): "soon" | "open" | "closed" {
  const start = opensAt ? new Date(`${opensAt}T00:00:00`) : null;
  const end = closesAt ? new Date(`${closesAt}T23:59:59`) : null;
  if (start && !Number.isNaN(start.getTime()) && now < start) {
    return "soon";
  }
  if (end && !Number.isNaN(end.getTime()) && now > end) {
    return "closed";
  }
  return "open";
}

export function fillWhatsAppTemplate(
  body: string,
  guest: Guest,
  inviteUrl: string,
) {
  const eventLabel =
    guest.invited_to === "ceremony"
      ? "ceremony"
      : guest.invited_to === "reception"
        ? "reception"
        : "ceremony and reception";
  return body
    .replaceAll("{name}", guestInviteName(guest))
    .replaceAll("{url}", inviteUrl)
    .replaceAll(
      "{door_code}",
      guest.door_code ? formatDoorCode(guest.door_code) : "",
    )
    .replaceAll("{event}", eventLabel)
    .trim();
}

export function dateInputValue(value: string) {
  if (!value) {
    return "";
  }
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }
  return localDateTimeParts(value)?.date ?? "";
}

export function timeInputValue(value: string) {
  if (!value) {
    return "";
  }
  if (/^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }
  if (!/[T ]/.test(value)) {
    return "";
  }
  return localDateTimeParts(value)?.time ?? "";
}

export function combineDateTime(date: string, time: string) {
  if (!date) {
    return "";
  }
  return time ? `${date}T${time}` : date;
}

export function formatWeddingWhen(weddingAt: string) {
  const date = toLocalDate(weddingAt);
  if (!date) {
    return weddingAt || null;
  }
  const hasTime = Boolean(timeInputValue(weddingAt));
  return date.toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(hasTime ? { hour: "2-digit" as const, minute: "2-digit" as const } : {}),
  });
}

export function formatEventWhen(date: string, time: string) {
  return formatWeddingWhen(combineDateTime(date, time));
}

export function countdownTarget(weddingAt: string) {
  return toLocalDate(weddingAt)?.getTime() ?? Number.NaN;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function localDateTimeParts(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function toLocalDate(value: string) {
  const date = dateInputValue(value);
  const time = timeInputValue(value);
  if (!date) {
    return null;
  }
  const parsed = new Date(`${date}T${time || "00:00"}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseThemeColor(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const hex = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return hex.toLowerCase();
  }
  const short = hex.match(/^#([0-9a-f]{3})$/i);
  if (!short) {
    return null;
  }
  const [a, b, c] = short[1];
  return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
}

export function sanitizeThemeColors(raw: unknown): ThemeColorOverrides {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const input = raw as Record<string, unknown>;
  const colors: ThemeColorOverrides = {};
  for (const token of CUSTOM_THEME_TOKENS) {
    const parsed = parseThemeColor(input[token]);
    if (parsed) {
      colors[token] = parsed;
    }
  }
  return colors;
}

export function dropMatchingPresetColors(
  theme: ThemeId,
  colors: ThemeColorOverrides,
): ThemeColorOverrides {
  const next: ThemeColorOverrides = {};
  for (const token of CUSTOM_THEME_TOKENS) {
    const value = colors[token];
    if (value && value !== THEME_PRESET_COLORS[theme][token]) {
      next[token] = value;
    }
  }
  return next;
}

export function themeTokenValue(
  theme: ThemeId,
  colors: ThemeColorOverrides,
  token: CustomThemeToken,
) {
  return colors[token] ?? THEME_PRESET_COLORS[theme][token];
}

export function inviteThemeStyle(colors: ThemeColorOverrides) {
  const style: Record<string, string> = {};
  for (const token of CUSTOM_THEME_TOKENS) {
    const value = colors[token];
    if (value) {
      style[`--${token}`] = value;
    }
  }
  return style;
}
