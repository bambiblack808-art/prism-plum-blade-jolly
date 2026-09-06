import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCamera } from "@/hooks/use-camera";
import { captureFrame, downloadDataUrl, shotFilename } from "@/lib/capture";
import { DEFAULT_FILTER_ID, getFilter } from "@/lib/filters";
import { deleteShot, listShots, saveShot, type Shot } from "@/lib/shots";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Viewfinder } from "@/components/booth/viewfinder";
import { FilterRail } from "@/components/booth/filter-rail";
import { ShutterBar } from "@/components/booth/shutter-bar";
import { GalleryStrip } from "@/components/booth/gallery-strip";
import { BoothHeader } from "@/components/booth/booth-header";

type BoothMode = "preview" | "counting" | "flash" | "review";

let localShotSeq = -1;

export function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const camera = useCamera(videoRef);
  const { user, isPending } = useCurrentUserState();
  const signedIn = Boolean(user);
  const queryClient = useQueryClient();

  const [filterId, setFilterId] = useState(DEFAULT_FILTER_ID);
  const [mode, setMode] = useState<BoothMode>("preview");
  const [count, setCount] = useState<number | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [guestShots, setGuestShots] = useState<Shot[]>([]);
  const timers = useRef<number[]>([]);

  const filter = getFilter(filterId);
  const capturing = mode === "counting" || mode === "flash";

  const shotsQuery = useQuery({
    queryKey: ["shots"],
    queryFn: () => listShots(),
    enabled: signedIn && !isPending,
    retry: false,
  });

  const shots: Shot[] = signedIn ? (shotsQuery.data ?? []) : guestShots;

  const saveMutation = useMutation({
    mutationFn: (input: { imageData: string; filterId: string }) =>
      saveShot({ data: input }),
    onSuccess: (saved) => {
      queryClient.setQueryData<Shot[]>(["shots"], (prev) => {
        const next = [saved, ...(prev ?? [])];
        return next.slice(0, 24);
      });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Could not save";
      if (message === "Unauthorized") {
        toast.error("Session expired. Sign in to keep this shot.");
      } else {
        toast.error("Could not save this shot to your account.");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteShot({ data: { id } }),
    onSuccess: (_ok, id) => {
      queryClient.setQueryData<Shot[]>(["shots"], (prev) =>
        (prev ?? []).filter((s) => s.id !== id),
      );
    },
    onError: () => toast.error("Could not remove that shot."),
  });

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const takeShot = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const dataUrl = captureFrame(video, filter.css, camera.isMirrored);
    if (!dataUrl) {
      toast.error("Nothing to capture yet — wait for the live preview.");
      setMode("preview");
      setCount(null);
      return;
    }
    setCapturedUrl(dataUrl);
    setMode("flash");
    const flashTimer = window.setTimeout(() => {
      setMode("review");
      setCount(null);
    }, 280);
    timers.current.push(flashTimer);

    if (signedIn) {
      saveMutation.mutate({ imageData: dataUrl, filterId: filter.id });
    } else {
      const guest: Shot = {
        id: localShotSeq--,
        filterId: filter.id,
        imageData: dataUrl,
        createdAt: new Date().toISOString(),
      };
      setGuestShots((prev) => [guest, ...prev].slice(0, 24));
    }
  }, [camera.isMirrored, filter.css, filter.id, saveMutation, signedIn]);

  const startCountdown = useCallback(() => {
    if (camera.status !== "live" || capturing) return;
    clearTimers();
    setCapturedUrl(null);
    setMode("counting");
    setCount(3);

    const id2 = window.setTimeout(() => setCount(2), 900);
    const id1 = window.setTimeout(() => setCount(1), 1800);
    const shoot = window.setTimeout(() => takeShot(), 2700);
    timers.current.push(id2, id1, shoot);
  }, [camera.status, capturing, clearTimers, takeShot]);

  const retake = useCallback(() => {
    clearTimers();
    setCapturedUrl(null);
    setCount(null);
    setMode("preview");
  }, [clearTimers]);

  const downloadCurrent = useCallback(() => {
    if (!capturedUrl) return;
    downloadDataUrl(capturedUrl, shotFilename(filter.id));
    toast.success("Photo downloaded");
  }, [capturedUrl, filter.id]);

  const handleDelete = useCallback(
    (id: number) => {
      if (id < 0) {
        setGuestShots((prev) => prev.filter((s) => s.id !== id));
        return;
      }
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (camera.status !== "live" || mode !== "preview") return;
      event.preventDefault();
      startCountdown();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [camera.status, mode, startCountdown]);

  return (
    <div className="booth-shell">
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8">
        <BoothHeader />

        <Viewfinder
          videoRef={videoRef}
          status={camera.status}
          facing={camera.facing}
          isMirrored={camera.isMirrored}
          filterCss={filter.css}
          filterLabel={filter.label}
          errorMessage={camera.errorMessage}
          mode={mode}
          count={count}
          capturedUrl={capturedUrl}
          onEnable={() => {
            retake();
            void camera.start("user");
          }}
        />

        <FilterRail
          activeId={filterId}
          disabled={capturing}
          onChange={setFilterId}
        />

        <ShutterBar
          canCapture={camera.status === "live" && mode === "preview"}
          canFlip={camera.canFlip}
          isReview={mode === "review"}
          capturing={capturing}
          cameraLive={camera.status === "live"}
          onCapture={startCountdown}
          onFlip={() => void camera.flip()}
          onDownload={downloadCurrent}
          onRetake={retake}
          onCloseCamera={() => {
            retake();
            camera.stop();
          }}
        />

        {!signedIn && !isPending ? (
          <p className="text-center text-sm text-muted-foreground">
            Snap freely —{" "}
            <Link to="/login" className="text-primary underline-offset-4 hover:underline">
              sign in
            </Link>{" "}
            to keep your strip across devices.
          </p>
        ) : null}

        <GalleryStrip shots={shots} signedIn={signedIn} onDelete={handleDelete} />
      </div>
    </div>
  );
}
