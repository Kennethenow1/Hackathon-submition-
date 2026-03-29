import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const MetricCounter: React.FC<{
  value?: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
  fontSize?: number;
  color?: string;
}> = ({
  value = 100,
  suffix = '',
  prefix = '',
  delay = 0,
  fontSize = 72,
  color = '#000',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 40 },
  });
  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));
  const formatted = displayValue.toLocaleString();
  return (
    <span
      style={{
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 700,
        fontSize,
        color,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
