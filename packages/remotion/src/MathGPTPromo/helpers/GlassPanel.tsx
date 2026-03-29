import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const GlassPanel: React.FC<{
  children: React.ReactNode;
  enterDelay?: number;
  fromRight?: boolean;
  style?: React.CSSProperties;
}> = ({ children, enterDelay = 0, fromRight = true, style = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - enterDelay,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const tx = interpolate(s, [0, 1], [fromRight ? 60 : -60, 0]);
  const o = interpolate(s, [0, 1], [0, 1]);
  return (
    <div
      style={{
        padding: '20px 28px',
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 16,
        transform: `translateX(${tx}px)`,
        opacity: o,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
