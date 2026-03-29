import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { BrowserFrame } from '../../BrowserFrame';
import { COLORS } from '../constants';
import { FONT_FAMILY } from '../fonts';
import { GradientBg } from '../utils/GradientBg';
import { Particles } from '../utils/Particles';
import { LensFlare } from '../utils/LensFlare';

export const SCENE9_DURATION = 120;

export const Scene9: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background intensify
  const bgIntensity = interpolate(frame, [0, 120], [0.6, 1], { extrapolateRight: 'clamp' });

  // Brand
  const brandEnter = spring({ frame, fps, delay: 0, config: { damping: 20, stiffness: 60 } });
  const brandScale = interpolate(brandEnter, [0, 1], [0.92, 1], { extrapolateRight: 'clamp' });

  // Subhead
  const subEnter = spring({ frame, fps, delay: 10, config: { damping: 200 } });
  const subY = interpolate(subEnter, [0, 1], [24, 0], { extrapolateRight: 'clamp' });

  // Subtitle
  const subtitleEnter = spring({ frame, fps, delay: 18, config: { damping: 200 } });

  // CTA pill
  const ctaEnter = spring({ frame, fps, delay: 24, config: { damping: 14, stiffness: 60 } });
  const ctaY = interpolate(ctaEnter, [0, 1], [30, 0], { extrapolateRight: 'clamp' });

  // Shimmer on CTA
  const shimmerX = frame >= 54 && frame <= 72
    ? interpolate(frame, [54, 72], [-100, 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : -200;

  // Mini browser
  const miniBrowserEnter = spring({ frame, fps, delay: 20, config: { damping: 200 } });
  const miniY = interpolate(miniBrowserEnter, [0, 1], [20, 0]);

  // Float
  const floatY = Math.sin(frame * 0.04) * 2;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ opacity: bgIntensity, width: '100%', height: '100%' }}>
        <GradientBg colors={[COLORS.subtleBlue, COLORS.accentBlue, COLORS.offWhite, COLORS.lightGray]} />
      </div>
      <Particles count={8} color="rgba(74,143,231,0.15)" />
      <LensFlare x={50} y={20} size={300} color="rgba(255,255,255,0.15)" />
      <LensFlare x={30} y={75} size={200} color="rgba(74,143,231,0.12)" />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${floatY}px)`,
        }}
      >
        {/* Mini browser behind */}
        <div
          style={{
            position: 'absolute',
            zIndex: 0,
            opacity: interpolate(miniBrowserEnter, [0, 1], [0, 0.45]),
            transform: `translateY(${miniY + 40}px) scale(0.55)`,
          }}
        >
          <BrowserFrame url="flyer.it.com" width={700}>
            <div style={{ height: 200, background: COLORS.offWhite }} />
          </BrowserFrame>
        </div>

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' as const }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: COLORS.darkText,
              fontFamily: FONT_FAMILY,
              opacity: brandEnter,
              transform: `scale(${brandScale})`,
              marginBottom: 12,
            }}
          >
            Flyer
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: COLORS.charcoal,
              fontFamily: FONT_FAMILY,
              opacity: subEnter,
              transform: `translateY(${subY}px)`,
              marginBottom: 8,
            }}
          >
            Scan Your Flyer
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 400,
              color: COLORS.midGray,
              fontFamily: FONT_FAMILY,
              opacity: subtitleEnter,
              marginBottom: 28,
            }}
          >
            Extract event details instantly with AI
          </div>

          {/* CTA pill */}
          <div
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              borderRadius: 50,
              background: `linear-gradient(135deg, ${COLORS.accentBlue}, ${COLORS.subtleBlue})`,
              color: '#fff',
              fontSize: 18,
              fontWeight: 600,
              fontFamily: FONT_FAMILY,
              boxShadow: `0 12px 32px -8px rgba(59,125,216,0.4)`,
              opacity: ctaEnter,
              transform: `translateY(${ctaY}px)`,
              position: 'relative' as const,
              overflow: 'hidden' as const,
            }}
          >
            flyer.it.com
            {/* Shimmer */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: shimmerX,
                width: 60,
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transform: 'skewX(-15deg)',
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
