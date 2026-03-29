import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

export const Particles: React.FC<{
  count?: number;
  color?: string;
  spread?: number;
}> = ({ count = 14, color = 'rgba(52,144,220,0.35)', spread = 100 }) => {
  const frame = useCurrentFrame();
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i * 37 + 13) % spread,
        y: (i * 53 + 7) % spread,
        size: 2 + (i % 4),
        speed: 0.3 + (i % 5) * 0.12,
        phase: i * 0.7,
      })),
    [count, spread],
  );
  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y + Math.sin(frame * 0.02 + p.phase) * 2.5}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: color,
            opacity: 0.25 + Math.sin(frame * 0.03 + p.phase) * 0.18,
            transform: `translateY(${Math.sin(frame * p.speed * 0.02) * 12}px)`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
};
