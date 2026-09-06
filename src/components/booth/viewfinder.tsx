import type { RefObject } from "react";
import { Aperture, CameraOff, LoaderCircle, ShieldAlert } from "lucide-react";
import type { CameraStatus, FacingMode } from "@/hooks/use-camera";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BoothMode = "preview" | "counting" | "flash" | "review";

type ViewfinderProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  facing: FacingMode;
  isMirrored: boolean;
  filterCss: string;
  filterLabel: string;
  errorMessage: string | null;
  mode: BoothMode;
  count: number | null;
  capturedUrl: string | null;
  onEnable: () => void;
};

const STATUS_COPY: Record<
  CameraStatus,
  { title: string; body: string; tone: "idle" | "live" | "warn" | "error" }
> = {
  idle: {
    title: "Camera off",
    body: "Open the camera to step into the booth.",
    tone: "idle",
  },
  requesting: {
    title: "Asking for camera",
    body: "Approve the browser prompt to continue.",
    tone: "warn",
  },
  live: {
    title: "Live",
    body: "Look into the lens. The shutter waits for you.",
    tone: "live",
  },
  denied: {
    title: "Permission blocked",
    body: "Allow camera access in site settings, then try again.",
    tone: "error",
  },
  unavailable: {
    title: "No camera found",
    body: "Plug in a webcam or use a device with a camera.",
    tone: "error",
  },
  error: {
    title: "Camera busy",
    body: "Close other apps using the camera, then retry.",
    tone: "error",
  },
};

export function Viewfinder({
  videoRef,
  status,
  facing,
  isMirrored,
  filterCss,
  filterLabel,
  errorMessage,
  mode,
  count,
  capturedUrl,
  onEnable,
}: ViewfinderProps) {
  const copy = STATUS_COPY[status];
  const showVideo = status === "live" || status === "requesting";
  const showStill = mode === "review" && capturedUrl;

  return (
    <div className="booth-frame rounded-xl p-2">
      <div className="viewfinder aspect-[4/3] rounded-lg">
        <video
          ref={videoRef}
          className={cn(
            "viewfinder-video",
            isMirrored && "is-mirrored",
            (!showVideo || showStill) && "invisible absolute",
          )}
          style={{ filter: filterCss }}
          playsInline
          muted
          autoPlay
          aria-label="Live camera preview"
        />

        {showStill ? (
          <img
            src={capturedUrl}
            alt="Captured snapshot"
            className="viewfinder-still"
          />
        ) : null}

        {status !== "live" && !showStill ? (
          <EmptyStage status={status} copy={copy} errorMessage={errorMessage} onEnable={onEnable} />
        ) : null}

        <div className="viewfinder-vignette" />
        <div className="viewfinder-corners" aria-hidden="true">
          <span />
        </div>

        {mode === "counting" && count !== null ? (
          <div className="absolute inset-0 z-10 grid place-items-center bg-background/25">
            <span key={count} className="countdown-num tabular-nums" aria-live="assertive">
              {count}
            </span>
          </div>
        ) : null}

        {mode === "flash" ? <div className="booth-flash" /> : null}

        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
          <Badge variant={copy.tone === "live" ? "live" : "default"} className="pointer-events-auto">
            <span
              className={cn(
                "status-dot",
                copy.tone === "idle" && "is-idle",
                copy.tone === "warn" && "is-warn",
                copy.tone === "error" && "is-error",
                copy.tone === "live" && "live-pulse",
              )}
            />
            {status === "live" ? "Live" : copy.title}
          </Badge>
          {status === "live" ? (
            <Badge variant="outline" className="bg-background/40 backdrop-blur-sm">
              {facing === "user" ? "Front" : "Rear"} · {filterLabel}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptyStage({
  status,
  copy,
  errorMessage,
  onEnable,
}: {
  status: CameraStatus;
  copy: (typeof STATUS_COPY)[CameraStatus];
  errorMessage: string | null;
  onEnable: () => void;
}) {
  const Icon =
    status === "denied"
      ? ShieldAlert
      : status === "requesting"
        ? LoaderCircle
        : status === "idle"
          ? Aperture
          : CameraOff;

  return (
    <div className="curtain absolute inset-0 grid place-items-center px-5">
      <div className="flex max-w-sm flex-col items-center rounded-xl bg-card px-6 py-7 text-center shadow-border">
        <span className="mb-4 grid size-14 place-items-center rounded-full bg-secondary text-primary">
          <Icon className={cn("size-6", status === "requesting" && "animate-spin")} strokeWidth={1.6} />
        </span>
        <h2 className="font-display text-2xl font-semibold tracking-tight">{copy.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {errorMessage ?? copy.body}
        </p>
        {status !== "requesting" ? (
          <Button className="mt-5" onClick={onEnable}>
            {status === "idle" ? "Open camera" : "Try again"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
