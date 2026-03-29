import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

type Props = {
  x?: number;
  y?: number;
  size?: number;
  color?: string;
};

export const LensFlare: React.FC<Props> = ({
  x = 70,
  y = 30,
  size = 350,
  color = 'rgba(74,143,231,0.3)',
}) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.2, 0.55]);
  const drift = Math.sin(frame * 0.018) * 25;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) translate(${drift}px, ${Math.cos(frame * 0.02) * 15}px)`,
        background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
        opacity: pulse,
        filter: 'blur(18px)',
        mixBlendMode: 'screen' as const,
        pointerEvents: 'none' as const,
      }}
    />
  );
};
