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
import { OrbitRing } from '../helpers/OrbitRing';
import { COLORS } from '../constants';

const painWords = ['Stuck on problems', 'Multiple tools', 'Deadline pressure'];
const solutionCards = ['Upload or type', 'Get step-by-step help', 'Learn with AI videos'];

export const Scene2_ProblemContext: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Panel slide
  const leftSlide = interpolate(frame, [0, 20], [-60, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const rightSlide = interpolate(frame, [0, 20], [60, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const panelO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // Divider wipe
  const dividerProgress = interpolate(frame, [12, 36], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Camera pan right
  const panX = interpolate(frame, [68, 102], [0, -40], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Left defocus at end
  const leftBlur = interpolate(frame, [100, 120], [0, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rightBrightness = interpolate(frame, [100, 120], [1, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <GradientMeshBg colors={['#f9fafb', '#ffffff', '#e5e7eb', '#f3f4f6']} intensity={0.6} />
      <Particles count={10} color="rgba(52,144,220,0.2)" />
      <OrbitRing size={180} style={{ right: 120, top: 100, position: 'absolute' }} speed={0.2} />

      <AbsoluteFill style={{ transform: `translateX(${panX}px)` }}>
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
            padding: '0 80px',
          }}
        >
          {/* Left: pain */}
          <div
            style={{
              flex: '0 0 44%',
              transform: `translateX(${leftSlide}px)`,
              opacity: panelO,
              filter: `blur(${leftBlur}px)`,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              padding: 32,
              background: COLORS.bgGray100,
              borderRadius: 20,
              border: `1px solid ${COLORS.borderGray200}`,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.textBlack, fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 8 }}>
              The struggle is real
            </div>
            {painWords.map((word, i) => {
              const s = spring({ frame: frame - (20 + i * 6), fps, config: { damping: 14, stiffness: 100 } });
              const y = interpolate(s, [0, 1], [20, 0]);
              const o = interpolate(s, [0, 1], [0, 1]);
              return (
                <div
                  key={i}
                  style={{
                    transform: `translateY(${y}px)`,
                    opacity: o,
                    fontSize: 16,
                    color: COLORS.textGray500,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    padding: '8px 14px',
                    background: 'rgba(0,0,0,0.04)',
                    borderRadius: 10,
                  }}
                >
                  ✗ {word}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div
            style={{
              width: 3,
              height: `${dividerProgress}%`,
              background: `linear-gradient(180deg, ${COLORS.bluePrimary} 0%, ${COLORS.bluePrimary20} 100%)`,
              borderRadius: 2,
              alignSelf: 'center',
            }}
          />

          {/* Right: solution */}
          <div
            style={{
              flex: '0 0 44%',
              transform: `translateX(${rightSlide}px)`,
              opacity: panelO,
              filter: `brightness(${rightBrightness})`,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: 32,
              background: COLORS.white,
              borderRadius: 20,
              border: `1px solid ${COLORS.borderGray200}`,
              boxShadow: '0 8px 32px rgba(52,144,220,0.08)',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.bluePrimary, fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 8 }}>
              With MathGPT
            </div>
            {solutionCards.map((card, i) => {
              const s = spring({ frame: frame - (34 + i * 8), fps, config: { damping: 12, stiffness: 90 } });
              const y = interpolate(s, [0, 1], [30, 0]);
              const o = interpolate(s, [0, 1], [0, 1]);
              return (
                <div
                  key={i}
                  style={{
                    transform: `translateY(${y}px)`,
                    opacity: o,
                    fontSize: 15,
                    color: COLORS.textGray700,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    padding: '10px 16px',
                    background: COLORS.bgGray50,
                    borderRadius: 12,
                    border: `1px solid ${COLORS.borderGray100}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: COLORS.bluePrimary20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: COLORS.bluePrimary,
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </span>
                  {card}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
