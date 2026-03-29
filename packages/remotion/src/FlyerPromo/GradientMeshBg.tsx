import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

interface GradientMeshBgProps {
  colors?: string[];
  dark?: boolean;
}

export const GradientMeshBg: React.FC<GradientMeshBgProps> = ({
  colors = ['#6366f1', '#818cf8', '#e0e7ff', '#f7f8fa'],
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const s1x = 50 + Math.sin(frame * 0.008) * 18;
  const s1y = 40 + Math.cos(frame * 0.007) * 14;
  const s2x = 30 + Math.cos(frame * 0.011) * 22;
  const s2y = 60 + Math.sin(frame * 0.009) * 18;
  const s3x = 70 + Math.sin(frame * 0.013) * 14;
  const s3y = 30 + Math.cos(frame * 0.01) * 12;

  const base = dark ? '#0f0f1a' : '#f7f8fa';
  const base2 = dark ? '#1a1a2e' : '#eef0f7';

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: -80,
          background: `
            radial-gradient(ellipse 75% 55% at ${s1x}% ${s1y}%, ${colors[0]}55 0%, transparent 70%),
            radial-gradient(ellipse 65% 75% at ${s2x}% ${s2y}%, ${colors[1]}44 0%, transparent 65%),
            radial-gradient(ellipse 85% 45% at ${s3x}% ${s3y}%, ${colors[2]}38 0%, transparent 60%),
            linear-gradient(135deg, ${base} 0%, ${base2} 100%)
          `,
        }}
      />
    </AbsoluteFill>
  );
};
