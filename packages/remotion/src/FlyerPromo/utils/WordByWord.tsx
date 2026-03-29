import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';

type Props = {
  text?: string;
  startFrame?: number;
  frameGap?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  fontFamily?: string;
  style?: React.CSSProperties;
};

export const WordByWord: React.FC<Props> = ({
  text = 'Hello World',
  startFrame = 0,
  frameGap = 4,
  fontSize = 64,
  fontWeight = 700,
  color = '#1A1C22',
  fontFamily = 'Outfit, sans-serif',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = (text ?? '').split(' ');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 14px', ...style }}>
      {words.map((w, i) => {
        const delay = startFrame + i * frameGap;
        const s = spring({ frame, fps, delay, config: { damping: 20, stiffness: 80 } });
        const ty = interpolate(s, [0, 1], [36, 0], { extrapolateRight: 'clamp' });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontSize,
              fontWeight,
              color,
              fontFamily,
              opacity: s,
              transform: `translateY(${ty}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
