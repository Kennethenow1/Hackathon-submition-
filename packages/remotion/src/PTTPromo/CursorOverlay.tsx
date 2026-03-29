import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { arrowTipOffsetPx, CURSOR_ARROW_PATH_D } from '../cursorTipOffset';

interface CursorPoint {
  x: number;
  y: number;
  frame: number;
  click?: boolean;
}

interface CursorOverlayProps {
  points?: CursorPoint[];
  visible?: boolean;
  localFrame?: number;
}

export const CursorOverlay: React.FC<CursorOverlayProps> = ({
  points = [],
  visible = true,
  localFrame,
}) => {
  const globalFrame = useCurrentFrame();
  const frame = localFrame !== undefined ? localFrame : globalFrame;

  if (!visible || points.length === 0) return null;

  let x = points[0]?.x ?? 0;
  let y = points[0]?.y ?? 0;
  let clicking = false;
  let clickFrame = -999;

  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    if (frame >= from.frame && frame <= to.frame) {
      const t = interpolate(frame, [from.frame, to.frame], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.quad),
      });
      x = interpolate(t, [0, 1], [from.x, to.x]);
      y = interpolate(t, [0, 1], [from.y, to.y]);
      break;
    } else if (frame > to.frame) {
      x = to.x;
      y = to.y;
    }
  }

  const clickPoint = points.find(p => p.click && Math.abs(frame - p.frame) < 8);
  if (clickPoint) {
    clicking = true;
    clickFrame = clickPoint.frame;
  }

  const clickProgress = clicking
    ? interpolate(Math.abs(frame - clickFrame), [0, 8], [0, 1], { extrapolateRight: 'clamp' })
    : 0;
  const cursorScale = clicking ? interpolate(clickProgress, [0, 0.5, 1], [1, 0.8, 1]) : 1;
  const rippleScale = clicking ? interpolate(clickProgress, [0, 1], [0.3, 2.2]) : 0;
  const rippleOpacity = clicking ? interpolate(clickProgress, [0, 0.4, 1], [0.8, 0.6, 0]) : 0;

  const tip = arrowTipOffsetPx(24);
  const showCursor = frame >= (points[0]?.frame ?? 0);

  if (!showCursor) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - tip.dx,
        top: y - tip.dy,
        width: 24,
        height: 24,
        transform: `scale(${cursorScale})`,
        pointerEvents: 'none',
        zIndex: 9999,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d={CURSOR_ARROW_PATH_D} fill="white" stroke="black" strokeWidth="1.5" />
      </svg>
      {clicking && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: `2px solid rgba(107,124,61,0.6)`,
            background: 'rgba(107,124,61,0.12)',
            transform: `translate(-50%,-50%) scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}
    </div>
  );
};
