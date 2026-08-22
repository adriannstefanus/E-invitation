"use client";

import { useEffect, useRef, useState } from "react";

type CameraOption = { id: string; label: string };

type DoorScannerProps = {
  onScan: (text: string) => void;
};

export function DoorScanner({ onScan }: DoorScannerProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{
    stop: () => Promise<void>;
    clear: () => void;
    applyVideoConstraints?: (value: object) => Promise<void>;
  } | null>(null);
  const onScanRef = useRef(onScan);
  const busyRef = useRef(false);
  const [cameras, setCameras] = useState<CameraOption[]>([]);
  const [cameraId, setCameraId] = useState<string>("");
  const [torchOn, setTorchOn] = useState(false);
  const [message, setMessage] = useState("Point the camera at the guest QR.");

  onScanRef.current = onScan;

  useEffect(() => {
    let cancelled = false;
    import("html5-qrcode")
      .then(({ Html5Qrcode }) => Html5Qrcode.getCameras())
      .then((devices) => {
        if (cancelled || devices.length === 0) {
          return;
        }
        setCameras(
          devices.map((device, index) => ({
            id: device.id,
            label: device.label || `Camera ${index + 1}`,
          })),
        );
        setCameraId((current) => current || devices[0].id);
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("Camera list unavailable. Trying the rear camera.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let stopped = false;
    let scanner: {
      stop: () => Promise<void>;
      clear: () => void;
      applyVideoConstraints?: (value: object) => Promise<void>;
    } | null = null;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!holderRef.current || stopped) {
        return;
      }
      const id = "door-scanner";
      holderRef.current.id = id;
      const instance = new Html5Qrcode(id);
      scanner = instance;
      scannerRef.current = instance;
      await instance.start(
        cameraId ? { deviceId: { exact: cameraId } } : { facingMode: "environment" },
        { fps: 8, qrbox: 240 },
        (text) => {
          if (busyRef.current) {
            return;
          }
          busyRef.current = true;
          onScanRef.current(text);
          window.setTimeout(() => {
            busyRef.current = false;
          }, 1600);
        },
        () => undefined,
      );
    }

    start().catch(() => {
      if (!stopped) {
        setMessage("Camera could not start. Use the door code or name search.");
      }
    });

    return () => {
      stopped = true;
      scannerRef.current = null;
      scanner
        ?.stop()
        .then(() => scanner?.clear())
        .catch(() => undefined);
    };
  }, [cameraId]);

  async function toggleTorch() {
    const next = !torchOn;
    try {
      await scannerRef.current?.applyVideoConstraints?.({
        advanced: [{ torch: next }],
      });
      setTorchOn(next);
    } catch {
      const video = holderRef.current?.querySelector("video");
      const track = (
        video?.srcObject instanceof MediaStream
          ? video.srcObject.getVideoTracks()[0]
          : null
      );
      try {
        await track?.applyConstraints({
          advanced: [{ torch: next }],
        } as unknown as MediaTrackConstraints);
        setTorchOn(next);
      } catch {
        setMessage("Torch is not available on this camera.");
      }
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div
        ref={holderRef}
        className="mx-auto aspect-square max-w-sm overflow-hidden rounded-xl bg-zinc-900"
      />
      <p className="mt-3 text-center text-base text-zinc-600">{message}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {cameras.length > 1 ? (
          <select
            value={cameraId}
            onChange={(event) => {
              setTorchOn(false);
              setCameraId(event.target.value);
            }}
            className="min-h-12 rounded-xl border border-zinc-300 px-3 text-base"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label}
              </option>
            ))}
          </select>
        ) : null}
        <button
          type="button"
          onClick={toggleTorch}
          className="min-h-12 rounded-xl border border-zinc-300 px-4 text-base"
        >
          {torchOn ? "Torch off" : "Torch"}
        </button>
      </div>
    </div>
  );
}
