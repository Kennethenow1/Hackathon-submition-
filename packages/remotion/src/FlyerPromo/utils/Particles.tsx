import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

type ParticleConfig = {
  count?: number;
  color?: string;
  maxSize?: number;
  speed?: number;
  opacity?: number;
};

export const Particles: React.FC<ParticleConfig> = ({
  count = 18,
  color = 'rgba(74,143,231,0.3)',
  maxSize = 4,
  speed = 0.5,
  opacity = 0.6,
}) => {
  const frame = useCurrentFrame();
  const particles = React.useMemo(() => {
    const arr: { x: number; y: number; size: number; phase: number; vx: number; vy: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (i * 137.508) % 100,
        y: (i * 97.31 + 13) % 100,
        size: 1.5 + (i % 3) * (maxSize - 1.5) / 2,
        phase: i * 0.7,
        vx: ((i % 5) - 2) * 0.02 * speed,
        vy: ((i % 3) - 1) * 0.015 * speed,
      });
    }
    return arr;
  }, [count, maxSize, speed]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {particles.map((p, i) => {
        const x = ((p.x + frame * p.vx * speed) % 110) - 5;
        const y = ((p.y + Math.sin(frame * 0.02 + p.phase) * 2 + frame * p.vy * speed) % 110) - 5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: color,
              opacity: opacity * (0.5 + 0.5 * Math.sin(frame * 0.04 + p.phase)),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
