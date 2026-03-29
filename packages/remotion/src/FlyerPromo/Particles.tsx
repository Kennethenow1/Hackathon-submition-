import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface ParticlesProps {
  count?: number;
  color?: string;
  opacity?: number;
}

export const Particles: React.FC<ParticlesProps> = ({
  count = 16,
  color = 'rgba(99,102,241,0.4)',
  opacity = 1,
}) => {
  const frame = useCurrentFrame();

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: ((i * 37 + 13) % 97) + 1.5,
        y: ((i * 53 + 7) % 93) + 3.5,
        size: 2 + (i % 4),
        speed: 0.25 + (i % 5) * 0.12,
        phase: i * 0.71,
      })),
    [count]
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
            opacity:
              opacity * (0.25 + Math.sin(frame * 0.03 + p.phase) * 0.15),
            transform: `translateY(${Math.sin(frame * p.speed * 0.025) * 12}px)`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
};
