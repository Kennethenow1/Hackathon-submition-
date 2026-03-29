import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

type ParticleConfig = {
  count?: number;
  colors?: string[];
  maxSize?: number;
};

export const Particles: React.FC<ParticleConfig> = ({
  count = 18,
  colors = ['rgba(139,92,246,0.5)', 'rgba(59,130,246,0.5)', 'rgba(236,72,153,0.4)'],
  maxSize = 5,
}) => {
  const frame = useCurrentFrame();
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i * 37 + 13) % 100,
        y: (i * 53 + 7) % 100,
        size: 2 + (i % Math.max(1, Math.round(maxSize))),
        speed: 0.3 + (i % 5) * 0.15,
        phase: i * 0.7,
        colorIdx: i % colors.length,
      })),
    [count, maxSize, colors.length]
  );

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${(p.y + Math.sin(frame * 0.02 + p.phase) * 3) % 100}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: colors[p.colorIdx] ?? colors[0],
            opacity: 0.3 + Math.sin(frame * 0.03 + p.phase) * 0.2,
            transform: `translateY(${Math.sin(frame * p.speed * 0.02) * 15}px)`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
};
