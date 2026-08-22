"use client";

import { useEffect, useId, useRef, useState } from "react";

type CameraOption = { id: string; label: string };

type DoorScannerProps = {
  onScan: (text: string) => void;
  enabled?: boolean;
};

type ScannerHandle = {
  stop: () => Promise<void>;
  clear: () => void;
  applyVideoConstraints?: (value: object) => Promise<void>;
};

function pickRearCamera(devices: CameraOption[]) {
  const rear = devices.find((device) =>
    /back|rear|environment|belakang/i.test(device.label),
  );
  return rear?.id ?? devices.at(-1)?.id ?? devices[0]?.id ?? "";
}

export function DoorScanner({ onScan, enabled = true }: DoorScannerProps) {
  const regionId = `door-scanner-${useId().replace(/:/g, "")}`;
  const holderRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<ScannerHandle | null>(null);
  const onScanRef = useRef(onScan);
  const busyRef = useRef(false);
  const startingRef = useRef(false);
  const [cameras, setCameras] = useState<CameraOption[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [running, setRunning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [message, setMessage] = useState(
    "Tap Start camera, then point it at the guest QR.",
  );

  onScanRef.current = onScan;

  useEffect(() => {
    if (!enabled && running) {
      void stopCamera();
    }
  }, [enabled, running]);

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, []);

  async function stopCamera() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setRunning(false);
    setTorchOn(false);
    if (!scanner) {
      return;
    }
    try {
      await scanner.stop();
    } catch {
      // Some phones throw if the stream already died.
    }
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    try {
      scanner.clear();
    } catch {
      // Ignore leftover DOM from html5-qrcode.
    }
  }

  async function startCamera(deviceId?: string) {
    if (startingRef.current || !holderRef.current) {
      return;
    }
    startingRef.current = true;
    setMessage("Starting camera…");
    await stopCamera();

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      holderRef.current.id = regionId;
      holderRef.current.replaceChildren();
      const instance = new Html5Qrcode(regionId, { verbose: false });
      scannerRef.current = instance;

      const cameraConfig = deviceId
        ? { deviceId: { ideal: deviceId } }
        : { facingMode: "environment" };

      await instance.start(
        cameraConfig,
        {
          fps: 5,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.max(
              160,
              Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.65),
            );
            return { width: size, height: size };
          },
          aspectRatio: 1,
        },
        (text) => {
          if (busyRef.current) {
            return;
          }
          busyRef.current = true;
          try {
            onScanRef.current(text);
          } catch {
            setMessage("Could not read that QR. Try the door code.");
          }
          window.setTimeout(() => {
            busyRef.current = false;
          }, 1800);
        },
        () => undefined,
      );

      setRunning(true);
      setCameraId(deviceId ?? "");
      setMessage("Point the camera at the guest QR.");

      try {
        const devices = await Html5Qrcode.getCameras();
        const options = devices.map((device, index) => ({
          id: device.id,
          label: device.label || `Camera ${index + 1}`,
        }));
        setCameras(options);
        if (!deviceId) {
          setCameraId(pickRearCamera(options));
        }
      } catch {
        // Switching cameras is optional.
      }
    } catch {
      await stopCamera();
      setMessage(
        "This phone could not keep the camera open. Use the 6-digit door code or name search.",
      );
    } finally {
      startingRef.current = false;
    }
  }

  async function switchCamera(nextId: string) {
    setCameraId(nextId);
    await startCamera(nextId);
  }

  async function toggleTorch() {
    const next = !torchOn;
    try {
      await scannerRef.current?.applyVideoConstraints?.({
        advanced: [{ torch: next }],
      });
      setTorchOn(next);
    } catch {
      setMessage("Torch is not available on this camera.");
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
        {running ? (
          <button
            type="button"
            onClick={() => void stopCamera()}
            className="min-h-12 rounded-xl border border-zinc-300 px-4 text-base"
          >
            Stop camera
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void startCamera()}
            className="min-h-12 rounded-xl bg-zinc-900 px-4 text-base text-white"
          >
            Start camera
          </button>
        )}
        {running && cameras.length > 1 ? (
          <select
            value={cameraId}
            onChange={(event) => void switchCamera(event.target.value)}
            className="min-h-12 rounded-xl border border-zinc-300 px-3 text-base"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label}
              </option>
            ))}
          </select>
        ) : null}
        {running ? (
          <button
            type="button"
            onClick={() => void toggleTorch()}
            className="min-h-12 rounded-xl border border-zinc-300 px-4 text-base"
          >
            {torchOn ? "Torch off" : "Torch"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
