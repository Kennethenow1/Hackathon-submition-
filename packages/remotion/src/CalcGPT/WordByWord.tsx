import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

type WordByWordProps = {
  text?: string;
  startFrame?: number;
  gapFrames?: number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
  highlightWords?: string[];
  highlightColor?: string;
};

export const WordByWord: React.FC<WordByWordProps> = ({
  text = '',
  startFrame = 0,
  gapFrames = 4,
  style = {},
  wordStyle = {},
  highlightWords = [],
  highlightColor = '#8A6BF2',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = (text ?? '').split(' ');

  return (
    <span style={{ display: 'inline', ...style }}>
      {words.map((word, i) => {
        const delay = startFrame + i * gapFrames;
        const s = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 120 },
        });
        const y = interpolate(s, [0, 1], [32, 0]);
        const opacity = interpolate(s, [0, 1], [0, 1]);
        const isHighlighted = highlightWords.includes(word.replace(/[.,!?]/g, ''));
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}px)`,
              opacity,
              marginRight: '0.28em',
              background: isHighlighted
                ? `linear-gradient(135deg, ${highlightColor}, #3B82F6)`
                : undefined,
              WebkitBackgroundClip: isHighlighted ? 'text' : undefined,
              WebkitTextFillColor: isHighlighted ? 'transparent' : undefined,
              backgroundClip: isHighlighted ? 'text' : undefined,
              ...wordStyle,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};
