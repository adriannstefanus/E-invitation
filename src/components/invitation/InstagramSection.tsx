import { CopyButton } from "@/components/invitation/CopyButton";
import { InvitationSection } from "@/components/invitation/InvitationSection";
import type { InviteCopy } from "@/lib/site-settings";

export function InstagramSection({
  instagram,
}: {
  instagram: InviteCopy["instagram"];
}) {
  return (
    <InvitationSection section="instagram" mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">Share</p>
      <h2 className="font-display mt-4 text-3xl">{instagram.hashtag}</h2>
      <p className="mt-3 max-w-xs text-sm text-muted">
        Use our hashtag and filter when you post.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <CopyButton value={instagram.hashtag} label="Copy hashtag" />
        {instagram.filterUrl ? (
          <a
            href={instagram.filterUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center rounded-full border border-line bg-card px-4 text-xs tracking-wide"
          >
            Open filter
          </a>
        ) : null}
      </div>
    </InvitationSection>
  );
}
