import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const GradientMeshBg: React.FC<{
  colors?: string[];
  intensity?: number;
}> = ({ colors = ['#3490dc', '#f3f4f6', '#ffffff', '#e5e7eb'], intensity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: -120,
          background: `
            radial-gradient(ellipse 80% 60% at ${50 + Math.sin(frame * 0.008) * 18}% ${38 + Math.cos(frame * 0.006) * 12}%, ${colors[0]}${Math.round(intensity * 0.45 * 255).toString(16).padStart(2, '0')} 0%, transparent 70%),
            radial-gradient(ellipse 70% 80% at ${28 + Math.cos(frame * 0.01) * 22}% ${62 + Math.sin(frame * 0.007) * 18}%, ${colors[1]}${Math.round(intensity * 0.5 * 255).toString(16).padStart(2, '0')} 0%, transparent 65%),
            radial-gradient(ellipse 90% 50% at ${72 + Math.sin(frame * 0.012) * 14}% ${28 + Math.cos(frame * 0.009) * 12}%, ${colors[2]}${Math.round(intensity * 0.35 * 255).toString(16).padStart(2, '0')} 0%, transparent 60%),
            radial-gradient(ellipse 60% 70% at ${50 + Math.cos(frame * 0.011) * 16}% ${72 + Math.sin(frame * 0.008) * 14}%, ${colors[3]}${Math.round(intensity * 0.3 * 255).toString(16).padStart(2, '0')} 0%, transparent 70%),
            linear-gradient(135deg, #ffffff 0%, #f8f9fb 50%, #eef2f7 100%)
          `,
        }}
      />
    </AbsoluteFill>
  );
};
