import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const BlurredOrb: React.FC<{
  x: number;
  y: number;
  size?: number;
  color?: string;
}> = ({ x, y, size = 220, color = 'rgba(52,144,220,0.18)' }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.008) * 18;
  const pulse = interpolate(Math.sin(frame * 0.015), [-1, 1], [0.6, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
        transform: `translate(${drift}px, ${Math.cos(frame * 0.01) * 12}px)`,
        opacity: pulse,
        pointerEvents: 'none',
      }}
    />
  );
};
