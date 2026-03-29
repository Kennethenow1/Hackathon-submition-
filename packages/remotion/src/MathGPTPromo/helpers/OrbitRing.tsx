import React from 'react';
import { useCurrentFrame } from 'remotion';

export const OrbitRing: React.FC<{
  size?: number;
  dashArray?: string;
  speed?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({
  size = 300,
  dashArray = '8 12',
  speed = 0.3,
  color = 'rgba(52,144,220,0.12)',
  style = {},
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        transform: `rotate(${frame * speed}deg)`,
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
