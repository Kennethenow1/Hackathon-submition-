/**
 * Single source of truth for cursor arrow path and tip offset.
 * The arrow path is a standard pointer cursor shape.
 * arrowTipOffsetPx(svgSize) returns {dx, dy} — the offset from the
 * top-left corner of the SVG bounding box to the visual tip of the arrow.
 *
 * Use: place the cursor div at (tipX - dx, tipY - dy) so the tip pixel
 * lands exactly at (tipX, tipY).
 */

export const CURSOR_ARROW_PATH_D =
  'M 4 2 L 4 18 L 7.5 14.5 L 11 20 L 13 19 L 9.5 13.5 L 14 13.5 Z';

/**
 * Returns the pixel offset from the SVG container top-left to the tip of
 * the arrow, for a given rendered SVG size in px.
 *
 * The arrow path is drawn in a 0-0 / 24x24 viewBox.
 * The tip is at viewBox coordinate (4, 2).
 */
export function arrowTipOffsetPx(svgSizePx: number): { dx: number; dy: number } {
  // viewBox is 0 0 24 24; tip is at (4, 2)
  const scale = svgSizePx / 24;
  return {
    dx: 4 * scale,
    dy: 2 * scale,
  };
}
