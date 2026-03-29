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
import { LensFlare } from '../helpers/LensFlare';
import { MathGPTLogo } from '../helpers/MathGPTLogo';
import { WordByWord } from '../helpers/WordByWord';
import { COLORS } from '../constants';

export const Scene8_ClosingCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // BG glow bloom
  const glowScale = interpolate(frame, [0, 20], [0.6, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Logo
  const logoS = spring({ frame: frame - 8, fps, config: { damping: 10, stiffness: 120 } });
  const logoScale = interpolate(logoS, [0, 1], [0.5, 1]);
  const logoRot = interpolate(logoS, [0, 1], [-15, 0]);

  // CTA button
  const ctaS = spring({ frame: frame - 22, fps, config: { damping: 14, stiffness: 90 } });
  const ctaY = interpolate(ctaS, [0, 1], [30, 0]);
  const ctaO = interpolate(ctaS, [0, 1], [0, 1]);
  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7]);

  // URL
  const urlS = spring({ frame: frame - 34, fps, config: { damping: 20, stiffness: 80 } });
  const urlO = interpolate(urlS, [0, 1], [0, 1]);
  const urlY = interpolate(urlS, [0, 1], [12, 0]);

  // Micro-float
  const microY = Math.sin(frame * 0.04) * 3;

  // Shimmer on CTA
  const shimmerX = interpolate(frame, [0, 60], [-200, 400]);

  return (
    <AbsoluteFill>
      <div style={{ transform: `scale(${glowScale})`, width: '100%', height: '100%' }}>
        <GradientMeshBg colors={[COLORS.bluePrimary, COLORS.white, COLORS.bgGray50, COLORS.bgGray100]} intensity={1.2} />
      </div>
      <Particles count={12} color="rgba(52,144,220,0.3)" seed={500} />
      <BlurredOrb x={30} y={40} size={350} />
      <BlurredOrb x={70} y={60} size={280} color="rgba(52,144,220,0.15)" />
      <LensFlare x={65} y={25} size={300} />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          transform: `translateY(${microY}px)`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale}) rotate(${logoRot}deg)`,
            opacity: logoS,
          }}
        >
          <MathGPTLogo size={72} />
        </div>

        {/* Product name */}
        <WordByWord
          text="MathGPT"
          startFrame={8}
          staggerFrames={4}
          fontSize={64}
          fontWeight={400}
          color={COLORS.textBlack}
          style={{ justifyContent: 'center' }}
        />

        {/* Subline */}
        <p
          style={{
            fontSize: 18,
            color: COLORS.textGray700,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            opacity: urlO,
            transform: `translateY(${urlY}px)`,
            margin: 0,
          }}
        >
          Upgrade your confidence with MathGPT
        </p>

        {/* CTA Button */}
        <div
          style={{
            transform: `translateY(${ctaY}px)`,
            opacity: ctaO,
          }}
        >
          <div
            style={{
              padding: '14px 40px',
              borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.bluePrimary}, #2563eb)`,
              border: `1px solid ${COLORS.bluePrimary}`,
              color: COLORS.textSlate50,
              fontSize: 18,
              fontWeight: 600,
              fontFamily: 'system-ui, sans-serif',
              boxShadow: `0 12px 28px -8px ${COLORS.bluePrimary}${Math.round(glowPulse * 99)
                .toString(16)
                .padStart(2, '0')}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`,
                backgroundSize: '200% 100%',
                backgroundPosition: `${shimmerX}px 0`,
              }}
            />
            <span style={{ position: 'relative', zIndex: 1 }}>Try MathGPT Free</span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 15,
            color: COLORS.textGray500,
            fontFamily: 'system-ui, sans-serif',
            opacity: urlO,
            transform: `translateY(${urlY}px)`,
            marginTop: 4,
          }}
        >
          math-gpt.org
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
