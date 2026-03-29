import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { GradientMeshBg } from './GradientMeshBg';
import { Particles } from './Particles';
import { OrbitRing } from './OrbitRing';
import { COLORS } from './colors';
import { BrowserFrame } from '../BrowserFrame';
import { FlyCursor } from './FlyCursor';
import {
  AppMockUI,
  APP_UPLOAD_LABEL_TOP,
  APP_UPLOAD_LABEL_LEFT,
  APP_UPLOAD_LABEL_WIDTH,
  APP_UPLOAD_LABEL_HEIGHT,
  BROWSER_CONTENT_WIDTH,
  BROWSER_CONTENT_HEIGHT,
} from './AppMockUI';

const { loadFont } = require('@remotion/google-fonts/Outfit');
loadFont();

const BROWSER_CHROME_HEIGHT = 36;

export const Scene3ProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // All frames here are relative (scene starts at absolute 210)
  // FloatingBrowser spring-in (frames 0-22 relative)
  const browserSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60, mass: 1.2 },
  });
  const browserY = interpolate(browserSpring, [0, 1], [120, 0]);
  const browserScale = interpolate(browserSpring, [0, 1], [0.72, 0.86]);
  const browserOpacity = interpolate(frame, [0, 22], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const rotateY = interpolate(frame, [0, 32], [14, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Camera push-in (frames 114-150 relative)
  const cameraScale = interpolate(frame, [114, 150], [0.86, 0.96], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Exit crossfade
  const exitOpacity = interpolate(frame, [140, 150], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Uploaded thumbnail spring (frame 96 relative)
  const thumbSpring = spring({
    frame: frame - 96,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const showThumb = frame >= 96;
  const thumbScale = interpolate(thumbSpring, [0, 1], [0.7, 1.0]);
  const thumbO = interpolate(thumbSpring, [0, 1], [0, 1]);

  // Cursor path (upload label center in browser content coords)
  const uploadCenterX = APP_UPLOAD_LABEL_LEFT + APP_UPLOAD_LABEL_WIDTH / 2;
  const uploadCenterY = APP_UPLOAD_LABEL_TOP + APP_UPLOAD_LABEL_HEIGHT / 2;

  const cursorPoints = [
    { x: 80, y: 480, frame: 60 },
    { x: uploadCenterX, y: uploadCenterY, frame: 96, click: true },
    { x: uploadCenterX, y: uploadCenterY, frame: 150 },
  ];

  // Ambient drift
  const drift = Math.sin(frame * 0.018) * 4;

  // Orb glow
  const orb1x = 15 + Math.sin(frame * 0.01) * 8;
  const orb1y = 20 + Math.cos(frame * 0.012) * 6;
  const orb2x = 75 + Math.cos(frame * 0.009) * 10;
  const orb2y = 65 + Math.sin(frame * 0.011) * 8;

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Outfit, sans-serif',
        opacity: exitOpacity,
        overflow: 'hidden',
      }}
    >
      <GradientMeshBg
        colors={[COLORS.accent, COLORS.accentLight, COLORS.accentSoft, '#f7f8fa']}
      />

      {/* Orbs */}
      <div
        style={{
          position: 'absolute',
          left: `${orb1x}%`,
          top: `${orb1y}%`,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${orb2x}%`,
          top: `${orb2y}%`,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)`,
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles count={18} color="rgba(99,102,241,0.3)" />
      </AbsoluteFill>

      {/* Orbit ring */}
      <OrbitRing size={320} speed={0.22} color="rgba(99,102,241,0.1)" cx="50%" cy="52%" />

      {/* Camera scale wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraScale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* 3D browser wrapper */}
        <div
          style={{
            perspective: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              transform: `
                translateY(${browserY + drift}px)
                scale(${browserScale})
                rotateX(-7deg)
                rotateY(${rotateY}deg)
              `,
              opacity: browserOpacity,
              transformStyle: 'preserve-3d',
              boxShadow: '0 48px 100px -20px rgba(0,0,0,0.3)',
              borderRadius: 12,
            }}
          >
            <BrowserFrame
              url="flyer.it.com"
              width={BROWSER_CONTENT_WIDTH}
              shadow={false}
            >
              <div style={{ position: 'relative' }}>
                <AppMockUI showPreview={false} />

                {/* Cursor inside browser content */}
                <FlyCursor
                  points={cursorPoints}
                  startVisible={60}
                />

                {/* Thumbnail overlay */}
                {showThumb && (
                  <div
                    style={{
                      position: 'absolute',
                      top: APP_UPLOAD_LABEL_TOP + 20,
                      left: APP_UPLOAD_LABEL_LEFT + APP_UPLOAD_LABEL_WIDTH / 2 - 50,
                      width: 100,
                      height: 80,
                      borderRadius: 12,
                      background: 'white',
                      boxShadow: `0 8px 24px rgba(99,102,241,0.25), 0 0 0 2px ${COLORS.accent}`,
                      opacity: thumbO,
                      transform: `scale(${thumbScale})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke={COLORS.accent} strokeWidth="2" />
                        <path d="M8 7h8M8 11h8" stroke={COLORS.accent} strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </BrowserFrame>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
