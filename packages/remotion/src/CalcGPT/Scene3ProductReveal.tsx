import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadRaleway } from '@remotion/google-fonts/Raleway';
import { PALETTE } from './constants';
import { GradientMesh } from './GradientMesh';
import { Particles } from './Particles';
import { BrowserFrame } from '../BrowserFrame';

const { fontFamily: interFamily } = loadInter();
const { fontFamily: ralewayFamily } = loadRaleway();

const BROWSER_CHROME_HEIGHT = 36;

const CalcGPTAppMockup: React.FC = () => (
  <div
    style={{
      width: 1200,
      minHeight: 700,
      background: PALETTE.bgPrimary,
      fontFamily: interFamily,
      overflow: 'hidden',
    }}
  >
    {/* Nav */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${PALETTE.borderPrimary}`,
      }}
    >
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: PALETTE.textPrimary,
          letterSpacing: '-0.01em',
        }}
      >
        CalcGPT
      </span>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ fontSize: 15, color: PALETTE.textSecondary }}>Notebook</span>
        <span style={{ fontSize: 15, color: PALETTE.textSecondary }}>Check Work</span>
        <span style={{ fontSize: 15, color: PALETTE.textSecondary }}>Graph</span>
        <div
          style={{
            padding: '8px 18px',
            background: PALETTE.textPrimary,
            color: PALETTE.bgPrimary,
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Get Started
        </div>
      </div>
    </div>

    {/* Hero area */}
    <div
      style={{
        padding: '48px 32px 32px',
        background: 'radial-gradient(ellipse at 50% 30%, #1a1a1a 0%, #0a0a0a 70%)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: PALETTE.accentBlue,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        AI-Powered Math Learning
      </div>
      <h1
        style={{
          fontFamily: ralewayFamily,
          fontSize: 58,
          fontWeight: 500,
          color: PALETTE.textPrimary,
          lineHeight: 1.1,
          margin: 0,
          marginBottom: 16,
        }}
      >
        This AI makes you{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #8A6BF2, #3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          better at math
        </span>
      </h1>
      <p style={{ fontSize: 18, color: PALETTE.textSecondary, maxWidth: 560, margin: '0 auto 28px' }}>
        Break down complex problems into simple, understandable steps.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <div
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Master Math for Free
        </div>
      </div>

      {/* Trusted by */}
      <div
        style={{
          marginTop: 24,
          fontSize: 13,
          color: PALETTE.textMuted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <span>⭐⭐⭐⭐⭐</span>
        <span>Trusted by 800,000+ students</span>
      </div>

      {/* Demo window */}
      <div
        style={{
          marginTop: 28,
          background: PALETTE.bgSurface,
          border: `1px solid ${PALETTE.borderPrimary}`,
          borderRadius: 16,
          padding: 12,
          boxShadow: '0 15px 45px rgba(0,0,0,0.4)',
          maxWidth: 800,
          margin: '28px auto 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 7,
            marginBottom: 10,
            paddingLeft: 4,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
        </div>
        <div
          style={{
            background: '#000',
            borderRadius: 8,
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: PALETTE.textMuted,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>∫</div>
            <div style={{ fontSize: 16, color: PALETTE.accentPurple }}>AI Math Workspace</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Scene3ProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Browser entrance
  const browserS = spring({ frame: frame - 0, fps, config: { damping: 20, stiffness: 60, mass: 1.2 } });
  const browserY = interpolate(browserS, [0, 1], [120, 0]);
  const browserScale = interpolate(browserS, [0, 1], [0.68, 0.78]);
  const browserOpacity = interpolate(browserS, [0, 1], [0, 1]);

  // Camera push
  const camScale = interpolate(frame, [34, 92], [0.78, 0.84], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Browser tilt after click
  const rotYBase = 10;
  const rotYPost = interpolate(frame, [88, 150], [rotYBase, 6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Gentle float
  const float = Math.sin(frame * 0.015) * 4;
  const floatRot = Math.sin(frame * 0.02) * 1;

  // Glass label
  const labelS = spring({ frame: frame - 18, fps, config: { damping: 18, stiffness: 80 } });
  const labelX = interpolate(labelS, [0, 1], [-40, 0]);
  const labelOpacity = interpolate(labelS, [0, 1], [0, 1]);

  // Cursor movement
  // Click target: center of demo window inside browser content area
  // Browser is at scale camScale, centered. Content area starts after chrome (36px)
  // Demo window is roughly at x=200, y=390 within the 1200px wide content
  const cursorStartX = 120;
  const cursorStartY = 500;
  const cursorTargetX = 600;
  const cursorTargetY = 450;

  const cursorProgress = interpolate(frame, [48, 88], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const cursorX = interpolate(cursorProgress, [0, 1], [cursorStartX, cursorTargetX]);
  const cursorY = interpolate(cursorProgress, [0, 1], [cursorStartY, cursorTargetY]);
  const cursorVisible = frame >= 48;

  // Click ripple
  const clickRipple = frame >= 88 ? spring({ frame: frame - 88, fps, config: { damping: 8, stiffness: 200 } }) : 0;
  const rippleOpacity = interpolate(clickRipple, [0, 0.5, 1], [0.8, 0.8, 0]);

  // Demo area brightness after click
  const demoBright = interpolate(frame, [88, 120], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Exit
  const exitScale = interpolate(frame, [150, durationInFrames], [1, 1.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const exitOpacity = interpolate(frame, [210, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  // Orbit ring
  const ringRot = frame * 0.25;

  return (
    <AbsoluteFill style={{ background: PALETTE.bgPrimary, opacity: exitOpacity }}>
      <GradientMesh
        colors={['#8b5cf6', '#3b82f6', '#ec4899', '#1a1a1a']}
        baseColor={PALETTE.bgPrimary}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles count={16} colors={['rgba(139,92,246,0.5)', 'rgba(59,130,246,0.45)', 'rgba(236,72,153,0.3)']} />
      </AbsoluteFill>

      {/* Orbit ring */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) rotate(${ringRot}deg)`,
          pointerEvents: 'none',
        }}
      >
        <svg width="900" height="600">
          <ellipse
            cx="450"
            cy="300"
            rx="440"
            ry="290"
            fill="none"
            stroke="rgba(59,130,246,0.1)"
            strokeWidth="1"
            strokeDasharray="10 16"
          />
        </svg>
      </div>

      {/* Lens flare orbs */}
      <div
        style={{
          position: 'absolute',
          left: '15%',
          top: '25%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
          transform: `translateY(${Math.sin(frame * 0.01) * 20}px)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '12%',
          bottom: '20%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
          transform: `translateY(${Math.cos(frame * 0.012) * 16}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Camera + browser wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${camScale * exitScale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* 3D perspective wrapper */}
        <div
          style={{
            perspective: 1200,
            transform: `translateY(${browserY + float}px)`,
            opacity: browserOpacity,
          }}
        >
          <div
            style={{
              transform: `scale(${browserScale}) rotateX(-8deg) rotateY(${rotYPost + floatRot}deg)`,
              transformStyle: 'preserve-3d',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
              borderRadius: 12,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <BrowserFrame url="calcgpt.io" width={1200} shadow={false} darkMode>
              <div style={{ position: 'relative' }}>
                <CalcGPTAppMockup />
                {/* Demo area glow after click */}
                {demoBright > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `rgba(139,92,246,${demoBright * 0.06})`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Cursor */}
                {cursorVisible && (
                  <div
                    style={{
                      position: 'absolute',
                      left: cursorX,
                      top: cursorY,
                      width: 24,
                      height: 24,
                      pointerEvents: 'none',
                      zIndex: 9999,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                        fill="white"
                        stroke="black"
                        strokeWidth="1"
                      />
                    </svg>
                    {/* Click ripple */}
                    {frame >= 88 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -16,
                          left: -16,
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          border: `2px solid rgba(139,92,246,${rippleOpacity * 0.8})`,
                          background: `rgba(139,92,246,${rippleOpacity * 0.12})`,
                          transform: `scale(${clickRipple})`,
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </BrowserFrame>
          </div>
        </div>
      </div>

      {/* Glass label */}
      <div
        style={{
          position: 'absolute',
          left: '4%',
          top: '18%',
          transform: `translateX(${labelX}px)`,
          opacity: labelOpacity,
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          padding: '16px 24px',
          fontFamily: interFamily,
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: PALETTE.textPrimary, marginBottom: 4 }}>
          All-in-one AI math workspace
        </div>
        <div style={{ fontSize: 12, color: PALETTE.textSecondary }}>calcgpt.io</div>
      </div>
    </AbsoluteFill>
  );
};
