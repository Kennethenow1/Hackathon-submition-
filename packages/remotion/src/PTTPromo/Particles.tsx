import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface ParticleConfig {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  width?: number;
  height?: number;
}

export const Particles: React.FC<ParticleConfig> = ({
  count = 18,
  colors = ['rgba(212,194,92,0.45)', 'rgba(107,124,61,0.35)', 'rgba(234,215,102,0.4)'],
  minSize = 3,
  maxSize = 8,
  width = 1920,
  height = 1080,
}) => {
  const frame = useCurrentFrame();
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      x: ((i * 131 + 47) % 97) / 97,
      y: ((i * 79 + 23) % 89) / 89,
      size: minSize + ((i * 37) % (maxSize - minSize + 1)),
      speed: 0.25 + ((i * 13) % 7) * 0.08,
      phase: i * 0.71,
      colorIdx: i % colors.length,
      driftX: (((i * 53) % 11) - 5) * 0.12,
    })),
  [count, minSize, maxSize, colors.length]);

  return (
    <>
      {particles.map((p, i) => {
        const y = (p.y * height) + Math.sin(frame * p.speed * 0.04 + p.phase) * 18;
        const x = (p.x * width) + Math.sin(frame * 0.025 + p.phase * 1.3) * 12 + frame * p.driftX;
        const opacity = 0.25 + Math.sin(frame * 0.03 + p.phase) * 0.15;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: colors[p.colorIdx],
              opacity,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};
