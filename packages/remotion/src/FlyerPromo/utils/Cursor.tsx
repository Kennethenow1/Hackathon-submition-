import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { arrowTipOffsetPx, CURSOR_ARROW_PATH_D } from '../../cursorTipOffset';

type Point = { x: number; y: number; frame: number; click?: boolean };

type Props = {
  points?: Point[];
  startDelay?: number;
};

export const Cursor: React.FC<Props> = ({ points = [], startDelay = 0 }) => {
  const frame = useCurrentFrame();
  const f = frame - startDelay;
  if (points.length === 0 || f < 0) return null;

  let x = points[0].x;
  let y = points[0].y;
  let clicking = false;

  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    if (f >= from.frame && f <= to.frame) {
      const t = interpolate(f, [from.frame, to.frame], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.quad),
      });
      x = interpolate(t, [0, 1], [from.x, to.x]);
      y = interpolate(t, [0, 1], [from.y, to.y]);
      break;
    } else if (f > to.frame) {
      x = to.x;
      y = to.y;
    }
  }

  const lastP = points.find((p) => p.click && Math.abs(f - p.frame) < 4);
  if (lastP) clicking = true;
  const cs = clicking ? interpolate(Math.abs(f - (lastP?.frame ?? 0)), [0, 4], [0.8, 1], { extrapolateRight: 'clamp' }) : 1;

  const visible = f >= (points[0]?.frame ?? 0);
  if (!visible) return null;

  const tip = arrowTipOffsetPx(24);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - tip.dx,
        top: y - tip.dy,
        width: 24,
        height: 24,
        transform: `scale(${cs})`,
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
            top: -8,
            left: -8,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid rgba(74,143,231,0.5)',
            background: 'rgba(74,143,231,0.1)',
          }}
        />
      )}
    </div>
  );
};
