import { FILTERS } from "@/lib/filters";
import { cn } from "@/lib/utils";

type FilterRailProps = {
  activeId: string;
  disabled?: boolean;
  onChange: (id: string) => void;
};

export function FilterRail({ activeId, disabled, onChange }: FilterRailProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between px-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Filters
        </p>
        <p className="text-xs text-muted-foreground">Tap a look before you shoot</p>
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label="Filter presets"
      >
        {FILTERS.map((filter) => {
          const active = filter.id === activeId;
          return (
            <button
              key={filter.id}
              type="button"
              role="option"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onChange(filter.id)}
              className={cn(
                "h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-[background-color,color,border-color,transform] duration-150 ease-out active:not-disabled:scale-[0.96]",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
