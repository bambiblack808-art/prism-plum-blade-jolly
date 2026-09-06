import { Aperture } from "lucide-react";
import { AuthSlot } from "@/components/auth-slot";

export function BoothHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between gap-3 px-1">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
          <Aperture className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight font-semibold tracking-tight">
            Flashframe
          </p>
          <p className="text-xs text-muted-foreground">Private photo booth</p>
        </div>
      </div>
      <AuthSlot />
    </header>
  );
}
