import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const HighlightSweep: React.FC<{
  text?: string;
  startFrame?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: number | string;
  style?: React.CSSProperties;
}> = ({
  text = 'Highlight',
  startFrame = 0,
  color = 'rgba(52,144,220,0.25)',
  fontSize = 64,
  fontWeight = 700,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - startFrame, [0, 20], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        fontSize,
        fontWeight,
        fontFamily: 'Inter, system-ui, sans-serif',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '35%',
          width: `${progress}%`,
          background: color,
          borderRadius: 4,
          zIndex: 0,
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{text}</span>
    </span>
  );
};
