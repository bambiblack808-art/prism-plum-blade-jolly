export type FilterPreset = {
  id: string;
  label: string;
  css: string;
};

export const FILTERS: readonly FilterPreset[] = [
  { id: "clear", label: "Clear", css: "none" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.28) brightness(0.96)" },
  { id: "honey", label: "Honey", css: "sepia(0.42) saturate(1.18) contrast(1.06)" },
  { id: "ice", label: "Ice", css: "hue-rotate(188deg) saturate(0.72) brightness(1.08) contrast(1.06)" },
  { id: "punch", label: "Punch", css: "contrast(1.26) saturate(1.38)" },
  { id: "halo", label: "Halo", css: "brightness(1.16) contrast(0.92) saturate(1.04) blur(0.55px)" },
  { id: "chrome", label: "Chrome", css: "grayscale(0.18) contrast(1.22) saturate(0.82) brightness(1.04)" },
  { id: "faded", label: "Faded", css: "contrast(0.88) saturate(0.68) brightness(1.08) sepia(0.14)" },
  { id: "pop", label: "Pop", css: "saturate(1.55) contrast(1.12) hue-rotate(6deg)" },
  { id: "mono", label: "Mono", css: "grayscale(1)" },
] as const;

export const DEFAULT_FILTER_ID = "clear";

export function getFilter(id: string): FilterPreset {
  return FILTERS.find((f) => f.id === id) ?? FILTERS[0];
}
