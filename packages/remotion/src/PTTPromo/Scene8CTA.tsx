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
import { WordByWord } from './WordByWord';
import { PTTLogo } from './PTTLogo';
import { PALETTE } from './palette';
import { sineFloat } from './utils';

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame;

  // Gradient intensifies
  const bgIntensity = interpolate(lf, [0, 24], [0.6, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Logo spring
  const logoSpring = spring({ frame: lf - 12, fps, config: { damping: 10, stiffness: 150, mass: 0.8 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0, 1]);
  const logoRotate = interpolate(logoSpring, [0, 1], [-15, 0]);
  const logoGlow = interpolate(Math.sin(lf * 0.08), [-1, 1], [0.3, 0.7]);

  // Headline word-by-word starts at lf 30
  // "Create once. Present worldwide."
  const highlightSweep = interpolate(lf, [72, 92], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // CTA buttons
  const btn1Spring = spring({ frame: lf - 54, fps, config: { damping: 16, stiffness: 100 } });
  const btn2Spring = spring({ frame: lf - 62, fps, config: { damping: 16, stiffness: 100 } });
  const btn1Y = interpolate(btn1Spring, [0, 1], [28, 0]);
  const btn2Y = interpolate(btn2Spring, [0, 1], [28, 0]);
  const btn1Op = interpolate(btn1Spring, [0, 1], [0, 1]);
  const btn2Op = interpolate(btn2Spring, [0, 1], [0, 1]);

  // CTA glow shimmer
  const shimmerX = interpolate(lf, [72, 120], [-200, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowPulse = interpolate(Math.sin(lf * 0.07), [-1, 1], [0.3, 0.7]);

  // Final fade
  const finalOp = interpolate(lf, [108, 120], [1, 0.96], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Float
  const floatY = sineFloat(lf, 5, 100, 0);

  // Large blurred orb
  const orbPulse = interpolate(Math.sin(lf * 0.05), [-1, 1], [0.4, 0.8]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: '"DM Sans", sans-serif', opacity: finalOp }}>
      {/* Intensified gradient mesh */}
      <GradientMeshBg
        colors={[PALETTE.primary, PALETTE.secondary, PALETTE.brandAccent, PALETTE.accent]}
        baseColor={PALETTE.bg}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 90% 70% at 50% 50%, rgba(234,215,102,${0.18 * bgIntensity}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Large blurred orb */}
      <div style={{
        position: 'absolute', left: '50%', top: '40%',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(211,194,92,${orbPulse * 0.25}) 0%, transparent 68%)`,
        filter: 'blur(60px)',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} />

      {/* Particles - 20, gold/olive */}
      <Particles
        count={20}
        colors={['rgba(234,215,102,0.55)', 'rgba(107,124,61,0.4)', 'rgba(212,194,92,0.48)']}
        width={1920} height={1080}
      />

      {/* Center content */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 24,
      }}>
        {/* Logo */}
        <div style={{
          transform: `scale(${logoScale}) rotate(${logoRotate}deg) translateY(${floatY}px)`,
          marginBottom: 8,
          filter: `drop-shadow(0 0 ${20 * logoGlow}px rgba(107,124,61,${logoGlow * 0.4}))`,
        }}>
          <PTTLogo size={80} />
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', maxWidth: 800 }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.2em', marginBottom: 8 }}>
            <WordByWord
              text="Create once."
              startFrame={30}
              stagger={5}
              fontSize={72}
              fontFamily='"DM Serif Display", serif'
              fontWeight={700}
              color={PALETTE.text}
              springConfig={{ damping: 14, stiffness: 120 }}
              style={{ justifyContent: 'center' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.2em' }}>
            <span style={{
              fontSize: 72,
              fontFamily: '"DM Serif Display", serif',
              fontWeight: 700,
              color: PALETTE.text,
              display: 'inline-block',
              opacity: interpolate(spring({ frame: lf - 45, fps, config: { damping: 14, stiffness: 120 } }), [0, 1], [0, 1]),
              transform: `translateY(${interpolate(spring({ frame: lf - 45, fps, config: { damping: 14, stiffness: 120 } }), [0, 1], [36, 0])}px)`,
            }}>Present</span>{' '}
            <span style={{
              fontSize: 72,
              fontFamily: '"DM Serif Display", serif',
              fontWeight: 700,
              color: PALETTE.text,
              display: 'inline-block',
              position: 'relative',
              opacity: interpolate(spring({ frame: lf - 53, fps, config: { damping: 14, stiffness: 120 } }), [0, 1], [0, 1]),
              transform: `translateY(${interpolate(spring({ frame: lf - 53, fps, config: { damping: 14, stiffness: 120 } }), [0, 1], [36, 0])}px)`,
            }}>
              <span style={{
                position: 'absolute', bottom: 4, left: 0,
                height: '32%', width: `${highlightSweep}%`,
                background: 'rgba(212,194,92,0.4)', borderRadius: 4, zIndex: 0,
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>worldwide.</span>
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 20, color: PALETTE.textMuted, textAlign: 'center',
          opacity: interpolate(lf, [50, 72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(lf, [50, 72], [12, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
        }}>
          Translation · Narration · Sharing — all in one platform.
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{
            transform: `translateY(${btn1Y}px)`,
            opacity: btn1Op,
          }}>
            <div style={{
              padding: '16px 32px',
              borderRadius: 12,
              border: `1.5px solid rgba(107,124,61,0.4)`,
              color: PALETTE.brandAccent,
              fontSize: 16, fontWeight: 600,
              background: 'rgba(107,124,61,0.06)',
              cursor: 'pointer',
            }}>Search Presentation</div>
          </div>
          <div style={{
            transform: `translateY(${btn2Y}px)`,
            opacity: btn2Op,
          }}>
            <div style={{
              padding: '16px 32px',
              borderRadius: 12,
              background: PALETTE.brandAccent,
              color: '#fff',
              fontSize: 16, fontWeight: 600,
              cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
              boxShadow: `0 12px 32px -12px rgba(107,124,61,${glowPulse})`,
            }}>
              {/* Shimmer */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                left: shimmerX, width: 80,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                pointerEvents: 'none',
              }} />
              <span style={{ position: 'relative' }}>Make Presentation</span>
            </div>
          </div>
        </div>

        {/* URL */}
        <div style={{
          opacity: interpolate(lf, [80, 100], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 13, color: PALETTE.textMuted,
        }}>
          ptt.app
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
