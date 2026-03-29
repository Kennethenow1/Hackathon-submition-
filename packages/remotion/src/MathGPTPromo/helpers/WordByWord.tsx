import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const WordByWord: React.FC<{
  text?: string;
  startFrame?: number;
  staggerFrames?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number | string;
  lineHeight?: number;
  style?: React.CSSProperties;
}> = ({
  text = 'Default Text',
  startFrame = 0,
  staggerFrames = 4,
  fontSize = 64,
  color = '#000',
  fontWeight = 700,
  lineHeight = 1.15,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = (text ?? 'Default Text').split(' ');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, ...style }}>
      {words.map((word, i) => {
        const delay = startFrame + i * staggerFrames;
        const s = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 120 },
        });
        const y = interpolate(s, [0, 1], [36, 0]);
        const o = interpolate(s, [0, 1], [0, 1]);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}px)`,
              opacity: o,
              fontSize,
              fontWeight,
              color,
              lineHeight,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
