import React from 'react';
import { useCurrentFrame } from 'remotion';
import { AbsoluteFill } from 'remotion';

interface GradientMeshBgProps {
  colors?: string[];
  baseColor?: string;
}

export const GradientMeshBg: React.FC<GradientMeshBgProps> = ({
  colors = ['#d3c25c', '#ead766', '#6b7c3d', '#b0a24d'],
  baseColor = '#fdfbf0',
}) => {
  const frame = useCurrentFrame();
  const t = frame * 0.008;

  const p1x = 50 + Math.sin(t * 1.1) * 20;
  const p1y = 35 + Math.cos(t * 0.9) * 15;
  const p2x = 25 + Math.cos(t * 1.3) * 22;
  const p2y = 65 + Math.sin(t * 1.0) * 18;
  const p3x = 75 + Math.sin(t * 0.7) * 18;
  const p3y = 28 + Math.cos(t * 1.4) * 12;
  const p4x = 55 + Math.cos(t * 1.2) * 16;
  const p4y = 72 + Math.sin(t * 0.8) * 14;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at ${p1x}% ${p1y}%, ${colors[0]}55 0%, transparent 68%),
          radial-gradient(ellipse 65% 75% at ${p2x}% ${p2y}%, ${colors[1]}44 0%, transparent 62%),
          radial-gradient(ellipse 85% 50% at ${p3x}% ${p3y}%, ${colors[2]}38 0%, transparent 60%),
          radial-gradient(ellipse 55% 65% at ${p4x}% ${p4y}%, ${colors[3]}33 0%, transparent 68%),
          ${baseColor}
        `,
        overflow: 'hidden',
      }}
    />
  );
};
