import React from 'react';
import { useCurrentFrame } from 'remotion';

interface OrbitRingProps {
  size?: number;
  speed?: number;
  dashArray?: string;
  color?: string;
  cx?: string;
  cy?: string;
}

export const OrbitRing: React.FC<OrbitRingProps> = ({
  size = 280,
  speed = 0.28,
  dashArray = '8 14',
  color = 'rgba(99,102,241,0.13)',
  cx = '50%',
  cy = '50%',
}) => {
  const frame = useCurrentFrame();
  const rotation = frame * speed;
  return (
    <svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        left: cx,
        top: cy,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        pointerEvents: 'none',
      }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 3}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={dashArray}
      />
    </svg>
  );
};
