import React from 'react';
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
import { CursorOverlay } from './CursorOverlay';
import { sineFloat } from './utils';

// Share button in left panel
const SHARE_BTN = { left: 50, top: 280, width: 160, height: 44 };

export const Scene7Share: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame;

  // Left panel slide from left
  const leftSpring = spring({ frame: lf, fps, config: { damping: 16, stiffness: 80 } });
  const leftX = interpolate(leftSpring, [0, 1], [-120, 0]);
  const leftOp = interpolate(leftSpring, [0, 1], [0, 1]);

  // Right panel slide from right
  const rightSpring = spring({ frame: lf - 4, fps, config: { damping: 16, stiffness: 80 } });
  const rightX = interpolate(rightSpring, [0, 1], [120, 0]);
  const rightOp = interpolate(rightSpring, [0, 1], [0, 1]);

  // Link chip expansion
  const linkShine = interpolate(lf, [24, 54], [-100, 320], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Energy trail
  const trailProgress = interpolate(lf, [54, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Viewer panel activation
  const viewerActive = lf >= 90;
  const viewerSpring = spring({ frame: lf - 90, fps, config: { damping: 16, stiffness: 100 } });
  const viewerHeadOp = viewerActive ? viewerSpring : 0;

  // Camera push-in
  const cameraScale = interpolate(lf, [90, 120], [1.0, 1.04], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Float
  const floatY = sineFloat(lf, 3, 120, 0);

  // Cursor (relative to left panel)
  const cursorPoints = [
    { x: SHARE_BTN.left + SHARE_BTN.width / 2 + 60, y: SHARE_BTN.top - 30, frame: 40 },
    { x: SHARE_BTN.left + SHARE_BTN.width / 2, y: SHARE_BTN.top + SHARE_BTN.height / 2, frame: 54, click: true },
  ];

  // Badge
  const badgeSpring = spring({ frame: lf - 30, fps, config: { damping: 14, stiffness: 90 } });

  // Orb
  const orbY = sineFloat(lf, 14, 130, 0);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: '"DM Sans", sans-serif' }}>
      {/* Background */}
      <GradientMeshBg
        colors={[PALETTE.bgSecondary, PALETTE.bg, PALETTE.brandAccent, PALETTE.primary]}
        baseColor={PALETTE.bg}
      />

      {/* Particles */}
      <Particles count={10} colors={['rgba(212,194,92,0.38)', 'rgba(107,124,61,0.25)']} width={1920} height={1080} />

      {/* Orb */}
      <div style={{
        position: 'absolute', left: '50%', top: '5%',
        width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(234,215,102,0.18) 0%, transparent 70%)`,
        filter: 'blur(55px)',
        transform: `translate(-50%, 0) translateY(${orbY}px)`,
      }} />

      {/* Camera */}
      <AbsoluteFill style={{
        transform: `scale(${cameraScale})`,
        transformOrigin: 'center center',
      }}>
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          {/* Left: Share panel */}
          <div style={{
            position: 'absolute',
            left: 120, top: '50%',
            transform: `translateY(-50%) translateX(${leftX}px) translateY(${floatY * 0.7}px)`,
            opacity: leftOp,
            width: 360,
          }}>
            <GlassCard style={{ padding: 28 }}>
              <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: PALETTE.brandAccent, fontWeight: 600, marginBottom: 16 }}>Share Presentation</div>
              <div style={{ fontSize: 22, fontFamily: '"DM Serif Display", serif', fontWeight: 700, color: PALETTE.text, marginBottom: 8, lineHeight: 1.2 }}>Q4 Global Strategy</div>
              <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 20 }}>🇪🇸 Español · Voice-over included</div>

              {/* Link chip */}
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(107,124,61,0.07)',
                border: `1px solid rgba(107,124,61,0.28)`,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11, color: PALETTE.textMuted,
                marginBottom: 16, position: 'relative', overflow: 'hidden',
              }}>
                ptt.app/share/q4-estrategia-es
                {/* Shine sweep */}
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: linkShine, width: 60,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* Share button */}
              <div style={{
                padding: '11px 22px', borderRadius: 9,
                background: PALETTE.brandAccent,
                color: '#fff', fontSize: 13, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: `0 6px 18px -6px rgba(107,124,61,0.5)`,
                cursor: 'pointer',
              }}>
                <span>🔗</span> Copy Share Link
              </div>

              {/* Cursor */}
              <div style={{ position: 'absolute', inset: 0 }}>
                <CursorOverlay points={cursorPoints} />
              </div>
            </GlassCard>
          </div>

          {/* Connection trail */}
          <svg
            style={{
              position: 'absolute',
              left: 480, top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
            width={240}
            height={4}
          >
            <defs>
              <linearGradient id="trail" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={PALETTE.brandAccent} stopOpacity={0.6} />
                <stop offset="100%" stopColor={PALETTE.primary} stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <rect
              x="0" y="0"
              width={240 * trailProgress}
              height={4} rx={2}
              fill="url(#trail)"
            />
          </svg>

          {/* Right: Viewer panel */}
          <div style={{
            position: 'absolute',
            right: 120, top: '50%',
            transform: `translateY(-50%) translateX(${rightX}px) translateY(${-floatY * 0.6}px)`,
            opacity: rightOp,
            width: 360,
          }}>
            <GlassCard style={{
              padding: 28,
              opacity: viewerActive ? 1 : 0.55,
              transition: 'none',
            }}>
              <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: PALETTE.brandAccent, fontWeight: 600, marginBottom: 16 }}>Viewer Experience</div>

              {/* Slide preview stub */}
              <div style={{
                borderRadius: 10,
                background: PALETTE.bgSecondary,
                border: `1px solid rgba(107,124,61,0.2)`,
                padding: '20px 18px',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 16, fontFamily: '"DM Serif Display", serif', fontWeight: 700, color: PALETTE.text, marginBottom: 8 }}>Estrategia Global T4</div>
                <div style={{ fontSize: 11, color: PALETTE.textMuted }}>Ampliando el alcance en Europa y Asia...</div>
                {/* Waveform stub */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 20, marginTop: 12 }}>
                  {Array.from({ length: 16 }, (_, i) => (
                    <div key={i} style={{
                      flex: 1, height: viewerActive ? 4 + Math.abs(Math.sin(lf * 0.15 + i * 0.5)) * 14 : 6,
                      background: `linear-gradient(180deg, ${PALETTE.primary}, ${PALETTE.brandAccent})`,
                      borderRadius: 2, opacity: viewerActive ? 0.8 : 0.3,
                    }} />
                  ))}
                </div>
              </div>

              <div style={{
                opacity: viewerHeadOp,
                transform: `translateY(${interpolate(viewerHeadOp, [0, 1], [12, 0])}px)`,
              }}>
                <div style={{
                  padding: '8px 12px', borderRadius: 8,
                  background: 'rgba(107,124,61,0.1)',
                  border: `1px solid rgba(107,124,61,0.22)`,
                  fontSize: 12, color: PALETTE.brandAccent, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  ✅ No account required to view & listen
                </div>
              </div>
            </GlassCard>
          </div>
        </AbsoluteFill>

        {/* Bottom badge */}
        <div style={{
          position: 'absolute', bottom: 60, left: '50%',
          transform: `translateX(-50%)`,
          opacity: badgeSpring,
        }}>
          <div style={{
            padding: '10px 24px', borderRadius: 24,
            background: 'rgba(107,124,61,0.12)',
            border: `1px solid rgba(107,124,61,0.3)`,
            fontSize: 13, fontWeight: 600, color: PALETTE.brandAccent,
          }}>
            View and listen without signing in.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
