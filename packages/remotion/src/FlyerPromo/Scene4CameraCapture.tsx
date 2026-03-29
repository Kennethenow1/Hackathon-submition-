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
import { COLORS } from './colors';
import { FlyCursor } from './FlyCursor';
import { BrowserFrame } from '../BrowserFrame';
import {
  AppMockUI,
  APP_TAKE_PHOTO_BTN_LEFT,
  APP_TAKE_PHOTO_BTN_TOP,
  APP_TAKE_PHOTO_BTN_WIDTH,
  APP_TAKE_PHOTO_BTN_HEIGHT,
  BROWSER_CONTENT_WIDTH,
} from './AppMockUI';

const { loadFont } = require('@remotion/google-fonts/Outfit');
loadFont();

export const Scene4CameraCapture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Relative frames (scene starts at absolute 360)

  // Zoom into Take a Photo button (frames 0-24 relative)
  const zoomScale = interpolate(frame, [0, 24], [1.0, 2.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  // Blur edges as zoom happens
  const edgeBlur = interpolate(frame, [0, 24], [0, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glassmorphism callout (frames 18-36 relative)
  const calloutSpring = spring({ frame: frame - 18, fps, config: { damping: 15, stiffness: 90 } });
  const calloutX = interpolate(calloutSpring, [0, 1], [80, 0]);
  const calloutO = interpolate(calloutSpring, [0, 1], [0, 1]);

  // Cursor to Take a Photo button (frames 30-42 relative, click at 42)
  const btnCenterX = APP_TAKE_PHOTO_BTN_LEFT + APP_TAKE_PHOTO_BTN_WIDTH / 2;
  const btnCenterY = APP_TAKE_PHOTO_BTN_TOP + APP_TAKE_PHOTO_BTN_HEIGHT / 2;
  const cursorPoints = [
    { x: 300, y: 350, frame: 30 },
    { x: btnCenterX, y: btnCenterY, frame: 42, click: true },
    { x: btnCenterX, y: btnCenterY, frame: 70 },
  ];

  // Camera modal rise (frames 44-72 relative)
  const modalSpring = spring({ frame: frame - 44, fps, config: { damping: 18, stiffness: 80 } });
  const modalY = interpolate(modalSpring, [0, 1], [80, 0]);
  const modalO = interpolate(modalSpring, [0, 1], [0, 1]);
  const showModal = frame >= 44;

  // Capture button pulse (frames 78-102 relative)
  const pulse1 = spring({ frame: frame - 78, fps, config: { damping: 8, stiffness: 200 } });
  const pulse2 = spring({ frame: frame - 92, fps, config: { damping: 8, stiffness: 200 } });
  const captureScale =
    1 +
    interpolate(pulse1, [0, 1], [0, 0.06]) -
    interpolate(pulse2, [0, 1], [0, 0.06]);

  // Scan shimmer in preview (frames 60-90 relative)
  const shimmerPos = interpolate(frame, [60, 90], [-20, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Hold push-in (frames 96-120 relative)
  const holdPush = interpolate(frame, [96, 120], [1, 1.04], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Exit (frames 110-120 relative)
  const exitO = interpolate(frame, [110, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Outfit, sans-serif',
        opacity: exitO,
        overflow: 'hidden',
      }}
    >
      <GradientMeshBg
        colors={[COLORS.accentSoft, '#f7f8fa', COLORS.accentLight, COLORS.bgLight]}
      />

      {/* Dimmed blurred backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,15,26,0.35)',
          backdropFilter: `blur(${edgeBlur}px)`,
        }}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles count={12} color="rgba(99,102,241,0.2)" />
      </AbsoluteFill>

      {/* Camera scale wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${holdPush})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Zoomed browser region */}
        <div
          style={{
            position: 'relative',
            perspective: 1200,
          }}
        >
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: `${(APP_TAKE_PHOTO_BTN_LEFT + APP_TAKE_PHOTO_BTN_WIDTH / 2) / BROWSER_CONTENT_WIDTH * 100}% ${(APP_TAKE_PHOTO_BTN_TOP + APP_TAKE_PHOTO_BTN_HEIGHT / 2) / 600 * 100}%`,
              transition: 'none',
            }}
          >
            <BrowserFrame url="flyer.it.com" width={BROWSER_CONTENT_WIDTH} shadow>
              <div style={{ position: 'relative' }}>
                <AppMockUI showPreview={false} />
                {frame < 44 && (
                  <FlyCursor
                    points={cursorPoints}
                    startVisible={30}
                  />
                )}
              </div>
            </BrowserFrame>
          </div>

          {/* Camera Modal overlay */}
          {showModal && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: 480,
                  background: COLORS.bgCard,
                  borderRadius: '20px 20px 0 0',
                  boxShadow: '0 -20px 60px rgba(0,0,0,0.2)',
                  transform: `translateY(${modalY}px)`,
                  opacity: modalO,
                  overflow: 'hidden',
                }}
              >
                {/* Camera header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px 16px',
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: COLORS.textPrimary,
                      margin: 0,
                    }}
                  >
                    Take a Photo
                  </h3>
                  <button
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.bgLight,
                      fontSize: 18,
                      color: COLORS.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Camera preview */}
                <div
                  className="camera-preview-container"
                  style={{
                    width: '100%',
                    height: 240,
                    background: '#1a1a2e',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Simulated camera preview with flyer */}
                  <div
                    style={{
                      width: 140,
                      height: 180,
                      background: 'white',
                      borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                      gap: 8,
                      opacity: interpolate(frame, [60, 70], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      }),
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: COLORS.accentSoft,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke={COLORS.accent} strokeWidth="2" />
                        <path d="M8 7h8M8 11h8M8 15h5" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.textPrimary }}>Event Flyer</div>
                    <div style={{ fontSize: 7, color: COLORS.textSecondary, textAlign: 'center' }}>Sat 7PM</div>
                  </div>

                  {/* Scan shimmer */}
                  {frame >= 60 && frame <= 90 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: `${shimmerPos}%`,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, transparent, ${COLORS.accentLight}cc, transparent)`,
                      }}
                    />
                  )}

                  {/* Corner guides */}
                  {[0, 1, 2, 3].map((c) => (
                    <div
                      key={c}
                      style={{
                        position: 'absolute',
                        width: 20,
                        height: 20,
                        top: c < 2 ? 12 : 'auto',
                        bottom: c >= 2 ? 12 : 'auto',
                        left: c % 2 === 0 ? 12 : 'auto',
                        right: c % 2 === 1 ? 12 : 'auto',
                        borderTop: c < 2 ? `2px solid rgba(255,255,255,0.6)` : 'none',
                        borderBottom: c >= 2 ? `2px solid rgba(255,255,255,0.6)` : 'none',
                        borderLeft: c % 2 === 0 ? `2px solid rgba(255,255,255,0.6)` : 'none',
                        borderRight: c % 2 === 1 ? `2px solid rgba(255,255,255,0.6)` : 'none',
                        borderRadius: c < 2 ? (c === 0 ? '4px 0 0 0' : '0 4px 0 0') : (c === 2 ? '0 0 0 4px' : '0 0 4px 0'),
                      }}
                    />
                  ))}
                </div>

                {/* Capture controls */}
                <div
                  className="camera-controls"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '24px',
                  }}
                >
                  {/* Capture button */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      border: `3px solid ${COLORS.accent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `scale(${captureScale})`,
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" />
                        <circle cx="12" cy="12" r="4" fill="white" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Glassmorphism callout */}
        <div
          style={{
            position: 'absolute',
            right: 100,
            top: '35%',
            padding: '16px 24px',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            transform: `translateX(${calloutX}px)`,
            opacity: calloutO,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>Snap a flyer instantly</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>No file needed</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
