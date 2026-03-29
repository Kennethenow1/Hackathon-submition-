/**
 * Brand tokens inferred from any captured URL or uploaded HTML/CSS (Create flow).
 * Passed into Remotion as input props so the video matches that site’s look.
 */
export type FlyerBrandTokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  /** Darker stop for gradient bases */
  deep: string;
  /** Resolved absolute URL when possible; render may load this in headless Chrome */
  logoUrl: string | null;
  /** From <title> / og:site_name / fallback */
  productName: string;
};
