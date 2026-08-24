"use client";

import { useState } from "react";
import { InvitationSection } from "@/components/invitation/InvitationSection";
import type { BankAccount } from "@/lib/site-settings";

export function GiftSection({ accounts }: { accounts: BankAccount[] }) {
  return (
    <InvitationSection section="gifts" mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Wedding gift
      </p>
      <h2 className="font-display mt-3 text-3xl">Angpao</h2>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Send a gift online to one of these accounts.
      </p>
      <div className="mt-4 w-full space-y-2">
        {accounts.map((account) => (
          <BankCard
            key={`${account.bank}-${account.number}`}
            account={account}
          />
        ))}
      </div>
    </InvitationSection>
  );
}

function BankCard({ account }: { account: BankAccount }) {
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
