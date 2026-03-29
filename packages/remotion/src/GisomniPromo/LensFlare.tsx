import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

type Props = {
  x?: number;
  y?: number;
  size?: number;
  color?: string;
};

export const LensFlare: React.FC<Props> = ({
  x = 70,
  y = 30,
  size = 400,
  color = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.15, 0.45]);
  const drift = Math.sin(frame * 0.018) * 25;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) translate(${drift}px, 0)`,
        background: `radial-gradient(circle, ${color}${Math.round(pulse * 255).toString(16).padStart(2, "0")} 0%, transparent 60%)`,
        filter: "blur(30px)",
        mixBlendMode: "screen" as const,
        pointerEvents: "none" as const,
      }}
    />
  );
};
