"use client";

import { useEffect, useRef, useState } from "react";
import type { QRCode } from "jsqr";

type CameraOption = { id: string; label: string };

type DoorScannerProps = {
  onScan: (text: string) => void;
};

type JsQr = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { inversionAttempts?: "dontInvert" | "attemptBoth" },
) => QRCode | null;

function pickRearCamera(devices: CameraOption[]) {
  const rear = devices.find((device) =>
    /back|rear|environment|belakang/i.test(device.label),
  );
  return rear?.id ?? devices.at(-1)?.id ?? devices[0]?.id ?? "";
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function DoorScanner({ onScan }: DoorScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number>(0);
  const foundTimerRef = useRef<number>(0);
  const onScanRef = useRef(onScan);
  const busyRef = useRef(false);
  const startingRef = useRef(false);
  const decodeRef = useRef<JsQr | null>(null);

  const [cameras, setCameras] = useState<CameraOption[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [running, setRunning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [found, setFound] = useState(false);
  const [message, setMessage] = useState(
    "Tap Start camera, then point it at the guest QR.",
  );

  onScanRef.current = onScan;

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      window.clearTimeout(foundTimerRef.current);
      stopStream(streamRef.current);
    };
  }, []);

  function stopCamera() {
    window.clearInterval(timerRef.current);
    timerRef.current = 0;
    stopStream(streamRef.current);
    streamRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    setRunning(false);
    setTorchOn(false);
    setFound(false);
  }

  async function startCamera(deviceId?: string) {
    if (startingRef.current) {
      return;
    }
    startingRef.current = true;
    setMessage("Starting camera…");
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: deviceId
          ? { deviceId: { ideal: deviceId }, width: { ideal: 640, max: 1280 } }
          : {
              facingMode: { ideal: "environment" },
              width: { ideal: 640, max: 1280 },
              height: { ideal: 480, max: 720 },
            },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stopStream(stream);
        return;
      }
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.muted = true;
      await video.play();

      if (!decodeRef.current) {
        const module = await import("jsqr");
        decodeRef.current = module.default;
      }

      timerRef.current = window.setInterval(readFrame, 280);
      setRunning(true);
      setMessage("Point the camera at the guest QR.");

      const devices = await navigator.mediaDevices.enumerateDevices();
      const options = devices
        .filter((device) => device.kind === "videoinput")
        .map((device, index) => ({
          id: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
        }));
      setCameras(options);
      setCameraId(deviceId || pickRearCamera(options));
    } catch {
      stopCamera();
      setMessage(
        "This phone could not keep the camera open. Use the 6-digit door code or name search.",
      );
    } finally {
      startingRef.current = false;
    }
  }

  function readFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const decode = decodeRef.current;
    if (!video || !canvas || !decode || video.readyState < 2) {
      return;
    }

    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return;
    }

    try {
      context.drawImage(video, 0, 0, size, size);
      const image = context.getImageData(0, 0, size, size);
      const code = decode(image.data, size, size, {
        inversionAttempts: "dontInvert",
      });
      if (!code?.data || busyRef.current) {
        return;
      }
      busyRef.current = true;
      setFound(true);
      setMessage("QR found");
      window.clearTimeout(foundTimerRef.current);
      foundTimerRef.current = window.setTimeout(() => {
        setFound(false);
        if (streamRef.current) {
          setMessage("Point the camera at the guest QR.");
        }
      }, 1600);
      onScanRef.current(code.data);
      window.setTimeout(() => {
        busyRef.current = false;
      }, 1800);
    } catch {
      // Skip a bad frame instead of crashing the tab.
    }
  }

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) {
      return;
    }
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next }],
      } as unknown as MediaTrackConstraints);
      setTorchOn(next);
    } catch {
      setMessage("Torch is not available on this camera.");
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div
        className={`relative mx-auto aspect-square max-w-sm overflow-hidden rounded-xl bg-zinc-900 ring-4 transition ${
          found ? "ring-emerald-400" : "ring-transparent"
        }`}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />
        <div
          className={`pointer-events-none absolute inset-8 rounded-lg border-4 ${
            found ? "border-emerald-400 bg-emerald-400/25" : "border-white/70"
          }`}
        />
        {found ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-lg font-medium text-emerald-100">
            Got it
          </p>
        ) : null}
      </div>
      <p
        className={`mt-3 text-center text-base ${
          found ? "font-medium text-emerald-700" : "text-zinc-600"
        }`}
      >
        {message}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {running ? (
          <button
            type="button"
            onClick={stopCamera}
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
            onChange={(event) => void startCamera(event.target.value)}
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
