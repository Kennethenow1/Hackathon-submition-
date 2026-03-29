import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

type ParticleConfig = {
  count?: number;
  colors?: string[];
  opacity?: number;
};

export const Particles: React.FC<ParticleConfig> = ({
  count = 18,
  colors = ['#8b5cf6', '#3b82f6', '#ec4899'],
  opacity = 0.3,
}) => {
  const frame = useCurrentFrame();
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i * 37 + 13) % 100,
        y: (i * 53 + 7) % 100,
        size: 2 + (i % 5),
        speed: 0.3 + (i % 5) * 0.12,
        phase: i * 0.7,
        color: colors[i % colors.length],
      })),
    [count, colors],
  );

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y + Math.sin(frame * 0.02 + p.phase) * 3}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            opacity: opacity + Math.sin(frame * 0.03 + p.phase) * 0.15,
            transform: `translateY(${Math.sin(frame * p.speed * 0.02) * 15}px)`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
};
