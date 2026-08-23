"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setInviteSent } from "@/app/admin/actions";
import { fillWhatsAppTemplate, type WhatsAppTemplate } from "@/lib/site-settings";
import { toWhatsAppPhone, whatsappSendUrl } from "@/lib/whatsapp";
import type { Guest } from "@/lib/types";

type WhatsAppSendProps = {
  guest: Guest;
  inviteUrl: string;
  templates: WhatsAppTemplate[];
  label?: string;
};

export function WhatsAppSend({
  guest,
  inviteUrl,
  templates,
  label = "WhatsApp",
}: WhatsAppSendProps) {
  const phone = toWhatsAppPhone(guest.phone);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!phone || templates.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
      >
        {label}
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
            Choose a template
          </p>
          <ul className="mt-2 space-y-1">
            {templates.map((template) => {
              const text = fillWhatsAppTemplate(template.body, guest, inviteUrl);
              const href = whatsappSendUrl(phone, text);
              return (
                <li key={template.id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      setOpen(false);
                      void setInviteSent(guest.id, true).then(() =>
                        router.refresh(),
                      );
                    }}
                    className="block rounded-lg px-2 py-2 text-sm hover:bg-zinc-50"
                  >
                    <span className="font-medium">{template.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-zinc-500">
                      {text}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 text-xs text-zinc-500"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
