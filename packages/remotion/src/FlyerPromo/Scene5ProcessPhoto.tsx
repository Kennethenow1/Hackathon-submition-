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
  APP_PROCESS_BTN_LEFT,
  APP_PROCESS_BTN_TOP,
  APP_PROCESS_BTN_WIDTH,
  APP_PROCESS_BTN_HEIGHT,
  BROWSER_CONTENT_WIDTH,
} from './AppMockUI';

const { loadFont } = require('@remotion/google-fonts/Outfit');
loadFont();

export const Scene5ProcessPhoto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Relative frames (scene starts at absolute 480)

  // Browser reframe (frames 0-24 relative)
  const reframeScale = interpolate(frame, [0, 24], [0.96, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Content appear (frames 12-42 relative)
  const contentSpring = spring({ frame: frame - 12, fps, config: { damping: 16, stiffness: 80 } });
  const contentO = interpolate(contentSpring, [0, 1], [0, 1]);

  // Cursor to Process Photo button (frames 48-66 relative, click at 66)
  const btnCenterX = APP_PROCESS_BTN_LEFT + APP_PROCESS_BTN_WIDTH / 2;
  const btnCenterY = APP_PROCESS_BTN_TOP + APP_PROCESS_BTN_HEIGHT / 2;
  const cursorPoints = [
    { x: 100, y: 300, frame: 48 },
    { x: btnCenterX, y: btnCenterY, frame: 66, click: true },
    { x: btnCenterX, y: btnCenterY, frame: 150 },
  ];

  // Processing state (frame 66 relative)
  const processingActive = frame >= 66;

  // Scan line progress (frames 66-106 relative)
  const scanProgress = interpolate(frame, [66, 106], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulse ripple (frame 66 relative)
  const rippleSpring = spring({ frame: frame - 66, fps, config: { damping: 8, stiffness: 150 } });
  const rippleScale = interpolate(rippleSpring, [0, 1], [0.8, 2.0]);
  const rippleO = interpolate(rippleSpring, [0, 1], [0.6, 0]);

  // Camera push (frames 86-126 relative)
  const camScale = interpolate(frame, [86, 126], [1.02, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Exit (frames 140-150 relative)
  const exitO = interpolate(frame, [140, 150], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Secondary controls dim (frames 86-126)
  const secondaryDim = interpolate(frame, [86, 106], [1, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const drift = Math.sin(frame * 0.02) * 3;

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Outfit, sans-serif',
        opacity: exitO,
        overflow: 'hidden',
      }}
    >
      <GradientMeshBg
        colors={[COLORS.bgLight, COLORS.accentSoft, COLORS.accentLight, '#f3f4f6']}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles count={12} color="rgba(99,102,241,0.25)" />
      </AbsoluteFill>

      <OrbitRing size={260} speed={0.2} color="rgba(99,102,241,0.08)" cx="55%" cy="55%" />

      {/* Camera scale wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${reframeScale}) scale(${camScale})`,
          transformOrigin: 'center center',
        }}
      >
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
              transform: `translateY(${drift}px) rotateX(-5deg) rotateY(8deg)`,
              transformStyle: 'preserve-3d',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.25)',
              borderRadius: 12,
            }}
          >
            <BrowserFrame url="flyer.it.com" width={BROWSER_CONTENT_WIDTH} shadow={false}>
              <div style={{ position: 'relative', opacity: contentO }}>
                <AppMockUI
                  showPreview
                  previewVisible
                  processingActive={processingActive}
                />

                {/* Ripple effect on process button */}
                {frame >= 66 && frame <= 100 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: APP_PROCESS_BTN_TOP + APP_PROCESS_BTN_HEIGHT / 2 - 24,
                      left: APP_PROCESS_BTN_LEFT + APP_PROCESS_BTN_WIDTH / 2 - 24,
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      border: `2px solid ${COLORS.accent}`,
                      transform: `scale(${rippleScale})`,
                      opacity: rippleO,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Scan line */}
                {processingActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 160 + scanProgress * 1.6,
                      left: 40,
                      right: 40,
                      height: 2,
                      background: `linear-gradient(90deg, transparent, ${COLORS.accent}99, transparent)`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                <FlyCursor
                  points={cursorPoints}
                  startVisible={48}
                />
              </div>
            </BrowserFrame>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
