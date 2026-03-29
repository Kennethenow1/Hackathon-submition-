import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  AbsoluteFill,
  Easing,
} from 'remotion';
import { BrowserFrame } from '../BrowserFrame';
import { GradientMeshBg } from './GradientMeshBg';
import { Particles } from './Particles';
import { GlassCard } from './GlassCard';
import { PALETTE, BRAND_ACCENT_RGB } from './palette';
import { CursorOverlay } from './CursorOverlay';
import { sineFloat } from './utils';
import { arrowTipOffsetPx } from '../cursorTipOffset';

// Layout constants for cursor targeting
const BROWSER_CONTENT_WIDTH = 900;
const BROWSER_CONTENT_HEIGHT = 480;
const MAKE_BTN = { left: 320, top: 360, width: 220, height: 52 };

export const Scene3ProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame;

  // Browser frame spring in
  const browserSpring = spring({ frame: lf, fps, config: { damping: 20, stiffness: 60, mass: 1.2 } });
  const browserY = interpolate(browserSpring, [0, 1], [120, 0]);
  const browserScale = interpolate(browserSpring, [0, 1], [0.72, 0.84]);
  const browserOpacity = interpolate(lf, [0, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 3D tilt angles - flatten near end
  const tiltX = interpolate(lf, [0, 162], [-8, -4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tiltY = interpolate(lf, [0, 162], [10, 5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Nav fade
  const navOpacity = interpolate(lf, [12, 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Card stagger
  const card1Spring = spring({ frame: lf - 24, fps, config: { damping: 16, stiffness: 100 } });
  const card2Spring = spring({ frame: lf - 34, fps, config: { damping: 16, stiffness: 100 } });
  const card1Y = interpolate(card1Spring, [0, 1], [48, 0]);
  const card2Y = interpolate(card2Spring, [0, 1], [48, 0]);

  // Camera push-in
  const cameraScale = interpolate(lf, [96, 162], [0.84, 0.93], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Float
  const floatY = sineFloat(lf, 4, 120, 0);
  const floatYSlow = sineFloat(lf, 3, 150, 1.5);

  // Cursor targeting Make Presentation button in browser content
  // Content origin in screen space (centered at screen midpoint, adjusted for browser chrome)
  const BROWSER_CHROME_H = 36;
  const screenCX = 960 - BROWSER_CONTENT_WIDTH / 2;
  const screenCY = 540 - (BROWSER_CONTENT_HEIGHT + BROWSER_CHROME_H) / 2 + BROWSER_CHROME_H;
  const btnCX = screenCX + MAKE_BTN.left + MAKE_BTN.width / 2;
  const btnCY = screenCY + MAKE_BTN.top + MAKE_BTN.height / 2;

  const cursorPoints = [
    { x: btnCX + 200, y: btnCY + 120, frame: 72 },
    { x: btnCX, y: btnCY, frame: 96 },
    { x: btnCX, y: btnCY, frame: 120, click: true },
  ];

  // Ambient orb
  const orb1Y = sineFloat(lf, 16, 130, 0);

  // CTA glow pulse
  const glowPulse = interpolate(Math.sin(lf * 0.08), [-1, 1], [0.3, 0.7]);

  // Glass summary panel
  const panelSpring = spring({ frame: lf - 60, fps, config: { damping: 14, stiffness: 80 } });
  const panelX = interpolate(panelSpring, [0, 1], [-80, 0]);
  const panelOp = interpolate(panelSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: '"DM Sans", sans-serif' }}>
      {/* Background */}
      <GradientMeshBg
        colors={[PALETTE.bgSecondary, PALETTE.bg, PALETTE.primary, PALETTE.brandAccent]}
        baseColor={PALETTE.bg}
      />

      {/* Particles */}
      <Particles
        count={14}
        colors={['rgba(234,215,102,0.5)', 'rgba(107,124,61,0.3)']}
        width={1920} height={1080}
      />

      {/* Orbs */}
      <div style={{
        position: 'absolute', left: '5%', top: '20%',
        width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(234,215,102,0.22) 0%, transparent 70%)`,
        filter: 'blur(50px)',
        transform: `translateY(${orb1Y}px)`,
      }} />
      <div style={{
        position: 'absolute', right: '8%', bottom: '15%',
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(107,124,61,0.18) 0%, transparent 70%)`,
        filter: 'blur(40px)',
        transform: `translateY(${floatYSlow}px)`,
      }} />

      {/* Camera wrapper */}
      <AbsoluteFill style={{
        transform: `scale(${cameraScale})`,
        transformOrigin: '50% 60%',
      }}>
        {/* Floating Browser */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: `
            translate(-50%, -50%)
            translateY(${browserY + floatY}px)
            scale(${browserScale})
            perspective(1200px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
          `,
          opacity: browserOpacity,
          transformStyle: 'preserve-3d',
        }}>
          <BrowserFrame
            url="ptt.app"
            width={BROWSER_CONTENT_WIDTH}
            shadow={true}
            darkMode={false}
          >
            {/* PTT Homepage mock */}
            <div style={{
              width: BROWSER_CONTENT_WIDTH,
              height: BROWSER_CONTENT_HEIGHT,
              background: PALETTE.bg,
              position: 'relative',
              overflow: 'hidden',
              fontFamily: '"DM Sans", sans-serif',
            }}>
              {/* Diagonal bg texture */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `repeating-linear-gradient(45deg, rgba(107,124,61,0.04) 0px, rgba(107,124,61,0.04) 1px, transparent 1px, transparent 28px)`,
                backgroundSize: '28px 28px',
              }} />

              {/* Nav */}
              <div style={{
                opacity: navOpacity,
                padding: '0 24px',
                height: 52,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: `rgba(253,251,240,0.85)`,
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid rgba(107,124,61,0.18)`,
                boxShadow: `rgba(0,0,0,0.08) 0px 4px 24px`,
              }}>
                <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: 20, fontWeight: 700, color: PALETTE.brandAccent }}>PTT</div>
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: PALETTE.textMuted }}>
                  <span>Home</span><span>Presentations</span>
                </div>
                <div style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: PALETTE.brandAccent, color: '#fff', fontSize: 12, fontWeight: 600,
                }}>Sign In / Up</div>
              </div>

              {/* Hero content */}
              <div style={{
                padding: '32px 48px 0',
                position: 'relative',
              }}>
                <div style={{
                  fontSize: 28, fontFamily: '"DM Serif Display", serif',
                  fontWeight: 700, color: PALETTE.text, marginBottom: 10,
                }}>Your Multilingual Presentation Workspace</div>
                <div style={{ fontSize: 13, color: PALETTE.textMuted, marginBottom: 24, lineHeight: 1.6 }}>Create or import a presentation, choose a target language, and PTT translates the content and adds voice-overs.</div>

                {/* Cards */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <div style={{
                    transform: `translateY(${card1Y}px)`,
                    opacity: card1Spring,
                    flex: 1, padding: '14px 16px', borderRadius: 12,
                    background: 'rgba(253,251,240,0.9)',
                    border: `1px solid rgba(107,124,61,0.28)`,
                    boxShadow: `rgba(0,0,0,0.06) 0px 4px 16px`,
                  }}>
                    <div style={{ fontSize: 13, fontFamily: '"DM Serif Display", serif', fontWeight: 700, color: PALETTE.brandAccent, marginBottom: 6 }}>Who We Are</div>
                    <div style={{ fontSize: 11, color: PALETTE.textMuted, lineHeight: 1.5 }}>PTT is built for anyone who communicates across languages and needs presentations that resonate with every audience.</div>
                  </div>
                  <div style={{
                    transform: `translateY(${card2Y}px)`,
                    opacity: card2Spring,
                    flex: 1, padding: '14px 16px', borderRadius: 12,
                    background: 'rgba(253,251,240,0.9)',
                    border: `1px solid rgba(107,124,61,0.28)`,
                    boxShadow: `rgba(0,0,0,0.06) 0px 4px 16px`,
                  }}>
                    <div style={{ fontSize: 13, fontFamily: '"DM Serif Display", serif', fontWeight: 700, color: PALETTE.brandAccent, marginBottom: 6 }}>What We Do</div>
                    <div style={{ fontSize: 11, color: PALETTE.textMuted, lineHeight: 1.5 }}>Choose a target language — PTT translates your content and adds voice-overs automatically.</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    padding: '12px 24px', borderRadius: 8,
                    border: `1px solid rgba(107,124,61,0.35)`,
                    color: PALETTE.brandAccent, fontSize: 13, fontWeight: 600,
                    background: 'rgba(107,124,61,0.06)',
                  }}>Search Presentation</div>
                  <div style={{
                    padding: '12px 24px', borderRadius: 8,
                    background: PALETTE.brandAccent,
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    boxShadow: `0 8px 20px -8px rgba(107,124,61,${glowPulse})`,
                  }}>Make Presentation</div>
                </div>
              </div>

              {/* Cursor overlay inside browser content */}
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <CursorOverlay
                  points={[
                    { x: MAKE_BTN.left + MAKE_BTN.width / 2 + 200, y: MAKE_BTN.top + MAKE_BTN.height / 2 + 80, frame: 72 },
                    { x: MAKE_BTN.left + MAKE_BTN.width / 2, y: MAKE_BTN.top + MAKE_BTN.height / 2, frame: 96 },
                    { x: MAKE_BTN.left + MAKE_BTN.width / 2, y: MAKE_BTN.top + MAKE_BTN.height / 2, frame: 120, click: true },
                  ]}
                />
              </div>
            </div>
          </BrowserFrame>
        </div>

        {/* Glass summary panel lower left */}
        <div style={{
          position: 'absolute',
          left: 80, bottom: 100,
          transform: `translateX(${panelX}px)`,
          opacity: panelOp,
        }}>
          <GlassCard style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.brandAccent, marginBottom: 6 }}>Translation · Narration · Sharing</div>
            <div style={{ fontSize: 11, color: PALETTE.textMuted }}>The complete multilingual presentation platform.</div>
          </GlassCard>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
