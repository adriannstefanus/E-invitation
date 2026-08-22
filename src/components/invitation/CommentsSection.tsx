"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";

type GuestComment = {
  id: string;
  name: string;
  message: string;
};

const STORAGE_KEY = "invitation-guest-comments";
const COMMENTS_EVENT = "invitation-comments";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(COMMENTS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(COMMENTS_EVENT, onChange);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot() {
  return "[]";
}

function parseComments(raw: string): GuestComment[] {
  try {
    const parsed = JSON.parse(raw) as GuestComment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type CommentsSectionProps = {
  guestName: string;
};

export function CommentsSection({ guestName }: CommentsSectionProps) {
  const defaultName = guestName === "Guest" ? "" : guestName;
  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState("");
  const rawComments = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const comments = useMemo(() => parseComments(rawComments), [rawComments]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    const nextMessage = message.trim();
    if (!nextName || !nextMessage) {
      return;
    }

    const nextComments = [
      { id: crypto.randomUUID(), name: nextName, message: nextMessage },
      ...comments,
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextComments));
    window.dispatchEvent(new Event(COMMENTS_EVENT));
    setMessage("");
  }

  return (
    <InvitationSection image={invitationMedia.comments.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Guest book
      </p>
      <h2 className="font-display mt-3 text-3xl">Leave a wish</h2>
      <form className="mt-4 w-full space-y-2 text-left" onSubmit={handleSubmit}>
        <label className="block">
          <span className="sr-only">Name</span>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="min-h-11 w-full rounded-xl border border-line bg-card/90 px-3 text-sm outline-none"
          />
        </label>
        <label className="block">
          <span className="sr-only">Message</span>
          <textarea
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Your message"
            rows={2}
            className="w-full resize-none rounded-xl border border-line bg-card/90 px-3 py-2 text-sm outline-none"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 w-full rounded-full bg-accent text-sm tracking-wide text-white"
        >
          Send
        </button>
      </form>
      <ul className="mt-3 w-full space-y-2 overflow-hidden text-left">
        {comments.length === 0 ? (
          <li className="rounded-xl border border-line bg-card/80 px-3 py-3 text-center text-sm text-muted">
            Be the first to leave a wish.
          </li>
        ) : (
          comments.slice(0, 3).map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-line bg-card/90 px-3 py-3"
            >
              <p className="text-sm font-medium">{comment.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {comment.message}
              </p>
            </li>
          ))
        )}
      </ul>
    </InvitationSection>
  );
}
