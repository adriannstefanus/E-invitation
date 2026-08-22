import {
  bankAccounts,
  dressCode,
  events,
  faq,
  personDetails,
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
  guestTypes: Record<GuestType, GuestTypeStyle>;
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
  };
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
