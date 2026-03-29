import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { GradientMeshBg } from '../helpers/GradientMeshBg';
import { Particles } from '../helpers/Particles';
import { BlurredOrb } from '../helpers/BlurredOrb';
import { MetricCounter } from '../helpers/MetricCounter';
import { COLORS } from '../constants';

export const Scene7_Metrics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background screenshot fade
  const bgO = interpolate(frame, [0, 16], [0, 0.3], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Cards entrance
  const card1Spring = spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 80 } });
  const card2Spring = spring({ frame: frame - 20, fps, config: { damping: 16, stiffness: 80 } });

  // Subline
  const subO = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Brightness ramp
  const brightness = interpolate(frame, [48, 60], [1, 1.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ filter: `brightness(${brightness})` }}>
      <GradientMeshBg colors={['#ffffff', '#f3f4f6', '#3490dc', '#dbeafe']} intensity={0.5} />
      <Particles count={10} color="rgba(52,144,220,0.18)" />
      <BlurredOrb x={50} y={50} size={300} color="rgba(52,144,220,0.12)" />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        <div style={{ display: 'flex', gap: 40 }}>
          {/* Metric 1 */}
          <div
            style={{
              transform: `translateY(${interpolate(card1Spring, [0, 1], [40, 0])}px)`,
              opacity: interpolate(card1Spring, [0, 1], [0, 1]),
              background: COLORS.white,
              borderRadius: 20,
              border: `1px solid ${COLORS.borderGray200}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              padding: '36px 56px',
              textAlign: 'center',
            }}
          >
            <MetricCounter value={2000000} suffix="+" delay={10} fontSize={56} color={COLORS.textBlack} />
            <div style={{ fontSize: 16, color: COLORS.textGray500, marginTop: 8, fontFamily: 'Inter, system-ui, sans-serif' }}>
              Unique Students
            </div>
          </div>

          {/* Metric 2 */}
          <div
            style={{
              transform: `translateY(${interpolate(card2Spring, [0, 1], [40, 0])}px)`,
              opacity: interpolate(card2Spring, [0, 1], [0, 1]),
              background: COLORS.white,
              borderRadius: 20,
              border: `1px solid ${COLORS.borderGray200}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              padding: '36px 56px',
              textAlign: 'center',
            }}
          >
            <MetricCounter value={150} suffix="+" delay={20} fontSize={56} color={COLORS.textBlack} />
            <div style={{ fontSize: 16, color: COLORS.textGray500, marginTop: 8, fontFamily: 'Inter, system-ui, sans-serif' }}>
              Countries
            </div>
          </div>
        </div>

        {/* Supporting line */}
        <div
          style={{
            opacity: subO,
            fontSize: 16,
            color: COLORS.textGray500,
            fontFamily: 'Inter, system-ui, sans-serif',
            maxWidth: 500,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Advanced AI math technology serving students globally
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
