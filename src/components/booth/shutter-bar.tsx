import { Download, RotateCcw, SwitchCamera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ShutterBarProps = {
  canCapture: boolean;
  canFlip: boolean;
  isReview: boolean;
  capturing: boolean;
  onCapture: () => void;
  onFlip: () => void;
  onDownload: () => void;
  onRetake: () => void;
  onCloseCamera: () => void;
  cameraLive: boolean;
};

export function ShutterBar({
  canCapture,
  canFlip,
  isReview,
  capturing,
  onCapture,
  onFlip,
  onDownload,
  onRetake,
  onCloseCamera,
  cameraLive,
}: ShutterBarProps) {
  if (isReview) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={onRetake} className="min-w-32">
          <RotateCcw />
          Retake
        </Button>
        <Button onClick={onDownload} className="min-w-32">
          <Download />
          Download
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="flex justify-end">
        {canFlip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Flip camera"
                onClick={onFlip}
                disabled={!cameraLive || capturing}
              >
                <SwitchCamera />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Flip camera</TooltipContent>
          </Tooltip>
        ) : (
          <span />
        )}
      </div>

      <button
        type="button"
        className={cn("shutter-btn")}
        aria-label="Take photo"
        disabled={!canCapture}
        onClick={onCapture}
      />

      <div className="flex justify-start">
        {cameraLive ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Close camera"
                onClick={onCloseCamera}
                disabled={capturing}
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close camera</TooltipContent>
          </Tooltip>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
