import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { loadFont as loadRaleway } from '@remotion/google-fonts/Raleway';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { GradientMesh } from '../helpers/GradientMesh';
import { Particles } from '../helpers/Particles';
import { LensFlare } from '../helpers/LensFlare';
import { COLORS } from '../constants';

const { fontFamily: raleway } = loadRaleway();
const { fontFamily: inter } = loadInter();

export const Scene10CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // BG bloom
  const bloomScale = interpolate(frame, [0, 22], [0.95, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Line 1: "Stop stressing."
  const line1Spring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const line1Y = interpolate(line1Spring, [0, 1], [30, 0]);

  // Line 2: "Start Solving."
  const line2Spring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const line2Y = interpolate(line2Spring, [0, 1], [30, 0]);

  // Shimmer
  const shimmerX = interpolate(frame, [8, 50], [-200, 500], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subcopy
  const subOpacity = interpolate(frame, [24, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subY = interpolate(frame, [24, 46], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Button
  const btnSpring = spring({
    frame: frame - 32,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const btnScale = interpolate(btnSpring, [0, 1], [0.8, 1]);
  const glowPulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.7],
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bgPrimary }}>
      <div style={{ transform: `scale(${bloomScale})`, position: 'absolute', inset: 0 }}>
        <GradientMesh
          colors={[
            COLORS.bgPrimary,
            COLORS.bgSurface,
            COLORS.accentPink,
            COLORS.accentOrange,
          ]}
        />
      </div>
      <Particles count={10} colors={[COLORS.accentPink, COLORS.accentOrange]} opacity={0.25} />
      <LensFlare x={55} y={40} size={600} color={COLORS.accentPink} />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          {/* Headline line 1 */}
          <div
            style={{
              opacity: line1Spring,
              transform: `translateY(${line1Y}px)`,
              fontFamily: raleway,
              fontSize: 64,
              fontWeight: 500,
              color: COLORS.textPrimary,
              lineHeight: 1.15,
            }}
          >
            Stop stressing.
          </div>

          {/* Headline line 2 with shimmer */}
          <div
            style={{
              opacity: line2Spring,
              transform: `translateY(${line2Y}px)`,
              fontFamily: raleway,
              fontSize: 64,
              fontWeight: 500,
              lineHeight: 1.15,
              background: `linear-gradient(90deg, ${COLORS.textPrimary} 0%, ${COLORS.accentPink} 50%, ${COLORS.textPrimary} 100%)`,
              backgroundSize: '200% 100%',
              backgroundPosition: `${shimmerX}px 0`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Start Solving.
          </div>

          {/* Subcopy */}
          <div
            style={{
              opacity: subOpacity,
              transform: `translateY(${subY}px)`,
              fontFamily: inter,
              fontSize: 18,
              color: COLORS.textSecondary,
              marginTop: 20,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Pass your class before it passes you. Use CalcGPT.
          </div>

          {/* CTA Button */}
          <div
            style={{
              display: 'inline-block',
              padding: '16px 36px',
              borderRadius: 14,
              background: COLORS.textPrimary,
              color: COLORS.bgPrimary,
              fontFamily: inter,
              fontSize: 18,
              fontWeight: 600,
              opacity: btnSpring,
              transform: `scale(${btnScale})`,
              boxShadow: `0 12px 40px rgba(236, 72, 153, ${glowPulse})`,
            }}
          >
            Use CalcGPT for free
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
