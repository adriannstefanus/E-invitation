import { markInviteSent } from "@/app/admin/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function InviteSentToggle({
  guestId,
  sentAt,
  next = "/admin/guests",
}: {
  guestId: string;
  sentAt: string | null | undefined;
  next?: string;
}) {
  const sent = Boolean(sentAt);
  return (
    <form action={markInviteSent}>
      <input type="hidden" name="id" value={guestId} />
      <input type="hidden" name="sent" value={sent ? "0" : "1"} />
      <input type="hidden" name="next" value={next} />
      <SubmitButton
        pendingLabel="Saving…"
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
      >
        {sent ? "Undo sent" : "Mark sent"}
      </SubmitButton>
    </form>
  );
}
