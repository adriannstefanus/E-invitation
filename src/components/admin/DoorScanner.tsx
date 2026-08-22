"use client";

import { useEffect, useRef, useState } from "react";
import { checkInGuest } from "@/app/admin/actions";
import { parseInviteToken } from "@/lib/parse-invite-token";

export function DoorScanner() {
  const holderRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const [message, setMessage] = useState("Point the camera at the guest QR.");

  useEffect(() => {
    let scanner: { stop: () => Promise<void>; clear: () => void } | null = null;
    let stopped = false;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!holderRef.current || stopped) {
        return;
      }
      const id = "door-scanner";
      holderRef.current.id = id;
      const instance = new Html5Qrcode(id);
      scanner = instance;
      await instance.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: 220 },
        async (text) => {
          if (busyRef.current) {
            return;
          }
          const token = parseInviteToken(text);
          if (!token) {
            setMessage("That QR is not a guest invite.");
            return;
          }
          busyRef.current = true;
          const formData = new FormData();
          formData.set("token", token);
          formData.set("method", "qr");
          const result = await checkInGuest(formData);
          if (!result.ok) {
            setMessage(result.error ?? "Check-in failed.");
          } else if (result.already) {
            setMessage(`${result.name} (${result.type}) already checked in.`);
          } else {
            setMessage(`${result.name} (${result.type}) is in.`);
          }
          window.setTimeout(() => {
            busyRef.current = false;
          }, 1500);
        },
        () => undefined,
      );
    }

    start().catch(() => {
      setMessage("Camera could not start. Use name search below.");
    });

    return () => {
      stopped = true;
      scanner
        ?.stop()
        .then(() => scanner?.clear())
        .catch(() => undefined);
    };
  }, []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div
        ref={holderRef}
        className="mx-auto aspect-square max-w-xs overflow-hidden rounded-lg bg-zinc-900"
      />
      <p className="mt-3 text-center text-sm text-zinc-600">{message}</p>
    </div>
  );
}
