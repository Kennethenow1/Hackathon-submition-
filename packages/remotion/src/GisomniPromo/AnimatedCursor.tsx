import React from "react";
import {
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { arrowTipOffsetPx, CURSOR_ARROW_PATH_D } from "../cursorTipOffset";

type CursorPoint = {
  x: number;
  y: number;
  frame: number;
  click?: boolean;
};

type Props = {
  points?: CursorPoint[];
  startDelay?: number;
};

export const AnimatedCursor: React.FC<Props> = ({
  points = [{ x: 100, y: 100, frame: 0 }],
  startDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const f = frame - startDelay;
  const tip = arrowTipOffsetPx(24);

  let x = points[0]?.x ?? 0;
  let y = points[0]?.y ?? 0;
  let clicking = false;

  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    if (!from || !to) continue;
    if (f >= from.frame && f <= to.frame) {
      const t = interpolate(f, [from.frame, to.frame], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
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

  const lastPoint = points.find((p) => p.click && Math.abs(f - p.frame) < 5);
  if (lastPoint) clicking = true;

  const cursorScale = clicking
    ? interpolate(Math.abs(f - (lastPoint?.frame ?? 0)), [0, 5], [0.8, 1], {
        extrapolateRight: "clamp",
      })
    : 1;

  const visible = f >= 0;

  return visible ? (
    <div
      style={{
        position: "absolute",
        left: x - tip.dx,
        top: y - tip.dy,
        width: 24,
        height: 24,
        transform: `scale(${cursorScale})`,
        pointerEvents: "none" as const,
        zIndex: 9999,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d={CURSOR_ARROW_PATH_D} fill="white" stroke="black" strokeWidth="1.5" />
      </svg>
      {clicking && (
        <div
          style={{
            position: "absolute",
            top: -8,
            left: -8,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "2px solid rgba(150,150,255,0.5)",
            background: "rgba(150,150,255,0.1)",
          }}
        />
      )}
    </div>
  ) : null;
};
