import React from 'react';
import { useCurrentFrame } from 'remotion';
import { AbsoluteFill } from 'remotion';

type GradientMeshProps = {
  colors?: [string, string, string, string];
  baseColor?: string;
};

export const GradientMesh: React.FC<GradientMeshProps> = ({
  colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#f97316'],
  baseColor = '#0a0a0a',
}) => {
  const frame = useCurrentFrame();
  const s = (f: number, speed: number, offset = 0) => Math.sin(frame * speed + offset);
  const c = (f: number, speed: number, offset = 0) => Math.cos(frame * speed + offset);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: -100,
          background: [
            `radial-gradient(ellipse 80% 60% at ${50 + s(frame, 0.01) * 20}% ${40 + c(frame, 0.008) * 15}%, ${colors[0]}44 0%, transparent 70%)`,
            `radial-gradient(ellipse 70% 80% at ${30 + c(frame, 0.012) * 25}% ${60 + s(frame, 0.009) * 20}%, ${colors[1]}33 0%, transparent 65%)`,
            `radial-gradient(ellipse 90% 50% at ${70 + s(frame, 0.015) * 15}% ${30 + c(frame, 0.011) * 15}%, ${colors[2]}22 0%, transparent 60%)`,
            `radial-gradient(ellipse 60% 70% at ${50 + c(frame, 0.013) * 20}% ${70 + s(frame, 0.01) * 15}%, ${colors[3]}1a 0%, transparent 70%)`,
            `linear-gradient(135deg, ${baseColor} 0%, #111114 100%)`,
          ].join(', '),
        }}
      />
    </AbsoluteFill>
  );
};
