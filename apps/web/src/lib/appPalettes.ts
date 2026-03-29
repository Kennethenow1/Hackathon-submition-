/** Keys must match `[data-app-palette]` selectors in `tokens.css`. */
export const APP_PALETTE_IDS = [
  "blush",
  "mono-light",
  "mono-dark",
  "ocean",
  "forest",
  "lavender",
  "sunset",
  "sand",
] as const;

export type AppPaletteId = (typeof APP_PALETTE_IDS)[number];

export type AppPaletteMeta = {
  id: AppPaletteId;
  label: string;
  hint: string;
  /** Tiny preview stripes for the homepage picker */
  swatch: [string, string, string];
};

export const APP_PALETTES: readonly AppPaletteMeta[] = [
  {
    id: "blush",
    label: "Blush",
    hint: "Original rose & cream studio look.",
    swatch: ["#fff5f3", "#f5d4d0", "#6b2d3c"],
  },
  {
    id: "mono-light",
    label: "Mono light",
    hint: "White, soft gray, and black type.",
    swatch: ["#ffffff", "#e8e8ea", "#0d0d0d"],
  },
  {
    id: "mono-dark",
    label: "Mono dark",
    hint: "Near-black UI with light text.",
    swatch: ["#141416", "#1c1c20", "#f4f4f5"],
  },
  {
    id: "ocean",
    label: "Ocean",
    hint: "Cool teal and deep blue accents.",
    swatch: ["#e8f4f8", "#b8dce8", "#0c4a6e"],
  },
  {
    id: "forest",
    label: "Forest",
    hint: "Sage and deep green.",
    swatch: ["#f0f5f0", "#c5dcc5", "#1a3d2e"],
  },
  {
    id: "lavender",
    label: "Lavender",
    hint: "Soft violet surfaces.",
    swatch: ["#f5f3ff", "#ddd6fe", "#4c1d95"],
  },
  {
    id: "sunset",
    label: "Sunset",
    hint: "Warm coral and amber.",
    swatch: ["#fff7ed", "#fed7aa", "#9a3412"],
  },
  {
    id: "sand",
    label: "Sand",
    hint: "Warm stone neutrals.",
    swatch: ["#faf8f5", "#e7e0d5", "#44403c"],
  },
] as const;

export const APP_PALETTE_STORAGE_KEY = "ai-slop-app-palette";

export function isAppPaletteId(s: string): s is AppPaletteId {
  return (APP_PALETTE_IDS as readonly string[]).includes(s);
}
