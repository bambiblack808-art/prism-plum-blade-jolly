import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, ImageOff, Trash2 } from "lucide-react";
import type { Shot } from "@/lib/shots";
import { getFilter } from "@/lib/filters";
import { downloadDataUrl, shotFilename } from "@/lib/capture";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GalleryStripProps = {
  shots: Shot[];
  signedIn: boolean;
  onDelete: (id: number) => void;
};

export function GalleryStrip({ shots, signedIn, onDelete }: GalleryStripProps) {
  const [openId, setOpenId] = useState<number | null>(null);
  const active = shots.find((s) => s.id === openId) ?? null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Your strip</h2>
          <p className="text-xs text-muted-foreground">
            {signedIn
              ? "Saved to your account — available on any device."
              : "Local for this visit. Sign in to keep shots across devices."}
          </p>
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">{shots.length}/24</p>
      </div>

      {shots.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/60 px-4 py-6">
          <span className="grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground">
            <ImageOff className="size-4" />
          </span>
          <p className="text-sm text-muted-foreground">
            No frames yet. Open the camera and hit the shutter.
          </p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {shots.map((shot) => (
            <button
              key={shot.id}
              type="button"
              className="polaroid w-28 shrink-0 rounded-md p-1.5 text-left"
              onClick={() => setOpenId(shot.id)}
            >
              <img
                src={shot.imageData}
                alt=""
                className="aspect-[4/3] w-full rounded-sm object-cover outline outline-1 -outline-offset-1 outline-black/10"
              />
              <p className="mt-1.5 truncate px-0.5 text-xs font-medium tracking-wide">
                {getFilter(shot.filterId).label}
              </p>
            </button>
          ))}
        </div>
      )}

      <Dialog open={active !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        {active ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{getFilter(active.filterId).label}</DialogTitle>
              <DialogDescription>
                {formatDistanceToNow(new Date(active.createdAt), { addSuffix: true })}
              </DialogDescription>
            </DialogHeader>
            <img
              src={active.imageData}
              alt={`${getFilter(active.filterId).label} snapshot`}
              className="w-full rounded-md object-cover outline outline-1 -outline-offset-1 outline-white/10"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                className="flex-1"
                onClick={() =>
                  downloadDataUrl(active.imageData, shotFilename(active.filterId))
                }
              >
                <Download />
                Download
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onDelete(active.id);
                  setOpenId(null);
                }}
              >
                <Trash2 />
                Remove
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}
