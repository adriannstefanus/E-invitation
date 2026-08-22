"use client";

import { useState } from "react";
import { InvitationSection } from "@/components/invitation/InvitationSection";
import { bankAccounts } from "@/data/content";
import { invitationMedia } from "@/data/media";

export function GiftSection() {
  return (
    <InvitationSection image={invitationMedia.gift.background} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Wedding gift
      </p>
      <h2 className="font-display mt-3 text-3xl">Angpao</h2>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Send a gift online to one of these accounts.
      </p>
      <div className="mt-4 w-full space-y-2">
        {bankAccounts.map((account) => (
          <BankCard
            key={`${account.bank}-${account.number}`}
            account={account}
          />
        ))}
      </div>
    </InvitationSection>
  );
}

function BankCard({ account }: { account: (typeof bankAccounts)[number] }) {
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(account.number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-card/90 px-3 py-2.5 text-left">
      <p className="text-xs tracking-[0.2em] text-muted uppercase">
        {account.bank}
      </p>
      <p className="mt-0.5 text-sm text-foreground">{account.holder}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="font-mono text-sm tracking-wide">{account.number}</p>
        <button
          type="button"
          onClick={copyNumber}
          className="min-h-9 shrink-0 rounded-full bg-accent px-3 text-xs tracking-wide text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </article>
  );
}
