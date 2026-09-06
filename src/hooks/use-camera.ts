import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "live"
  | "denied"
  | "unavailable"
  | "error";

export type FacingMode = "user" | "environment";

type CameraErrorName =
  | "NotAllowedError"
  | "NotFoundError"
  | "NotReadableError"
  | "OverconstrainedError"
  | "SecurityError";

function statusFromError(err: unknown): CameraStatus {
  const name =
    err && typeof err === "object" && "name" in err
      ? String((err as { name: string }).name)
      : "";
  const message = err instanceof Error ? err.message : String(err ?? "");
  if (name === "NotAllowedError" || name === "SecurityError" || /permission|denied/i.test(message)) {
    return "denied";
  }
  if (
    name === "NotFoundError" ||
    name === "OverconstrainedError" ||
    /not found|no device|no camera|requested device/i.test(message)
  ) {
    return "unavailable";
  }
  if (name === "NotReadableError" || /in use|busy/i.test(message)) return "error";
  return "error";
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useCamera(videoRef: RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [facing, setFacing] = useState<FacingMode>("user");
  const [canFlip, setCanFlip] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingRef = useRef<FacingMode>("user");

  const attach = useCallback(
    async (stream: MediaStream) => {
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      try {
        await video.play();
      } catch {
        /* autoplay can wait for a later user gesture; stream is still live */
      }
    },
    [videoRef],
  );

  const refreshDeviceCount = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setCanFlip(false);
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCanFlip(devices.filter((d) => d.kind === "videoinput").length > 1);
    } catch {
      setCanFlip(false);
    }
  }, []);

  const start = useCallback(
    async (nextFacing: FacingMode = facingRef.current) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        setErrorMessage("This browser does not support camera access.");
        return;
      }

      setStatus("requesting");
      setErrorMessage(null);
      stopStream(streamRef.current);
      streamRef.current = null;

      const tryConstraints = async (facingMode: FacingMode) => {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        return stream;
      };

      try {
        let stream: MediaStream;
        try {
          stream = await tryConstraints(nextFacing);
        } catch (err) {
          const name = err && typeof err === "object" && "name" in err ? String((err as { name: string }).name) : "";
          if (name === "OverconstrainedError") {
            stream = await tryConstraints(nextFacing === "user" ? "environment" : "user");
            nextFacing = nextFacing === "user" ? "environment" : "user";
          } else {
            throw err;
          }
        }

        streamRef.current = stream;
        facingRef.current = nextFacing;
        setFacing(nextFacing);
        await attach(stream);
        setStatus("live");
        await refreshDeviceCount();
      } catch (err) {
        stopStream(streamRef.current);
        streamRef.current = null;
        const next = statusFromError(err);
        setStatus(next);
        if (next === "denied") {
          setErrorMessage("Camera permission was blocked. Allow access in site settings, then try again.");
        } else if (next === "unavailable") {
          setErrorMessage("No camera was found on this device.");
        } else {
          setErrorMessage("The camera could not be started. It may already be in use.");
        }
      }
    },
    [attach, refreshDeviceCount],
  );

  const stop = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
    setStatus("idle");
    setErrorMessage(null);
  }, [videoRef]);

  const flip = useCallback(async () => {
    const next: FacingMode = facingRef.current === "user" ? "environment" : "user";
    await start(next);
  }, [start]);

  useEffect(() => {
    return () => {
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  return {
    status,
    facing,
    canFlip,
    errorMessage,
    start,
    stop,
    flip,
    isMirrored: facing === "user",
  };
}

export type { CameraErrorName };
