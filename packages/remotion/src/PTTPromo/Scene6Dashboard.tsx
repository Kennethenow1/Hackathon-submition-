import React, { useMemo } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  AbsoluteFill,
  Easing,
} from 'remotion';
import { GradientMeshBg } from './GradientMeshBg';
import { Particles } from './Particles';
import { GlassCard } from './GlassCard';
import { PALETTE } from './palette';
import { sineFloat } from './utils';

const LIBRARY_CARDS = [
  { label: 'All Presentations', count: 24, icon: '📊', color: PALETTE.primary },
  { label: 'By Language', count: 6, icon: '🌐', color: PALETTE.brandAccent },
  { label: 'By Project', count: 8, icon: '📁', color: PALETTE.accent },
];

const TAGS = ['Q4 Strategy', 'Marketing', 'Product Launch', 'Investor Deck', 'Team Briefing'];

export const Scene6Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame;

  // Main dashboard card
  const mainSpring = spring({ frame: lf, fps, config: { damping: 18, stiffness: 80 } });
  const mainScale = interpolate(mainSpring, [0, 1], [0.9, 1.0]);
  const mainOp = interpolate(mainSpring, [0, 1], [0, 1]);

  // Camera diagonal pan
  const camX = interpolate(lf, [90, 150], [0, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const camY = interpolate(lf, [90, 150], [0, -12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Center card brightens at end
  const centerBright = interpolate(lf, [162, 180], [1, 1.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const surroundDim = interpolate(lf, [162, 180], [1, 0.92], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Counter value
  const counterProgress = spring({ frame: lf - 126, fps, config: { damping: 20, stiffness: 40 } });
  const counterVal = Math.round(interpolate(counterProgress, [0, 1], [0, 24]));

  // Orbit rings
  const ringRot1 = lf * 0.3;
  const ringRot2 = -lf * 0.2;

  // Float
  const floatY = sineFloat(lf, 4, 110, 0);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: '"DM Sans", sans-serif' }}>
      {/* Background with subtle grid texture */}
      <GradientMeshBg
        colors={[PALETTE.bg, PALETTE.bgSecondary, PALETTE.primary, PALETTE.brandAccent]}
        baseColor={PALETTE.bg}
      />
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(45deg, rgba(107,124,61,0.035) 0px, rgba(107,124,61,0.035) 1px, transparent 1px, transparent 28px)`,
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />

      {/* Particles */}
      <Particles count={12} colors={['rgba(212,194,92,0.35)', 'rgba(107,124,61,0.22)']} width={1920} height={1080} />

      {/* Orbit rings */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(-50%,-50%) rotate(${ringRot1}deg)`,
        opacity: 0.10, pointerEvents: 'none',
      }}>
        <svg width="600" height="600">
          <circle cx="300" cy="300" r="280" fill="none" stroke={PALETTE.brandAccent} strokeWidth="1" strokeDasharray="8 14" />
        </svg>
      </div>
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(-50%,-50%) rotate(${ringRot2}deg)`,
        opacity: 0.07, pointerEvents: 'none',
      }}>
        <svg width="800" height="800">
          <circle cx="400" cy="400" r="380" fill="none" stroke={PALETTE.primary} strokeWidth="1" strokeDasharray="5 18" />
        </svg>
      </div>

      {/* Camera pan */}
      <AbsoluteFill style={{ transform: `translate(${-camX}px, ${-camY}px)` }}>
        {/* Dashboard headline */}
        <div style={{
          position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center',
          opacity: mainOp,
        }}>
          <div style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: PALETTE.brandAccent, marginBottom: 6 }}>Dashboard</div>
          <div style={{ fontSize: 44, fontFamily: '"DM Serif Display", serif', fontWeight: 700, color: PALETTE.text }}>Your Presentation Library</div>
          <div style={{ fontSize: 16, color: PALETTE.textMuted, marginTop: 6 }}>Upload, manage, and organise by topic, project, or language.</div>
        </div>

        {/* Center: Main dashboard card */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: `translate(-50%,-50%) scale(${mainScale * centerBright}) translateY(${floatY}px)`,
          opacity: mainOp,
          zIndex: 2,
        }}>
          <GlassCard style={{ width: 340, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: PALETTE.brandAccent, fontWeight: 600 }}>All Presentations</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: PALETTE.text, fontVariantNumeric: 'tabular-nums' }}>{counterVal}</div>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `linear-gradient(135deg, ${PALETTE.primary}44, ${PALETTE.brandAccent}44)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>📊</div>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(107,124,61,0.1)', marginBottom: 12 }}>
              <div style={{ width: '72%', height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.brandAccent})` }} />
            </div>
            <div style={{ fontSize: 11, color: PALETTE.textMuted }}>Across all projects and languages</div>
          </GlassCard>
        </div>

        {/* Library cards around center */}
        {LIBRARY_CARDS.map((card, i) => {
          const angle = [240, 0, 120][i];
          const r = 260;
          const cx = Math.cos((angle * Math.PI) / 180) * r;
          const cy = Math.sin((angle * Math.PI) / 180) * r * 0.65;
          const cardSpring = spring({ frame: lf - (12 + i * 8), fps, config: { damping: 15, stiffness: 90 } });
          const cardY = interpolate(cardSpring, [0, 1], [42, 0]);
          const cardOp = interpolate(cardSpring, [0, 1], [0, 1]);
          const hoverFloat = sineFloat(lf, 4, 100, i * 1.2);
          return (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px)) translateY(${cardY + hoverFloat}px)`,
              opacity: cardOp * surroundDim,
              zIndex: 1,
            }}>
              <GlassCard style={{ width: 220, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: `linear-gradient(135deg, ${card.color}44, ${card.color}22)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>{card.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: PALETTE.text }}>{card.label}</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: PALETTE.text, fontVariantNumeric: 'tabular-nums' }}>{card.count}</div>
              </GlassCard>
            </div>
          );
        })}

        {/* Tags row */}
        <div style={{
          position: 'absolute', bottom: 60, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 10,
        }}>
          {TAGS.map((tag, i) => {
            const tagSpring = spring({ frame: lf - (84 + i * 6), fps, config: { damping: 12, stiffness: 120 } });
            const tagScale = interpolate(tagSpring, [0, 1], [0.5, 1]);
            const tagOp = interpolate(tagSpring, [0, 1], [0, 1]);
            return (
              <div key={i} style={{
                transform: `scale(${tagScale})`,
                opacity: tagOp,
                padding: '6px 14px', borderRadius: 20,
                background: 'rgba(107,124,61,0.1)',
                border: `1px solid rgba(107,124,61,0.25)`,
                fontSize: 12, fontWeight: 500, color: PALETTE.textMuted,
              }}>{tag}</div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
