import React from "react";
import { useCurrentFrame } from "remotion";

type ParticleProps = {
  count?: number;
  color?: string;
  maxSize?: number;
  speed?: number;
  seed?: number;
};

const seededRandom = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Particles: React.FC<ParticleProps> = ({
  count = 20,
  color = "rgba(255,255,255,0.4)",
  maxSize = 3,
  speed = 0.3,
  seed = 42,
}) => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: count }, (_, i) => {
    const r1 = seededRandom(seed + i * 13);
    const r2 = seededRandom(seed + i * 17 + 7);
    const r3 = seededRandom(seed + i * 23 + 3);
    const r4 = seededRandom(seed + i * 31 + 11);
    const size = 1 + r3 * maxSize;
    const x = r1 * 100;
    const baseY = r2 * 100;
    const y = (baseY - frame * speed * (0.3 + r4 * 0.7)) % 110;
    const adjustedY = y < -5 ? y + 115 : y;
    const opacity = 0.2 + r4 * 0.6;
    return { x, y: adjustedY, size, opacity, key: i };
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((p) => (
        <div
          key={p.key}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: color,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};
