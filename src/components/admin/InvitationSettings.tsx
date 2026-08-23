"use client";

import { useState } from "react";
import { saveInvitationSettings } from "@/app/admin/actions";
import {
  Group,
  ItemHeading,
  LaterItems,
  StatusBadge,
  fieldClass,
} from "@/components/admin/InvitationChrome";
import {
  DangerGroup,
  GoLiveGroup,
  InviteCopyGroup,
} from "@/components/admin/InvitationNext";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  CUSTOM_THEME_TOKENS,
  CUSTOM_THEME_TOKEN_LABELS,
  THEME_IDS,
  THEME_PRESETS,
  THEME_PRESET_COLORS,
  dateInputValue,
  themeTokenValue,
  timeInputValue,
  type BankAccount,
  type CustomThemeToken,
  type DressColor,
  type FaqItem,
  type GuestTypeStyle,
  type SiteSettings,
  type ThemeColorOverrides,
  type ThemeId,
  type WhatsAppTemplate,
} from "@/lib/site-settings";
import { GUEST_TYPES, type GuestType } from "@/lib/types";

const MODULES = [
  {
    href: "#wedding",
    title: "Wedding",
    live: ["Couple names and date", "Event times and venues"],
  },
  {
    href: "#look",
    title: "Look",
    live: ["Theme presets", "Custom colors"],
  },
  {
    href: "#messages",
    title: "WhatsApp",
    live: ["Templates, pick one when sending", "Invite-sent tracker"],
  },
  {
    href: "#banks",
    title: "Gifts",
    live: ["Bank accounts"],
  },
  {
    href: "#guide",
    title: "Guest guide",
    live: ["FAQ", "Dress code"],
  },
  {
    href: "#guest-types",
    title: "Guest types",
    live: ["Labels and badge colors"],
    later: ["Add types beyond the four"],
  },
  {
    href: "#copy",
    title: "Invite copy",
    live: [
      "Cover greeting",
      "Show, hide, and order sections",
      "Verse, parents, story, rundown, party",
      "Background music (MP3 or M4A)",
    ],
    later: ["English / Indonesian", "Photo and video upload"],
  },
  {
    href: "#go-live",
    title: "Go live",
    live: ["Invite preview", "Publish / unpublish", "RSVP window"],
  },
  {
    href: "#tools",
    title: "Danger zone",
    live: [
      "Reset check-ins",
      "Reset guestbook",
      "Reset gifts",
      "Wipe all guests",
    ],
  },
] as const;

export function InvitationSettings({ settings }: { settings: SiteSettings }) {
  return (
    <div className="space-y-6">
      <SettingsIndex />
      <Group id="wedding" title="Wedding">
        <CoupleForm settings={settings} />
        <div className="mt-8 border-t border-zinc-100 pt-8">
          <EventsForm settings={settings} />
        </div>
      </Group>
      <ThemeForm settings={settings} />
      <WhatsAppForm settings={settings} />
      <BanksForm settings={settings} />
      <GuideGroup settings={settings} />
      <GuestTypesForm settings={settings} />
      <InviteCopyGroup settings={settings} />
      <GoLiveGroup settings={settings} />
      <DangerGroup />
    </div>
  );
}

function SettingsIndex() {
  return (
    <nav className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Modules</h2>
      <p className="mt-1 text-sm text-zinc-600">
        <StatusBadge status="live" /> saves to the invite.{" "}
        <StatusBadge status="stub" /> is listed so it stays in this group, but
        it does not work yet.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {MODULES.map((module) => (
          <li key={module.href}>
            <a
              href={module.href}
              className="block rounded-xl border border-zinc-200 px-3 py-2 hover:border-zinc-400"
            >
              <span className="font-medium">{module.title}</span>
              <ModuleItemList
                items={"live" in module ? module.live : undefined}
                status="live"
              />
              <ModuleItemList
                items={"later" in module ? module.later : undefined}
                status="stub"
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ModuleItemList({
  items,
  status,
}: {
  items?: readonly string[];
  status: "live" | "stub";
}) {
  if (!items || items.length === 0) {
    return null;
  }
  return (
    <ul className="mt-2 space-y-1">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center justify-between gap-2 text-xs text-zinc-600"
        >
          <span>{item}</span>
          <StatusBadge status={status} />
        </li>
      ))}
    </ul>
  );
}

function CoupleForm({ settings }: { settings: SiteSettings }) {
  const couple = settings.couple;
  return (
    <div>
      <ItemHeading>Couple names and date</ItemHeading>
      <form action={saveInvitationSettings} className="space-y-3">
        <input type="hidden" name="section" value="couple" />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Bride first name
            <input
              name="brideName"
              defaultValue={couple.brideName}
              required
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Groom first name
            <input
              name="groomName"
              defaultValue={couple.groomName}
              required
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Bride full name
            <input
              name="brideFullName"
              defaultValue={couple.brideFullName}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Groom full name
            <input
              name="groomFullName"
              defaultValue={couple.groomFullName}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Bride parents line
            <input
              name="brideParents"
              defaultValue={couple.brideParents}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Groom parents line
            <input
              name="groomParents"
              defaultValue={couple.groomParents}
              className={fieldClass}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Wedding date
            <input
              name="weddingDate"
              type="date"
              defaultValue={dateInputValue(couple.weddingAt)}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Start time
            <input
              name="weddingTime"
              type="time"
              defaultValue={timeInputValue(couple.weddingAt)}
              className={fieldClass}
            />
          </label>
        </div>
        <SaveButton />
      </form>
    </div>
  );
}

function ThemeForm({ settings }: { settings: SiteSettings }) {
  const [theme, setTheme] = useState<ThemeId>(settings.theme);
  const [colors, setColors] = useState<ThemeColorOverrides>(
    settings.colors ?? {},
  );
  const hasOverrides = CUSTOM_THEME_TOKENS.some((token) => colors[token]);

  function selectTheme(next: ThemeId) {
    setTheme(next);
    setColors({});
  }

  function setToken(token: CustomThemeToken, value: string) {
    const preset = THEME_PRESET_COLORS[theme][token];
    setColors((current) => {
      if (value.toLowerCase() === preset) {
        const next = { ...current };
        delete next[token];
        return next;
      }
      return { ...current, [token]: value.toLowerCase() };
    });
  }

  return (
    <Group id="look" title="Look">
      <form action={saveInvitationSettings} className="space-y-6">
        <input type="hidden" name="section" value="theme" />
        <input type="hidden" name="theme" value={theme} />
        <input type="hidden" name="payload" value={JSON.stringify(colors)} />
        <div>
          <ItemHeading>Theme presets</ItemHeading>
          <p className="mb-3 text-sm text-zinc-600">
            Palette only. Layout and photos stay the same. Admin stays zinc.
          </p>
          <div className="grid gap-2 sm:grid-cols-5">
            {THEME_IDS.map((id) => (
              <label
                key={id}
                className="flex cursor-pointer flex-col rounded-xl border border-zinc-200 p-3 text-sm has-[:checked]:border-zinc-900 has-[:checked]:ring-1 has-[:checked]:ring-zinc-900"
              >
                <input
                  type="radio"
                  name="themeChoice"
                  value={id}
                  checked={theme === id}
                  onChange={() => selectTheme(id)}
                  className="sr-only"
                />
                <span className="font-medium">{THEME_PRESETS[id].label}</span>
                <span className="text-xs text-zinc-500">
                  {THEME_PRESETS[id].hint}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <ItemHeading>Custom colors</ItemHeading>
          <p className="mb-3 text-sm text-zinc-600">
            Optional. Leave a picker on the preset value to keep that token.
            Changing preset clears these.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {CUSTOM_THEME_TOKENS.map((token) => (
              <label key={token} className="block text-sm">
                {CUSTOM_THEME_TOKEN_LABELS[token]}
                <input
                  type="color"
                  value={themeTokenValue(theme, colors, token)}
                  onChange={(event) => setToken(token, event.target.value)}
                  className="mt-1 block h-10 w-full rounded border border-zinc-300"
                />
              </label>
            ))}
          </div>
          {hasOverrides ? (
            <button
              type="button"
              onClick={() => setColors({})}
              className="mt-3 text-sm text-zinc-600"
            >
              Reset to preset
            </button>
          ) : null}
        </div>
        <SaveButton />
      </form>
    </Group>
  );
}

function EventsForm({ settings }: { settings: SiteSettings }) {
  const ceremony =
    settings.events.find((event) => event.id === "ceremony") ??
    settings.events[0];
  const reception =
    settings.events.find((event) => event.id === "reception") ??
    settings.events[1];

  return (
    <div>
      <ItemHeading>Event times and venues</ItemHeading>
      <form action={saveInvitationSettings} className="space-y-6">
        <input type="hidden" name="section" value="events" />
        <EventFields prefix="ceremony" event={ceremony} />
        <EventFields prefix="reception" event={reception} />
        <SaveButton />
      </form>
    </div>
  );
}

function EventFields({
  prefix,
  event,
}: {
  prefix: "ceremony" | "reception";
  event: SiteSettings["events"][number];
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium capitalize">{prefix}</legend>
      <label className="block text-sm">
        Title
        <input
          name={`${prefix}_title`}
          defaultValue={event.title}
          className={fieldClass}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          Date
          <input
            name={`${prefix}_date`}
            type="date"
            defaultValue={dateInputValue(event.date ?? "")}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          Time
          <input
            name={`${prefix}_time`}
            type="time"
            defaultValue={timeInputValue(event.time ?? "")}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block text-sm">
        Place
        <input
          name={`${prefix}_place`}
          defaultValue={event.place}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm">
        Google Maps URL
        <input
          name={`${prefix}_maps`}
          defaultValue={event.mapsUrl}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm">
        Waze URL
        <input
          name={`${prefix}_waze`}
          defaultValue={event.wazeUrl}
          className={fieldClass}
        />
      </label>
    </fieldset>
  );
}

function WhatsAppForm({ settings }: { settings: SiteSettings }) {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(
    settings.whatsappTemplates,
  );

  return (
    <Group id="messages" title="WhatsApp">
      <ItemHeading>Templates</ItemHeading>
      <p className="mb-3 text-sm text-zinc-600">
        Staff pick one of these when they tap WhatsApp. Placeholders:{" "}
        <code>{"{name}"}</code> <code>{"{url}"}</code>{" "}
        <code>{"{door_code}"}</code> <code>{"{event}"}</code>.
      </p>
      <form action={saveInvitationSettings} className="space-y-3">
        <input type="hidden" name="section" value="whatsapp" />
        <input type="hidden" name="payload" value={JSON.stringify(templates)} />
        {templates.map((template, index) => (
          <div
            key={template.id}
            className="space-y-2 rounded-xl border border-zinc-200 p-3"
          >
            <div className="flex gap-2">
              <input
                value={template.name}
                onChange={(event) =>
                  setTemplates((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, name: event.target.value }
                        : item,
                    ),
                  )
                }
                className={fieldClass + " mt-0"}
                placeholder="Template name"
              />
              {templates.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setTemplates((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <textarea
              value={template.body}
              rows={5}
              onChange={(event) =>
                setTemplates((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, body: event.target.value }
                      : item,
                  ),
                )
              }
              className={fieldClass}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setTemplates((current) => [
              ...current,
              {
                id: `tpl-${Date.now()}`,
                name: "New template",
                body: "Hi {name},\n\n{url}\nDoor code: {door_code}",
              },
            ])
          }
          className="text-sm text-zinc-600"
        >
          Add template
        </button>
        <div>
          <SaveButton />
        </div>
      </form>
      <div className="mt-4">
        <p className="mt-4 text-sm text-zinc-600">
          After you pick a template, that guest is marked invite-sent. You can
          also toggle it on the guest list.
        </p>
      </div>
    </Group>
  );
}

function BanksForm({ settings }: { settings: SiteSettings }) {
  const [accounts, setAccounts] = useState<BankAccount[]>(
    settings.bankAccounts,
  );

  return (
    <Group id="banks" title="Gifts">
      <ItemHeading>Bank accounts</ItemHeading>
      <form action={saveInvitationSettings} className="space-y-3">
        <input type="hidden" name="section" value="banks" />
        <input type="hidden" name="payload" value={JSON.stringify(accounts)} />
        {accounts.map((account, index) => (
          <div
            key={`account-${index}`}
            className="grid gap-2 rounded-xl border border-zinc-200 p-3 sm:grid-cols-3"
          >
            <input
              value={account.bank}
              placeholder="Bank"
              onChange={(event) =>
                setAccounts((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, bank: event.target.value }
                      : item,
                  ),
                )
              }
              className={fieldClass + " mt-0"}
            />
            <input
              value={account.holder}
              placeholder="Account name"
              onChange={(event) =>
                setAccounts((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, holder: event.target.value }
                      : item,
                  ),
                )
              }
              className={fieldClass + " mt-0"}
            />
            <div className="flex gap-2">
              <input
                value={account.number}
                placeholder="Number"
                onChange={(event) =>
                  setAccounts((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, number: event.target.value }
                        : item,
                    ),
                  )
                }
                className={fieldClass + " mt-0"}
              />
              <button
                type="button"
                onClick={() =>
                  setAccounts((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setAccounts((current) => [
              ...current,
              { bank: "", holder: "", number: "" },
            ])
          }
          className="text-sm text-zinc-600"
        >
          Add account
        </button>
        <div>
          <SaveButton />
        </div>
      </form>
    </Group>
  );
}

function GuideGroup({ settings }: { settings: SiteSettings }) {
  return (
    <Group id="guide" title="Guest guide">
      <div className="space-y-8">
        <FaqForm settings={settings} />
        <DressForm settings={settings} />
      </div>
    </Group>
  );
}

function FaqForm({ settings }: { settings: SiteSettings }) {
  const [items, setItems] = useState<FaqItem[]>(settings.faq);

  return (
    <form action={saveInvitationSettings} className="space-y-3">
      <ItemHeading>FAQ</ItemHeading>
      <input type="hidden" name="section" value="faq" />
      <input type="hidden" name="payload" value={JSON.stringify(items)} />
      {items.map((item, index) => (
        <div
          key={`faq-${index}`}
          className="space-y-2 rounded-xl border border-zinc-200 p-3"
        >
          <input
            value={item.question}
            placeholder="Question"
            onChange={(event) =>
              setItems((current) =>
                current.map((row, rowIndex) =>
                  rowIndex === index
                    ? { ...row, question: event.target.value }
                    : row,
                ),
              )
            }
            className={fieldClass + " mt-0"}
          />
          <textarea
            value={item.answer}
            placeholder="Answer"
            rows={2}
            onChange={(event) =>
              setItems((current) =>
                current.map((row, rowIndex) =>
                  rowIndex === index
                    ? { ...row, answer: event.target.value }
                    : row,
                ),
              )
            }
            className={fieldClass}
          />
          <button
            type="button"
            onClick={() =>
              setItems((current) =>
                current.filter((_, rowIndex) => rowIndex !== index),
              )
            }
            className="text-sm text-red-600"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setItems((current) => [...current, { question: "", answer: "" }])
        }
        className="text-sm text-zinc-600"
      >
        Add question
      </button>
      <div>
        <SaveButton />
      </div>
    </form>
  );
}

function DressForm({ settings }: { settings: SiteSettings }) {
  const [colors, setColors] = useState<DressColor[]>(
    settings.dressCode.colors,
  );

  return (
    <form action={saveInvitationSettings} className="space-y-3">
      <ItemHeading>Dress code</ItemHeading>
      <input type="hidden" name="section" value="dress" />
      <input type="hidden" name="payload" value={JSON.stringify(colors)} />
      <label className="block text-sm">
        Label
        <input
          name="label"
          defaultValue={settings.dressCode.label}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm">
        Note
        <input
          name="note"
          defaultValue={settings.dressCode.note}
          className={fieldClass}
        />
      </label>
      <div className="flex flex-wrap gap-3">
        {colors.map((color, index) => (
          <div key={`color-${index}`} className="flex items-end gap-2">
            <label className="block text-sm">
              {color.name || "Color"}
              <input
                value={color.name}
                onChange={(event) =>
                  setColors((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, name: event.target.value }
                        : item,
                    ),
                  )
                }
                className={fieldClass}
              />
            </label>
            <input
              type="color"
              value={color.hex}
              onChange={(event) =>
                setColors((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, hex: event.target.value }
                      : item,
                  ),
                )
              }
              className="h-10 w-10 rounded border border-zinc-300"
            />
            <button
              type="button"
              onClick={() =>
                setColors((current) =>
                  current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
              className="text-sm text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          setColors((current) => [...current, { name: "Color", hex: "#d4b896" }])
        }
        className="text-sm text-zinc-600"
      >
        Add color
      </button>
      <div>
        <SaveButton />
      </div>
    </form>
  );
}

function GuestTypesForm({ settings }: { settings: SiteSettings }) {
  const [types, setTypes] = useState<Record<GuestType, GuestTypeStyle>>(
    settings.guestTypes,
  );

  return (
    <Group id="guest-types" title="Guest types" status="mixed">
      <ItemHeading>Labels and badge colors</ItemHeading>
      <p className="mb-3 text-sm text-zinc-600">
        The four types stay the same in the database. You can change the label
        and badge color.
      </p>
      <form action={saveInvitationSettings} className="space-y-3">
        <input type="hidden" name="section" value="guestTypes" />
        <input type="hidden" name="payload" value={JSON.stringify(types)} />
        {GUEST_TYPES.map((type) => (
          <div
            key={type}
            className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 p-3"
          >
            <label className="block min-w-40 flex-1 text-sm">
              {type}
              <input
                value={types[type].label}
                onChange={(event) =>
                  setTypes((current) => ({
                    ...current,
                    [type]: { ...current[type], label: event.target.value },
                  }))
                }
                className={fieldClass}
              />
            </label>
            <label className="block text-sm">
              Badge
              <input
                type="color"
                value={types[type].bg}
                onChange={(event) =>
                  setTypes((current) => ({
                    ...current,
                    [type]: { ...current[type], bg: event.target.value },
                  }))
                }
                className="mt-1 block h-10 w-14 rounded border border-zinc-300"
              />
            </label>
            <label className="block text-sm">
              Text
              <input
                type="color"
                value={types[type].fg}
                onChange={(event) =>
                  setTypes((current) => ({
                    ...current,
                    [type]: { ...current[type], fg: event.target.value },
                  }))
                }
                className="mt-1 block h-10 w-14 rounded border border-zinc-300"
              />
            </label>
            <span
              className="inline-flex rounded-full px-2 py-0.5 text-xs tracking-wide uppercase"
              style={{
                backgroundColor: types[type].bg,
                color: types[type].fg,
              }}
            >
              {types[type].label}
            </span>
          </div>
        ))}
        <SaveButton />
      </form>
      <div className="mt-4">
        <LaterItems items={["Add or remove types (needs a database change)"]} />
      </div>
    </Group>
  );
}

function SaveButton() {
  return (
    <SubmitButton
      pendingLabel="Saving…"
      className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
    >
      Save
    </SubmitButton>
  );
}
