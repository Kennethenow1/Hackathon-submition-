import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill, Easing } from 'remotion';
import { GradientMeshBg } from './GradientMeshBg';
import { Particles } from './Particles';
import { GlassCard } from './GlassCard';
import { PALETTE, BRAND_ACCENT_RGB } from './palette';
import { sineFloat } from './utils';

const DECK_LANGS = ['English.pptx', 'Español.pptx', 'Français.pptx', '日本語.pptx', 'Deutsch.pptx'];
const PROBLEM_TAGS = ['Duplicate files', 'Manual re-typing', 'Formatting breaks', 'Version confusion', 'Lost context'];

export const Scene2Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Local frame (scene starts at 150)
  const lf = frame;

  // Headline
  const headlineOpacity = interpolate(lf, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headlineY = interpolate(lf, [0, 20], [-24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Camera pan
  const cameraPanX = interpolate(lf, [78, 132], [0, 18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Compress exit
  const exitBlur = interpolate(lf, [126, 150], [0, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitScale = interpolate(lf, [126, 150], [1, 0.97], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Orbit ring rotation
  const ringRot = lf * 0.4;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: '"DM Sans", sans-serif' }}>
      {/* Background */}
      <GradientMeshBg
        colors={[PALETTE.bg, PALETTE.bgSecondary, PALETTE.primary, PALETTE.accent]}
        baseColor={PALETTE.bgSecondary}
      />

      {/* Particles */}
      <Particles
        count={10}
        colors={['rgba(212,194,92,0.35)', 'rgba(107,124,61,0.2)']}
        width={1920}
        height={1080}
      />

      {/* Orbit ring behind headline */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '18%',
        transform: `translate(-50%, -50%) rotate(${ringRot}deg)`,
        opacity: 0.12,
      }}>
        <svg width="220" height="220">
          <circle cx="110" cy="110" r="100" fill="none" stroke={PALETTE.brandAccent} strokeWidth="1" strokeDasharray="8 14" />
        </svg>
      </div>

      {/* Main content with camera pan */}
      <AbsoluteFill
        style={{
          transform: `translateX(${-cameraPanX}px) scale(${exitScale})`,
          filter: `blur(${exitBlur}px)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Headline */}
        <div style={{
          position: 'absolute',
          top: 80,
          left: 0, right: 0,
          textAlign: 'center',
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
        }}>
          <div style={{
            fontSize: 52,
            fontFamily: '"DM Serif Display", serif',
            fontWeight: 700,
            color: PALETTE.text,
          }}>Still making separate decks?</div>
          <div style={{ fontSize: 18, color: PALETTE.textMuted, marginTop: 10 }}>One audience change, one more file. Forever.</div>
        </div>

        {/* Left: duplicate deck cards */}
        <div style={{
          position: 'absolute',
          left: 120,
          top: '50%',
          transform: 'translateY(-40%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: PALETTE.brandAccent, marginBottom: 4 }}>Your presentation folder</div>
          {DECK_LANGS.map((name, i) => {
            const s = spring({ frame: lf - (12 + i * 10), fps, config: { damping: 15, stiffness: 100 } });
            const cardY = interpolate(s, [0, 1], [40, 0]);
            const cardOp = interpolate(s, [0, 1], [0, 1]);
            const rot = i % 2 === 0 ? interpolate(s, [0, 1], [2, 0]) : interpolate(s, [0, 1], [-2, 0]);
            return (
              <div
                key={i}
                style={{
                  transform: `translateY(${cardY}px) rotate(${rot}deg)`,
                  opacity: cardOp,
                }}
              >
                <GlassCard style={{ width: 320, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: `linear-gradient(135deg, ${PALETTE.primary}44, ${PALETTE.accent}44)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>📄</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: PALETTE.text }}>{name}</div>
                      <div style={{ fontSize: 11, color: PALETTE.textMuted }}>Duplicated from source</div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* Right: problem tags */}
        <div style={{
          position: 'absolute',
          right: 120,
          top: '50%',
          transform: 'translateY(-40%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a6a2e', marginBottom: 4 }}>The struggle</div>
          {PROBLEM_TAGS.map((tag, i) => {
            const s = spring({ frame: lf - (26 + i * 9), fps, config: { damping: 14, stiffness: 90 } });
            const tagX = interpolate(s, [0, 1], [60, 0]);
            const tagOp = interpolate(s, [0, 1], [0, 1]);
            return (
              <div
                key={i}
                style={{
                  transform: `translateX(${tagX}px)`,
                  opacity: tagOp,
                }}
              >
                <div style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  background: 'rgba(51,40,14,0.07)',
                  border: `1px solid rgba(51,40,14,0.14)`,
                  fontSize: 14,
                  color: PALETTE.textMuted,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ opacity: 0.6, fontSize: 16 }}>⚠️</span>
                  {tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center divider */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '22%',
          bottom: '10%',
          width: 1,
          background: `rgba(107,124,61,0.2)`,
          transform: 'translateX(-50%)',
        }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
