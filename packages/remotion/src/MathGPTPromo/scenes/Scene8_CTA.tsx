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
import { WordByWord } from '../helpers/WordByWord';
import { COLORS } from '../constants';

export const Scene8_CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // BG glow bloom
  const glowScale = interpolate(frame, [0, 20], [0.5, 1.2], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const glowO = interpolate(frame, [0, 20], [0, 0.6], {
    extrapolateRight: 'clamp',
  });

  // Logo
  const logoSpring = spring({ frame: frame - 8, fps, config: { damping: 10, stiffness: 120 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);
  const logoRotate = interpolate(logoSpring, [0, 1], [-15, 0]);

  // CTA button
  const btnSpring = spring({ frame: frame - 22, fps, config: { damping: 14, stiffness: 90 } });
  const btnY = interpolate(btnSpring, [0, 1], [30, 0]);
  const btnO = interpolate(btnSpring, [0, 1], [0, 1]);
  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7]);

  // URL and subline
  const urlO = interpolate(frame, [34, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Micro-float on hold
  const floatY = Math.sin(frame * 0.04) * 2;

  // Shimmer on CTA
  const shimmerX = interpolate(frame, [54, 60], [-100, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <GradientMeshBg colors={['#3490dc', '#dbeafe', '#ffffff', '#f3f4f6']} intensity={0.8} />

      {/* Center glow bloom */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(52,144,220,0.25) 0%, transparent 70%)`,
          transform: `translate(-50%, -50%) scale(${glowScale})`,
          opacity: glowO,
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      <Particles count={12} color="rgba(52,144,220,0.3)" />
      <BlurredOrb x={25} y={35} size={200} />
      <BlurredOrb x={75} y={55} size={180} color="rgba(52,144,220,0.15)" />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          transform: `translateY(${floatY}px)`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
            opacity: logoSpring,
            width: 64,
            height: 64,
            borderRadius: 18,
            background: COLORS.bluePrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 32,
            fontWeight: 700,
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 8px 32px rgba(52,144,220,0.3)',
            marginBottom: 8,
          }}
        >
          M
        </div>

        {/* Product name */}
        <WordByWord
          text="MathGPT"
          startFrame={8}
          staggerFrames={3}
          fontSize={56}
          color={COLORS.textBlack}
          fontWeight={400}
        />

        {/* CTA button */}
        <div
          style={{
            transform: `translateY(${btnY}px)`,
            opacity: btnO,
            padding: '14px 36px',
            borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.bluePrimary}, #2980b9)`,
            color: COLORS.textSlate50,
            fontSize: 18,
            fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
            border: `1px solid ${COLORS.bluePrimary}`,
            boxShadow: `0 12px 28px -8px rgba(52,144,220,${glowPulse})`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          Try MathGPT
          {/* Shimmer */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: shimmerX,
              width: 40,
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Subline */}
        <div
          style={{
            opacity: urlO,
            fontSize: 15,
            color: COLORS.textGray700,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Upgrade your confidence with MathGPT
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlO,
            fontSize: 16,
            color: COLORS.textGray500,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 500,
            letterSpacing: 0.5,
          }}
        >
          math-gpt.org
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
