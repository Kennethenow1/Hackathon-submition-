export const CURSOR_ARROW_PATH_D =
  'M 4 2 L 4 18 L 8 14 L 12 21 L 14 20 L 10 13 L 16 13 Z';

export function arrowTipOffsetPx(svgSize: number) {
  // The tip of the arrow is at the top-left (4, 2) in the 24x24 viewBox
  const tipXRatio = 4 / 24;
  const tipYRatio = 2 / 24;
  return {
    dx: tipXRatio * svgSize,
    dy: tipYRatio * svgSize,
  };
}
