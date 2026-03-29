import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill, Easing } from 'remotion';
import { GradientMeshBg } from './GradientMeshBg';
import { Particles } from './Particles';
import { WordByWord } from './WordByWord';
import { GlassCard } from './GlassCard';
import { PALETTE, BRAND_ACCENT_RGB } from './palette';
import { sineFloat } from './utils';

const BROWSER_CHROME = 36;

export const Scene1Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background fade in
  const bgOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bgScale = interpolate(frame, [0, 18], [1.06, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Camera push-in
  const cameraScale = interpolate(frame, [72, 132], [1.0, 1.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Subtitle line
  const subtitleOpacity = interpolate(frame, [18, 48], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subtitleY = interpolate(frame, [18, 48], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Any audience. Any language.
  const line3aOpacity = interpolate(frame, [24, 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const line3aY = interpolate(frame, [24, 44], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const line3bOpacity = interpolate(frame, [34, 54], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const line3bY = interpolate(frame, [34, 54], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Highlight sweep under "Any language"
  const highlightSweep = interpolate(frame, [54, 70], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Floating tiles
  const tile1 = spring({ frame: frame - 30, fps, config: { damping: 14, stiffness: 90 } });
  const tile2 = spring({ frame: frame - 44, fps, config: { damping: 14, stiffness: 90 } });
  const tile3 = spring({ frame: frame - 58, fps, config: { damping: 14, stiffness: 90 } });

  // Ambient float
  const floatY1 = sineFloat(frame, 5, 90, 0);
  const floatY2 = sineFloat(frame, 4, 110, 1.2);
  const floatY3 = sineFloat(frame, 6, 80, 2.4);

  // Exit fade
  const exitOpacity = interpolate(frame, [126, 150], [1, 0.88], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitScale = interpolate(frame, [126, 150], [1, 1.02], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const tile1Y = interpolate(tile1, [0, 1], [50, 0]);
  const tile1R = interpolate(tile1, [0, 1], [4, 0]);
  const tile2Y = interpolate(tile2, [0, 1], [50, 0]);
  const tile2R = interpolate(tile2, [0, 1], [-3, 0]);
  const tile3Y = interpolate(tile3, [0, 1], [50, 0]);
  const tile3R = interpolate(tile3, [0, 1], [4, 0]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: '"DM Sans", sans-serif' }}>
      {/* Background */}
      <AbsoluteFill style={{ opacity: bgOpacity, transform: `scale(${bgScale})` }}>
        <GradientMeshBg
          colors={[PALETTE.primary, PALETTE.secondary, PALETTE.brandAccent, PALETTE.accent]}
          baseColor={PALETTE.bg}
        />
      </AbsoluteFill>

      {/* Particles mid-layer */}
      <AbsoluteFill style={{ opacity: bgOpacity }}>
        <Particles
          count={18}
          colors={['rgba(234,215,102,0.5)', 'rgba(107,124,61,0.35)', 'rgba(212,194,92,0.4)']}
          width={1920}
          height={1080}
        />
        {/* Blurred orbs */}
        <div style={{
          position: 'absolute', left: '8%', top: '15%',
          width: 320, height: 320, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(234,215,102,0.25) 0%, transparent 70%)`,
          filter: 'blur(40px)',
          transform: `translateY(${sineFloat(frame, 12, 150, 0)}px)`,
        }} />
        <div style={{
          position: 'absolute', right: '5%', bottom: '10%',
          width: 240, height: 240, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(107,124,61,0.22) 0%, transparent 70%)`,
          filter: 'blur(50px)',
          transform: `translateY(${sineFloat(frame, 10, 120, 2)}px)`,
        }} />
      </AbsoluteFill>

      {/* Foreground content with camera zoom */}
      <AbsoluteFill
        style={{
          transform: `scale(${cameraScale * exitScale})`,
          transformOrigin: 'center center',
          opacity: exitOpacity,
        }}
      >
        {/* Left hero text block */}
        <div style={{
          position: 'absolute',
          left: 100,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 860,
        }}>
          {/* PTT wordmark */}
          <div style={{ marginBottom: 16 }}>
            <WordByWord
              text="PTT"
              startFrame={6}
              stagger={8}
              fontSize={120}
              fontFamily='"DM Serif Display", serif'
              fontWeight={700}
              color={PALETTE.text}
              springConfig={{ damping: 14, stiffness: 120 }}
            />
          </div>

          {/* Subtitle */}
          <div style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            fontSize: 22,
            color: PALETTE.textMuted,
            lineHeight: 1.5,
            marginBottom: 32,
            fontWeight: 400,
          }}>
            multilingual presentation translation, narration, and sharing.
          </div>

          {/* Any audience. Any language. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{
              opacity: line3aOpacity,
              transform: `translateY(${line3aY}px)`,
              fontSize: 38,
              fontFamily: '"DM Serif Display", serif',
              fontWeight: 700,
              color: PALETTE.text,
            }}>
              Any audience.
            </div>
            <div style={{
              opacity: line3bOpacity,
              transform: `translateY(${line3bY}px)`,
              fontSize: 38,
              fontFamily: '"DM Serif Display", serif',
              fontWeight: 700,
              color: PALETTE.text,
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
            }}>
              <span style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  bottom: 2,
                  left: 0,
                  height: '35%',
                  width: `${highlightSweep}%`,
                  background: `rgba(212,194,92,0.38)`,
                  borderRadius: 4,
                  zIndex: 0,
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}>Any language.</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right floating mini UI tiles */}
        <div style={{
          position: 'absolute',
          right: 100,
          top: '50%',
          transform: 'translateY(-52%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          perspective: 800,
        }}>
          {/* Tile 1 */}
          <div style={{
            transform: `translateY(${tile1Y + floatY1}px) rotateZ(${tile1R}deg)`,
            opacity: tile1,
          }}>
            <GlassCard style={{ width: 280, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: PALETTE.brandAccent, fontWeight: 600, marginBottom: 8 }}>Language</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['English', 'Español', 'Français', '日本語'].map((lang, i) => (
                  <div key={i} style={{
                    padding: '4px 10px', borderRadius: 8,
                    background: i === 0 ? PALETTE.primary : `rgba(107,124,61,0.12)`,
                    color: i === 0 ? '#fff' : PALETTE.textMuted,
                    fontSize: 12, fontWeight: 500,
                  }}>{lang}</div>
                ))}
              </div>
            </GlassCard>
          </div>
          {/* Tile 2 */}
          <div style={{
            transform: `translateY(${tile2Y + floatY2}px) rotateZ(${tile2R}deg)`,
            opacity: tile2,
          }}>
            <GlassCard style={{ width: 280, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: PALETTE.brandAccent, fontWeight: 600, marginBottom: 6 }}>Translation</div>
              <div style={{ fontSize: 13, color: PALETTE.textMuted }}>AI-powered. Formatting preserved.</div>
              <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: `rgba(107,124,61,0.12)` }}>
                <div style={{ width: '78%', height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.brandAccent})` }} />
              </div>
            </GlassCard>
          </div>
          {/* Tile 3 */}
          <div style={{
            transform: `translateY(${tile3Y + floatY3}px) rotateZ(${tile3R}deg)`,
            opacity: tile3,
          }}>
            <GlassCard style={{ width: 280, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: PALETTE.brandAccent, fontWeight: 600, marginBottom: 6 }}>Share</div>
              <div style={{ fontSize: 13, color: PALETTE.textMuted }}>No account needed to view.</div>
              <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, background: `rgba(107,124,61,0.08)`, fontSize: 11, color: PALETTE.textMuted, fontFamily: '"JetBrains Mono", monospace' }}>ptt.app/share/abc123</div>
            </GlassCard>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
