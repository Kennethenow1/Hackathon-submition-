import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const LensFlare: React.FC<{
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}> = ({ x = 70, y = 30, size = 400, color = '#fff' }) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.3, 0.7]);
  const drift = Math.sin(frame * 0.02) * 30;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) translate(${drift}px, 0)`,
        background: `radial-gradient(circle, ${color}${Math.round(pulse * 40)
          .toString(16)
          .padStart(2, '0')} 0%, transparent 60%)`,
        filter: 'blur(20px)',
        mixBlendMode: 'screen' as const,
        pointerEvents: 'none' as const,
      }}
    />
  );
};
