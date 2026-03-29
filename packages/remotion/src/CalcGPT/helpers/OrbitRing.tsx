import React from 'react';
import { useCurrentFrame } from 'remotion';

export const OrbitRing: React.FC<{
  size?: number;
  speed?: number;
  color?: string;
  dashArray?: string;
  style?: React.CSSProperties;
}> = ({
  size = 300,
  speed = 0.3,
  color = 'rgba(255,255,255,0.1)',
  dashArray = '8 12',
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) rotate(${frame * speed}deg)`,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 4}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeDasharray={dashArray}
      />
    </svg>
  );
};
