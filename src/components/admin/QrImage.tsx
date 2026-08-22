"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrImage({
  value,
  size = 220,
  downloadName,
}: {
  value: string;
  size?: number;
  downloadName?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { margin: 1, width: size }).then((url) => {
      if (!cancelled) {
        setDataUrl(url);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div className="bg-zinc-100" style={{ width: size, height: size }} />
    );
  }

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="Guest invite QR" width={size} height={size} />
      {downloadName ? (
        <a
          href={dataUrl}
          download={downloadName}
          className="mt-3 inline-block text-sm text-zinc-600 underline"
        >
          Download QR
        </a>
      ) : null}
    </div>
  );
}
