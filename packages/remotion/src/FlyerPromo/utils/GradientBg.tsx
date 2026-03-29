import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

type Props = {
  colors?: string[];
  dark?: boolean;
};

export const GradientBg: React.FC<Props> = ({
  colors = ['#4A8FE7', '#E8ECF0', '#F7F8FA', '#B0B8C4'],
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const base = dark ? '#1A1C22' : '#F7F8FA';
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: -120,
          background: `
            radial-gradient(ellipse 80% 60% at ${50 + Math.sin(frame * 0.008) * 18}% ${40 + Math.cos(frame * 0.006) * 12}%, ${colors[0]}44 0%, transparent 70%),
            radial-gradient(ellipse 70% 80% at ${30 + Math.cos(frame * 0.01) * 22}% ${60 + Math.sin(frame * 0.007) * 18}%, ${colors[1]}55 0%, transparent 65%),
            radial-gradient(ellipse 90% 50% at ${70 + Math.sin(frame * 0.012) * 14}% ${30 + Math.cos(frame * 0.009) * 12}%, ${colors[2]}33 0%, transparent 60%),
            radial-gradient(ellipse 60% 70% at ${50 + Math.cos(frame * 0.011) * 18}% ${70 + Math.sin(frame * 0.008) * 14}%, ${colors[3]}22 0%, transparent 70%),
            linear-gradient(135deg, ${base} 0%, ${dark ? '#0f0f14' : '#FFFFFF'} 100%)
          `,
        }}
      />
    </AbsoluteFill>
  );
};
