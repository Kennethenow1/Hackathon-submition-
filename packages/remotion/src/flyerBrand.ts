export type FlyerBrandInput = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  deep: string;
  logoUrl: string | null;
  productName: string;
};

export const DEFAULT_FLYER_BRAND: FlyerBrandInput = {
  primary: "#6366f1",
  secondary: "#4f46e5",
  accent: "#a78bfa",
  background: "#0f0f12",
  deep: "#050508",
  logoUrl: null,
  productName: "Your site",
};

export type FlyerShowcaseProps = {
  /** Merged with defaults; pass captured site tokens from the web app render step */
  flyerBrand?: Partial<FlyerBrandInput> | FlyerBrandInput;
};

/** For rgba(..., a) in styles */
export function hexToRgbTriplet(hex: string): string {
  const p = parseRgb(hex);
  if (!p) return "255, 255, 255";
  return `${p.r}, ${p.g}, ${p.b}`;
}

function parseRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = hex.trim();
  if (!/^#[0-9a-f]{6}$/i.test(n)) return null;
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

function toHex(r: number, g: number, b: number): string {
  const c = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function shade(hex: string, factor: number): string {
  const p = parseRgb(hex);
  if (!p) return hex;
  return toHex(p.r * factor, p.g * factor, p.b * factor);
}

function mix(a: string, b: string, t: number): string {
  const A = parseRgb(a);
  const B = parseRgb(b);
  if (!A || !B) return a;
  return toHex(
    A.r + (B.r - A.r) * t,
    A.g + (B.g - A.g) * t,
    A.b + (B.b - A.b) * t
  );
}

/** Three-stop gradients for each scene, derived from captured brand colors */
export function buildScenePalettes(brand: FlyerBrandInput) {
  const { primary, secondary, accent, background, deep } = brand;
  return {
    intro: [deep, mix(primary, background, 0.35), mix(secondary, primary, 0.5)] as const,
    upload: [shade(primary, 0.35), mix(primary, accent, 0.4), mix(accent, secondary, 0.35)] as const,
    extract: [shade(secondary, 0.4), mix(secondary, accent, 0.45), mix(accent, primary, 0.3)] as const,
    calendar: [shade(accent, 0.45), mix(accent, primary, 0.35), mix(primary, secondary, 0.4)] as const,
    donate: [shade(primary, 0.32), mix(primary, secondary, 0.5), mix(secondary, accent, 0.35)] as const,
    thanks: [shade(background, 0.55), mix(background, primary, 0.4), mix(primary, accent, 0.35)] as const,
    outro: [shade(deep, 1), mix(deep, primary, 0.5), mix(primary, accent, 0.45)] as const,
  };
}

export function mergeFlyerBrand(
  partial: Partial<FlyerBrandInput> | FlyerBrandInput | undefined
): FlyerBrandInput {
  if (!partial) return { ...DEFAULT_FLYER_BRAND };
  return { ...DEFAULT_FLYER_BRAND, ...partial };
}
