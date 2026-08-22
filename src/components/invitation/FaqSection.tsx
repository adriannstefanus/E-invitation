import { InvitationSection } from "@/components/invitation/InvitationSection";
import { faq } from "@/data/content";
import { invitationMedia } from "@/data/media";

export function FaqSection() {
  return (
    <InvitationSection image={invitationMedia.faq.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">FAQ</p>
      <div className="mt-6 w-full space-y-2">
        {faq.map((item) => (
          <article
            key={item.question}
            className="rounded-2xl border border-line bg-card/90 px-4 py-3 text-left"
          >
            <h3 className="text-sm font-medium">{item.question}</h3>
            <p className="mt-1 text-sm text-muted">{item.answer}</p>
          </article>
        ))}
      </div>
    </InvitationSection>
  );
}
