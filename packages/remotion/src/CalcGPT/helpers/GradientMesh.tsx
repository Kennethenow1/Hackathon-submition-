import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

type GradientMeshProps = {
  colors?: string[];
};

export const GradientMesh: React.FC<GradientMeshProps> = ({
  colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#0a0a0a'],
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: -100,
          background: `
            radial-gradient(ellipse 80% 60% at ${50 + Math.sin(frame * 0.008) * 18}% ${40 + Math.cos(frame * 0.006) * 14}%, ${colors[0]}66 0%, transparent 70%),
            radial-gradient(ellipse 70% 80% at ${30 + Math.cos(frame * 0.01) * 22}% ${60 + Math.sin(frame * 0.007) * 18}%, ${colors[1]}55 0%, transparent 65%),
            radial-gradient(ellipse 90% 50% at ${70 + Math.sin(frame * 0.012) * 14}% ${30 + Math.cos(frame * 0.009) * 14}%, ${colors[2]}44 0%, transparent 60%),
            radial-gradient(ellipse 60% 70% at ${50 + Math.cos(frame * 0.011) * 18}% ${70 + Math.sin(frame * 0.008) * 14}%, ${colors[3]}33 0%, transparent 70%),
            linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)
          `,
        }}
      />
    </AbsoluteFill>
  );
};
