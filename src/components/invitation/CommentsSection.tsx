"use client";

import { FormEvent, useState } from "react";
import { submitComment } from "@/app/invite/actions";
import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";

type GuestComment = {
  id: string;
  name: string;
  message: string;
};

type CommentsSectionProps = {
  guestName: string;
  guestToken?: string;
  comments?: GuestComment[];
};

export function CommentsSection({
  guestName,
  guestToken,
  comments = [],
}: CommentsSectionProps) {
  const defaultName = guestName === "Guest" ? "" : guestName;
  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState(comments);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    const nextMessage = message.trim();
    if (!nextName || !nextMessage) {
      return;
    }

    setError(null);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const result = await submitComment(formData);
    setPending(false);

    if (!result.ok) {
      setError(result.error ?? "Could not send wish.");
      return;
    }

    setItems((current) => [
      { id: crypto.randomUUID(), name: nextName, message: nextMessage },
      ...current,
    ]);
    setMessage("");
  }

  return (
    <InvitationSection image={invitationMedia.comments.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Guest book
      </p>
      <h2 className="font-display mt-3 text-3xl">Leave a wish</h2>
      <form className="mt-4 w-full space-y-2 text-left" onSubmit={handleSubmit}>
        {guestToken ? (
          <input type="hidden" name="token" value={guestToken} />
        ) : null}
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
          disabled={pending}
          className="min-h-11 w-full rounded-full bg-accent text-sm tracking-wide text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-accent">{error}</p> : null}
      <ul className="mt-3 w-full space-y-2 overflow-hidden text-left">
        {items.length === 0 ? (
          <li className="rounded-xl border border-line bg-card/80 px-3 py-3 text-center text-sm text-muted">
            Be the first to leave a wish.
          </li>
        ) : (
          items.slice(0, 3).map((comment) => (
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
