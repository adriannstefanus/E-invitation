"use client";

import { useState, type ReactNode } from "react";
import {
  clearInviteMusic,
  resetCheckIns,
  resetGifts,
  resetGuestbook,
  saveInvitationSettings,
  uploadInviteMusic,
  wipeGuests,
} from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/AdminControls";
import {
  Group,
  ItemHeading,
  LaterItems,
  fieldClass,
} from "@/components/admin/InvitationChrome";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { INVITE_MUSIC_ACCEPT } from "@/lib/invite-media";
import {
  inviteSectionLabel,
  orderedInviteSections,
  type InviteCopy,
  type InviteSectionId,
  type SiteSettings,
} from "@/lib/site-settings";

export function InviteCopyGroup({ settings }: { settings: SiteSettings }) {
  return (
    <Group id="copy" title="Invite copy" status="mixed">
      <OpeningForm settings={settings} />
      <div className="mt-8 border-t border-zinc-100 pt-8">
        <SectionsForm settings={settings} />
      </div>
      <div className="mt-8 border-t border-zinc-100 pt-8">
        <CopyForm settings={settings} />
      </div>
      <div className="mt-8">
        <LaterItems
          items={[
            "English / Indonesian for the whole invite",
            "Photo and video upload",
          ]}
        />
      </div>
    </Group>
  );
}

function OpeningForm({ settings }: { settings: SiteSettings }) {
  return (
    <div>
      <ItemHeading>Cover greeting</ItemHeading>
      <form action={saveInvitationSettings} className="space-y-3">
        <input type="hidden" name="section" value="opening" />
        <label className="block text-sm">
          Cover greeting
          <textarea
            name="coverGreeting"
            rows={3}
            defaultValue={settings.copy.coverGreeting}
            className={fieldClass}
          />
          <span className="mt-1 block text-xs text-zinc-500">
            Shown after “Dear {"{name}"}”. You can also put {"{name}"} in this
            text.
          </span>
        </label>
        <SaveButton />
      </form>
      <div className="mt-8 border-t border-zinc-100 pt-8">
        <ItemHeading>Background music</ItemHeading>
        <p className="mb-3 text-sm text-zinc-600">
          MP3 or M4A, up to 10 MB. MP3 plays everywhere; M4A is what iPhones
          usually export. The song starts when a guest opens the invite, then
          loops. They can mute it with ♪.
        </p>
        {settings.musicUrl ? (
          <div className="mb-4 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3">
            <p className="text-sm text-zinc-700">
              Current song ({musicKindLabel(settings.musicUrl)}) is on the
              invite.
            </p>
            <audio
              controls
              preload="metadata"
              src={settings.musicUrl}
              className="w-full"
            />
            <form action={clearInviteMusic}>
              <ConfirmSubmit
                label="Remove song"
                confirmLabel="Remove background music from the invite?"
                pendingLabel="Removing…"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-white"
              />
            </form>
          </div>
        ) : (
          <p className="mb-3 text-xs text-zinc-500">
            No song yet. The ♪ button stays hidden until you upload one.
          </p>
        )}
        <form action={uploadInviteMusic} className="space-y-3">
          <label className="block text-sm">
            Upload MP3 or M4A
            <input
              name="file"
              type="file"
              accept={INVITE_MUSIC_ACCEPT}
              required
              className={`${fieldClass} file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-sm file:text-white`}
            />
          </label>
          <SubmitButton
            pendingLabel="Uploading…"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            Upload song
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

function musicKindLabel(url: string) {
  if (/\.m4a(\?|$)/i.test(url)) {
    return "M4A";
  }
  if (/\.mp3(\?|$)/i.test(url)) {
    return "MP3";
  }
  return "audio";
}

function SectionsForm({ settings }: { settings: SiteSettings }) {
  const [order, setOrder] = useState<InviteSectionId[]>(() =>
    orderedInviteSections(settings),
  );
  const [visible, setVisible] = useState<InviteSectionId[]>(() =>
    orderedInviteSections(settings).filter(
      (id) => settings.sections[id] !== false,
    ),
  );

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= order.length) {
      return;
    }
    setOrder((current) => {
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  }

  return (
    <div>
      <ItemHeading>Show, hide, and order</ItemHeading>
      <p className="mb-3 text-sm text-zinc-600">
        Cover stays first. Unchecked sections stay in this list so their place
        is kept when you show them again.
      </p>
      <form action={saveInvitationSettings} className="space-y-3">
        <input type="hidden" name="section" value="sections" />
        <input
          type="hidden"
          name="payload"
          value={JSON.stringify({ order, visible })}
        />
        <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
          {order.map((id, index) => (
            <li
              key={id}
              className="flex items-center gap-2 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={visible.includes(id)}
                onChange={(event) =>
                  setVisible((current) =>
                    event.target.checked
                      ? [...current, id]
                      : current.filter((item) => item !== id),
                  )
                }
              />
              <span className="flex-1">{inviteSectionLabel(id)}</span>
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40"
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === order.length - 1}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40"
              >
                Down
              </button>
            </li>
          ))}
        </ul>
        <SaveButton />
      </form>
    </div>
  );
}

function CopyForm({ settings }: { settings: SiteSettings }) {
  const [copy, setCopy] = useState<InviteCopy>(settings.copy);

  return (
    <div>
      <ItemHeading>Section copy</ItemHeading>
      <form action={saveInvitationSettings} className="space-y-6">
        <input type="hidden" name="section" value="copy" />
        <input type="hidden" name="payload" value={JSON.stringify(copy)} />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Verse</legend>
          <input
            value={copy.verse.label}
            onChange={(event) =>
              setCopy((current) => ({
                ...current,
                verse: { ...current.verse, label: event.target.value },
              }))
            }
            className={fieldClass + " mt-0"}
            placeholder="Label"
          />
          <textarea
            rows={3}
            value={copy.verse.text}
            onChange={(event) =>
              setCopy((current) => ({
                ...current,
                verse: { ...current.verse, text: event.target.value },
              }))
            }
            className={fieldClass}
            placeholder="Verse"
          />
          <input
            value={copy.verse.source}
            onChange={(event) =>
              setCopy((current) => ({
                ...current,
                verse: { ...current.verse, source: event.target.value },
              }))
            }
            className={fieldClass}
            placeholder="Source"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Parents / families</legend>
          <label className="block text-sm">
            Small label
            <input
              value={copy.families.label}
              onChange={(event) =>
                setCopy((current) => ({
                  ...current,
                  families: { ...current.families, label: event.target.value },
                }))
              }
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Heading
            <input
              value={copy.families.heading}
              onChange={(event) =>
                setCopy((current) => ({
                  ...current,
                  families: { ...current.families, heading: event.target.value },
                }))
              }
              className={fieldClass}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Groom family title
            <input
              value={copy.families.groom.title}
              onChange={(event) =>
                setCopy((current) => ({
                  ...current,
                  families: {
                    ...current.families,
                    groom: {
                      ...current.families.groom,
                      title: event.target.value,
                    },
                  },
                }))
              }
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Groom family names
            <input
              value={copy.families.groom.names}
              onChange={(event) =>
                setCopy((current) => ({
                  ...current,
                  families: {
                    ...current.families,
                    groom: {
                      ...current.families.groom,
                      names: event.target.value,
                    },
                  },
                }))
              }
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Bride family title
            <input
              value={copy.families.bride.title}
              onChange={(event) =>
                setCopy((current) => ({
                  ...current,
                  families: {
                    ...current.families,
                    bride: {
                      ...current.families.bride,
                      title: event.target.value,
                    },
                  },
                }))
              }
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Bride family names
            <input
              value={copy.families.bride.names}
              onChange={(event) =>
                setCopy((current) => ({
                  ...current,
                  families: {
                    ...current.families,
                    bride: {
                      ...current.families.bride,
                      names: event.target.value,
                    },
                  },
                }))
              }
              className={fieldClass}
            />
          </label>
          </div>
        </fieldset>

        <ListEditor
          label="Love story"
          items={copy.loveStory}
          onChange={(loveStory) =>
            setCopy((current) => ({ ...current, loveStory }))
          }
          blank={{ year: "", title: "", text: "" }}
          render={(item, onItem) => (
            <>
              <input
                value={item.year}
                placeholder="Year"
                onChange={(event) => onItem({ ...item, year: event.target.value })}
                className={fieldClass + " mt-0"}
              />
              <input
                value={item.title}
                placeholder="Title"
                onChange={(event) => onItem({ ...item, title: event.target.value })}
                className={fieldClass}
              />
              <textarea
                rows={2}
                value={item.text}
                placeholder="Text"
                onChange={(event) => onItem({ ...item, text: event.target.value })}
                className={fieldClass}
              />
            </>
          )}
        />

        <ListEditor
          label="Wedding party"
          items={copy.weddingParty}
          onChange={(weddingParty) =>
            setCopy((current) => ({ ...current, weddingParty }))
          }
          blank={{ name: "", role: "" }}
          render={(item, onItem) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={item.name}
                placeholder="Name"
                onChange={(event) => onItem({ ...item, name: event.target.value })}
                className={fieldClass + " mt-0"}
              />
              <input
                value={item.role}
                placeholder="Role"
                onChange={(event) => onItem({ ...item, role: event.target.value })}
                className={fieldClass + " mt-0"}
              />
            </div>
          )}
        />

        <ListEditor
          label="Rundown"
          items={copy.rundown}
          onChange={(rundown) => setCopy((current) => ({ ...current, rundown }))}
          blank={{ time: "", title: "" }}
          render={(item, onItem) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="time"
                value={item.time}
                onChange={(event) => onItem({ ...item, time: event.target.value })}
                className={fieldClass + " mt-0"}
              />
              <input
                value={item.title}
                placeholder="Title"
                onChange={(event) => onItem({ ...item, title: event.target.value })}
                className={fieldClass + " mt-0"}
              />
            </div>
          )}
        />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Stay and travel</legend>
          <input
            value={copy.stay.name}
            placeholder="Place"
            onChange={(event) =>
              setCopy((current) => ({
                ...current,
                stay: { ...current.stay, name: event.target.value },
              }))
            }
            className={fieldClass + " mt-0"}
          />
          <textarea
            rows={2}
            value={copy.stay.detail}
            placeholder="Notes"
            onChange={(event) =>
              setCopy((current) => ({
                ...current,
                stay: { ...current.stay, detail: event.target.value },
              }))
            }
            className={fieldClass}
          />
          <input
            value={copy.stay.mapsUrl}
            placeholder="Maps URL"
            onChange={(event) =>
              setCopy((current) => ({
                ...current,
                stay: { ...current.stay, mapsUrl: event.target.value },
              }))
            }
            className={fieldClass}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Live stream</legend>
          <input
            value={copy.liveStream.label}
            placeholder="Label"
            onChange={(event) =>
              setCopy((current) => ({
                ...current,
                liveStream: { ...current.liveStream, label: event.target.value },
              }))
            }
            className={fieldClass + " mt-0"}
          />
          <input
            value={copy.liveStream.url}
            placeholder="Stream URL"
            onChange={(event) =>
              setCopy((current) => ({
                ...current,
                liveStream: { ...current.liveStream, url: event.target.value },
              }))
            }
            className={fieldClass}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Instagram</legend>
          <input
            value={copy.instagram.hashtag}
            placeholder="Hashtag"
            onChange={(event) =>
              setCopy((current) => ({
                ...current,
                instagram: { ...current.instagram, hashtag: event.target.value },
              }))
            }
            className={fieldClass + " mt-0"}
          />
          <input
            value={copy.instagram.filterUrl}
            placeholder="Filter URL"
            onChange={(event) =>
              setCopy((current) => ({
                ...current,
                instagram: {
                  ...current.instagram,
                  filterUrl: event.target.value,
                },
              }))
            }
            className={fieldClass}
          />
        </fieldset>

        <SaveButton />
      </form>
    </div>
  );
}

function ListEditor<T>({
  label,
  items,
  blank,
  onChange,
  render,
}: {
  label: string;
  items: T[];
  blank: T;
  onChange: (items: T[]) => void;
  render: (item: T, onItem: (item: T) => void) => ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{label}</legend>
      {items.map((item, index) => (
        <div key={index} className="space-y-2 rounded-xl border border-zinc-200 p-3">
          {render(item, (next) =>
            onChange(items.map((row, rowIndex) => (rowIndex === index ? next : row))),
          )}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, rowIndex) => rowIndex !== index))}
            className="text-sm text-red-600"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, blank])}
        className="text-sm text-zinc-600"
      >
        Add
      </button>
    </fieldset>
  );
}

export function GoLiveGroup({ settings }: { settings: SiteSettings }) {
  return (
    <Group id="go-live" title="Go live">
      <ItemHeading>Preview and publish</ItemHeading>
      <p className="mb-3 text-sm text-zinc-600">
        Preview is the guest invite. Guests see a coming-soon page until you
        publish.
      </p>
      <a
        href="/admin/invitation/preview"
        target="_blank"
        rel="noreferrer"
        className="mb-6 inline-flex rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
      >
        Open preview
      </a>
      <form action={saveInvitationSettings} className="space-y-3">
        <input type="hidden" name="section" value="goLive" />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={settings.published}
          />
          Published — guests can open the invite
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            RSVP opens
            <input
              name="rsvpOpensAt"
              type="date"
              defaultValue={settings.rsvpOpensAt}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            RSVP closes
            <input
              name="rsvpClosesAt"
              type="date"
              defaultValue={settings.rsvpClosesAt}
              className={fieldClass}
            />
          </label>
        </div>
        <p className="text-xs text-zinc-500">
          Leave a date empty to skip that limit.
        </p>
        <SaveButton />
      </form>
    </Group>
  );
}

export function DangerGroup() {
  return (
    <Group id="tools" title="Danger zone">
      <p className="mb-4 text-sm text-zinc-600">
        These delete live data. Invite links stay unless you wipe guests.
      </p>
      <div className="space-y-4">
        <form
          action={resetCheckIns}
          className="rounded-xl border border-zinc-200 p-3"
        >
          <ItemHeading>Reset check-ins</ItemHeading>
          <p className="mb-2 text-sm text-zinc-600">
            Clear door arrivals. Guests and RSVPs stay.
          </p>
          <ConfirmSubmit
            label="Reset check-ins"
            confirmLabel="Clear every check-in?"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </form>
        <form
          action={resetGuestbook}
          className="rounded-xl border border-zinc-200 p-3"
        >
          <ItemHeading>Reset guestbook</ItemHeading>
          <p className="mb-2 text-sm text-zinc-600">Delete every wish.</p>
          <ConfirmSubmit
            label="Reset guestbook"
            confirmLabel="Delete all guestbook wishes?"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </form>
        <form
          action={resetGifts}
          className="rounded-xl border border-zinc-200 p-3"
        >
          <ItemHeading>Reset gifts</ItemHeading>
          <p className="mb-2 text-sm text-zinc-600">Delete logged gifts.</p>
          <ConfirmSubmit
            label="Reset gifts"
            confirmLabel="Delete all logged gifts?"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </form>
        <form
          action={wipeGuests}
          className="rounded-xl border border-red-200 p-3"
        >
          <ItemHeading>Wipe all guests</ItemHeading>
          <p className="mb-2 text-sm text-zinc-600">
            Deletes guests, invite links, QR codes, and RSVPs. Type RESET.
          </p>
          <input
            name="confirm"
            placeholder="RESET"
            className={fieldClass}
          />
          <div className="mt-3">
            <ConfirmSubmit
              label="Wipe all guests"
              confirmLabel="This deletes every guest and invite link. Continue?"
              className="text-sm text-red-600 hover:underline"
            />
          </div>
        </form>
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

export type { InviteSectionId };
