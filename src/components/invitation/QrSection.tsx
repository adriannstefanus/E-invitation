"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { InvitationSection } from "@/components/invitation/InvitationSection";
import { invitationMedia } from "@/data/media";

type QrSectionProps = {
  guestName: string;
  inviteUrl: string;
};

export function QrSection({ guestName, inviteUrl }: QrSectionProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(inviteUrl, {
      margin: 1,
      width: 280,
      color: { dark: "#3f3a34", light: "#fffdf8" },
    }).then((url) => {
      if (!cancelled) {
        setDataUrl(url);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [inviteUrl]);

  return (
    <InvitationSection image={invitationMedia.cover.image} mediaAlt="">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">
        Attendance
      </p>
      <h2 className="font-display mt-3 text-3xl">Your QR</h2>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Show this at the door, {guestName}.
      </p>
      <div className="mt-6 rounded-2xl border border-line bg-card p-4">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="Attendance QR code"
            className="mx-auto h-52 w-52"
          />
        ) : (
          <div className="h-52 w-52 bg-card" />
        )}
      </div>
    </InvitationSection>
  );
}
