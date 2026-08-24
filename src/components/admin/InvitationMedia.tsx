"use client";

import { useState } from "react";
import {
  clearInviteVisual,
  commitInviteVisual,
  prepareInviteVisualUpload,
  saveInvitationSettings,
} from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/AdminControls";
import {
  Group,
  ItemHeading,
  fieldClass,
} from "@/components/admin/InvitationChrome";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  INVITE_GALLERY_MAX,
  INVITE_IMAGE_ACCEPT,
  INVITE_VIDEO_ACCEPT,
  type InviteVisualSlot,
} from "@/lib/invite-media";
import {
  SECTION_BACKDROP_IDS,
  uploadedBackdrop,
} from "@/lib/invite-visuals";
import {
  inviteSectionLabel,
  type InviteSectionId,
  type SiteSettings,
} from "@/lib/site-settings";

export function InviteMediaGroup({ settings }: { settings: SiteSettings }) {
  const media = settings.media;
  const party = settings.copy.weddingParty;

  return (
    <Group id="media" title="Photos and video">
      <p className="mb-6 text-sm text-zinc-600">
        Cover, each snap-section backdrop, portraits, gallery, and wedding-party
        faces. Empty slots use the bundled <code>public/media</code> files.
        QR reuses the cover photo. Photos: JPEG, PNG, or WebP, up to 2 MB.
        Videos: MP4, muted loop, up to 8 MB. Run{" "}
        <code>supabase/migrate-invite-media.sql</code> if upload fails.
      </p>

      <ItemHeading>Cover backdrop</ItemHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        <VisualSlot
          label="Cover photo"
          slot="coverImage"
          accept={INVITE_IMAGE_ACCEPT}
          currentUrl={media.coverImage}
          kind="image"
        />
        <VisualSlot
          label="Cover video"
          slot="coverVideo"
          accept={INVITE_VIDEO_ACCEPT}
          currentUrl={media.coverVideo}
          kind="video"
        />
      </div>

      <div className="mt-8 border-t border-zinc-100 pt-8">
        <ItemHeading>Bride and groom portraits</ItemHeading>
        <p className="mb-3 text-xs text-zinc-500">
          Same photos on the couple screen and the bride / groom detail
          screens.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <VisualSlot
            label="Bride"
            slot="bride"
            accept={INVITE_IMAGE_ACCEPT}
            currentUrl={media.bride}
            kind="image"
          />
          <VisualSlot
            label="Groom"
            slot="groom"
            accept={INVITE_IMAGE_ACCEPT}
            currentUrl={media.groom}
            kind="image"
          />
        </div>
      </div>

      <div className="mt-8 border-t border-zinc-100 pt-8">
        <GallerySlots urls={media.gallery} />
      </div>

      <div className="mt-8 border-t border-zinc-100 pt-8">
        <ItemHeading>Wedding party portraits</ItemHeading>
        {party.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Add people under Invite copy first, then upload a face for each.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {party.map((person, index) => (
              <VisualSlot
                key={`${person.role}-${index}`}
                label={`${person.name || "Guest"} · ${person.role || "Role"}`}
                slot="party"
                index={index}
                accept={INVITE_IMAGE_ACCEPT}
                currentUrl={media.party[index] ?? ""}
                kind="image"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-zinc-100 pt-8">
        <ItemHeading>Section backdrops</ItemHeading>
        <p className="mb-4 text-xs text-zinc-500">
          Full-bleed photo behind each screen, plus an optional muted looping
          video. QR is not listed — it uses the cover photo.
        </p>
        <div className="space-y-8">
          {SECTION_BACKDROP_IDS.map((id) => {
            const current = uploadedBackdrop(media, id);
            return (
              <div key={id}>
                <p className="mb-3 text-sm font-medium text-zinc-800">
                  {inviteSectionLabel(id)}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <VisualSlot
                    label="Photo"
                    slot="backdropImage"
                    sectionId={id}
                    accept={INVITE_IMAGE_ACCEPT}
                    currentUrl={current.image}
                    kind="image"
                  />
                  <VisualSlot
                    label="Video"
                    slot="backdropVideo"
                    sectionId={id}
                    accept={INVITE_VIDEO_ACCEPT}
                    currentUrl={current.video}
                    kind="video"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Group>
  );
}

function GallerySlots({ urls }: { urls: string[] }) {
  const [order, setOrder] = useState(urls);

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
      <ItemHeading>Gallery</ItemHeading>
      <p className="mb-3 text-xs text-zinc-500">
        Up to {INVITE_GALLERY_MAX} photos. Empty uses the bundled{" "}
        <code>public/media</code> files if they exist.
      </p>
      {order.length === 0 ? (
        <p className="mb-3 text-sm text-zinc-500">No uploaded gallery photos yet.</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {order.map((url, index) => (
            <li
              key={url}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="h-16 w-16 rounded-md object-cover"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-white"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-white"
                >
                  Down
                </button>
              </div>
              <form action={clearInviteVisual}>
                <input type="hidden" name="slot" value="gallery" />
                <input type="hidden" name="url" value={url} />
                <ConfirmSubmit
                  label="Remove"
                  confirmLabel="Remove this gallery photo?"
                  pendingLabel="Removing…"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-white"
                />
              </form>
            </li>
          ))}
        </ul>
      )}
      {order.length > 1 ? (
        <form action={saveInvitationSettings} className="mb-4">
          <input type="hidden" name="section" value="mediaGallery" />
          <input type="hidden" name="payload" value={JSON.stringify(order)} />
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            Save gallery order
          </SubmitButton>
        </form>
      ) : null}
      {urls.length < INVITE_GALLERY_MAX ? (
        <VisualSlot
          label="Add gallery photo"
          slot="gallery"
          accept={INVITE_IMAGE_ACCEPT}
          currentUrl=""
          kind="image"
        />
      ) : (
        <p className="text-xs text-zinc-500">Gallery is full ({INVITE_GALLERY_MAX}).</p>
      )}
    </div>
  );
}

function VisualSlot({
  label,
  slot,
  index,
  sectionId,
  accept,
  currentUrl,
  kind,
}: {
  label: string;
  slot: InviteVisualSlot;
  index?: number;
  sectionId?: InviteSectionId;
  accept: string;
  currentUrl: string;
  kind: "image" | "video";
}) {
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    setBusy(true);
    const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const prep = new FormData();
    prep.set("slot", slot);
    if (index != null) {
      prep.set("index", String(index));
    }
    if (sectionId) {
      prep.set("sectionId", sectionId);
    }
    prep.set("fileName", file.name);
    prep.set("fileType", file.type);
    prep.set("fileSize", String(file.size));
    prep.set("header", bytesToBase64(header));

    const ready = await prepareInviteVisualUpload(prep);
    if (!ready.ok) {
      window.location.href = `/admin/invitation?error=${ready.error}`;
      return;
    }

    const headers: Record<string, string> = {
      "Content-Type": ready.contentType,
    };
    if (ready.token) {
      headers.Authorization = `Bearer ${ready.token}`;
      headers["x-upsert"] = "true";
    }

    const put = await fetch(ready.signedUrl, {
      method: "PUT",
      headers,
      body: file,
    });
    if (!put.ok) {
      window.location.href = "/admin/invitation?error=media";
      return;
    }

    const commit = new FormData();
    commit.set("slot", slot);
    commit.set("path", ready.path);
    if (index != null) {
      commit.set("index", String(index));
    }
    if (sectionId) {
      commit.set("sectionId", sectionId);
    }
    await commitInviteVisual(commit);
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 px-3 py-3">
      <p className="text-sm font-medium text-zinc-800">{label}</p>
      {currentUrl ? (
        kind === "video" ? (
          <video
            src={currentUrl}
            muted
            controls
            playsInline
            className="max-h-40 w-full rounded-md bg-zinc-100"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt=""
            className="max-h-40 w-full rounded-md object-cover"
          />
        )
      ) : (
        <p className="text-xs text-zinc-500">
          No upload yet. The invite uses the bundled file if it exists.
        </p>
      )}
      <label className="block text-sm">
        <span className="sr-only">{label} file</span>
        <input
          type="file"
          accept={accept}
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) {
              void onFile(file);
            }
          }}
          className={`${fieldClass} file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-sm file:text-white`}
        />
      </label>
      {busy ? <p className="text-xs text-zinc-500">Uploading…</p> : null}
      {currentUrl ? (
        <form action={clearInviteVisual}>
          <input type="hidden" name="slot" value={slot} />
          {index != null ? (
            <input type="hidden" name="index" value={index} />
          ) : null}
          {sectionId ? (
            <input type="hidden" name="sectionId" value={sectionId} />
          ) : null}
          <ConfirmSubmit
            label="Remove upload"
            confirmLabel={`Remove this ${kind}?`}
            pendingLabel="Removing…"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
          />
        </form>
      ) : null}
    </div>
  );
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}
