import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface WordByWordProps {
  text?: string;
  startFrame?: number;
  stagger?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  color?: string;
  style?: React.CSSProperties;
  springConfig?: { damping?: number; stiffness?: number; mass?: number };
}

export const WordByWord: React.FC<WordByWordProps> = ({
  text = 'Hello World',
  startFrame = 0,
  stagger = 5,
  fontSize = 72,
  fontFamily = '"DM Serif Display", serif',
  fontWeight = 700,
  color = '#33280e',
  style,
  springConfig = { damping: 14, stiffness: 120 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = (text ?? 'Hello World').split(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.22em',
        fontFamily,
        fontSize,
        fontWeight,
        color,
        lineHeight: 1.15,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const delay = startFrame + i * stagger;
        const s = spring({
          frame: frame - delay,
          fps,
          config: springConfig,
          durationInFrames: 30,
        });
        const y = interpolate(s, [0, 1], [36, 0]);
        const opacity = interpolate(s, [0, 1], [0, 1]);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}px)`,
              opacity,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
