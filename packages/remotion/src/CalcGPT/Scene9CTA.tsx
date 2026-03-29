import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadRaleway } from '@remotion/google-fonts/Raleway';
import { PALETTE } from './constants';
import { GradientMesh } from './GradientMesh';
import { Particles } from './Particles';
import { WordByWord } from './WordByWord';

const { fontFamily: interFamily } = loadInter();
const { fontFamily: ralewayFamily } = loadRaleway();

export const Scene9CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // CTA slab entrance
  const slabS = spring({ frame: frame - 0, fps, config: { damping: 16, stiffness: 100 } });
  const slabScale = interpolate(slabS, [0, 1], [0.94, 1]);
  const slabOpacity = interpolate(slabS, [0, 1], [0, 1]);

  // Supporting line
  const supportOpacity = interpolate(frame, [28, 56], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const supportY = interpolate(frame, [28, 56], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // CTA button
  const btnS = spring({ frame: frame - 42, fps, config: { damping: 16, stiffness: 90 } });
  const btnY = interpolate(btnS, [0, 1], [30, 0]);
  const btnOpacity = interpolate(btnS, [0, 1], [0, 1]);

  // Button glow pulse
  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7]);

  // Camera hold push
  const camScale = interpolate(frame, [60, 132], [1.0, 1.03], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Lens flare orbs
  const orb1X = interpolate(Math.sin(frame * 0.008), [-1, 1], [-20, 20]);
  const orb2X = interpolate(Math.cos(frame * 0.01), [-1, 1], [-15, 15]);

  return (
    <AbsoluteFill style={{ background: PALETTE.bgPrimary }}>
      <GradientMesh
        colors={['#8A6BF2', '#3B82F6', '#ec4899', '#f97316']}
        baseColor={PALETTE.bgPrimary}
      />

      {/* Edge blooms */}
      <div
        style={{
          position: 'absolute',
          left: `${5 + orb1X}%`,
          top: '30%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138,107,242,0.15) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: `${5 + orb2X}%`,
          bottom: '20%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 65%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles
          count={14}
          colors={['rgba(138,107,242,0.5)', 'rgba(59,130,246,0.45)', 'rgba(236,72,153,0.35)']}
        />
      </AbsoluteFill>

      {/* Camera push */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${camScale})`,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* CTA slab */}
        <div
          style={{
            transform: `scale(${slabScale})`,
            opacity: slabOpacity,
            maxWidth: 1100,
            width: '90%',
            padding: '100px 60px',
            borderRadius: 28,
            background: 'linear-gradient(135deg, rgba(138,107,242,0.2), rgba(59,130,246,0.2))',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            textAlign: 'center',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 120px rgba(138,107,242,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer sweep */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(90deg, transparent ${interpolate(frame, [60, 132], [0, 100], { extrapolateRight: 'clamp' })}%, rgba(255,255,255,0.03) ${interpolate(frame, [60, 132], [10, 110], { extrapolateRight: 'clamp' })}%, transparent ${interpolate(frame, [60, 132], [20, 120], { extrapolateRight: 'clamp' })}%)`,
              pointerEvents: 'none',
              borderRadius: 28,
            }}
          />

          {/* CalcGPT label */}
          <div
            style={{
              fontFamily: interFamily,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: PALETTE.accentBlue,
              marginBottom: 24,
            }}
          >
            CalcGPT
          </div>

          {/* Main headline */}
          <h2
            style={{
              fontFamily: ralewayFamily,
              fontSize: 80,
              fontWeight: 800,
              color: PALETTE.textPrimary,
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 24,
            }}
          >
            <WordByWord
              text="Stop stressing. Start Solving."
              startFrame={10}
              gapFrames={4}
              highlightWords={['Solving.']}
              highlightColor="#8A6BF2"
            />
          </h2>

          {/* Supporting line */}
          <p
            style={{
              fontFamily: interFamily,
              fontSize: 22,
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 500,
              margin: '0 auto 40px',
              lineHeight: 1.6,
              opacity: supportOpacity,
              transform: `translateY(${supportY}px)`,
            }}
          >
            Pass your class before it passes you. Use CalcGPT.
          </p>

          {/* CTA Button */}
          <div
            style={{
              transform: `translateY(${btnY}px)`,
              opacity: btnOpacity,
              display: 'inline-block',
            }}
          >
            <div
              style={{
                padding: '16px 36px',
                background: '#ffffff',
                color: PALETTE.accentPurple,
                borderRadius: 14,
                fontSize: 20,
                fontWeight: 700,
                fontFamily: interFamily,
                boxShadow: `0 12px 40px rgba(139,92,246,${glowPulse * 0.5}), 0 0 80px rgba(139,92,246,${glowPulse * 0.2})`,
                cursor: 'pointer',
                display: 'inline-block',
              }}
            >
              Use CalcGPT for free
            </div>
          </div>

          {/* Trust line */}
          <div
            style={{
              marginTop: 28,
              fontSize: 14,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: interFamily,
              opacity: btnOpacity,
            }}
          >
            ⭐⭐⭐⭐⭐ Trusted by 800,000+ students · No credit card required
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
