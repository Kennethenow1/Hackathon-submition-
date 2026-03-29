import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { arrowTipOffsetPx, CURSOR_ARROW_PATH_D } from './cursorTipOffset';

interface CursorPoint {
  x: number;
  y: number;
  frame: number;
  click?: boolean;
}

interface FlyCursorProps {
  points: CursorPoint[];
  startVisible?: number;
  size?: number;
}

export const FlyCursor: React.FC<FlyCursorProps> = ({
  points,
  startVisible = 0,
  size = 24,
}) => {
  const frame = useCurrentFrame();
  const tip = arrowTipOffsetPx(size);

  if (frame < startVisible || points.length === 0) return null;

  let x = points[0].x;
  let y = points[0].y;
  let clicking = false;

  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    if (frame >= from.frame && frame <= to.frame) {
      const t = interpolate(frame, [from.frame, to.frame], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.quad),
      });
      x = from.x + (to.x - from.x) * t;
      y = from.y + (to.y - from.y) * t;
      break;
    } else if (frame > to.frame) {
      x = to.x;
      y = to.y;
    }
  }

  const clickPoint = points.find((p) => p.click && Math.abs(frame - p.frame) < 5);
  if (clickPoint) clicking = true;

  const clickAnim = clickPoint
    ? interpolate(Math.abs(frame - clickPoint.frame), [0, 5], [0.8, 1], {
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - tip.dx,
        top: y - tip.dy,
        width: size,
        height: size,
        transform: `scale(${clickAnim})`,
        pointerEvents: 'none',
        zIndex: 9999,
        filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.28))',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d={CURSOR_ARROW_PATH_D} fill="white" stroke="#1a1a2e" strokeWidth="1.5" />
      </svg>
      {clicking && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: -10,
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '2px solid rgba(99,102,241,0.55)',
            background: 'rgba(99,102,241,0.1)',
            animation: 'none',
          }}
        />
      )}
    </div>
  );
};
