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
import { FlyCursor } from './FlyCursor';

const { loadFont } = require('@remotion/google-fonts/Outfit');
loadFont();

// Layout constants for the calendar section (within the focused view)
const CAL_MODULE_LEFT = 200;
const CAL_MODULE_TOP = 200;
const CAL_MODULE_WIDTH = 560;
const CAL_MODULE_HEIGHT = 100;

const CONNECT_BTN_WIDTH = 120;
const CONNECT_BTN_HEIGHT = 40;
const CONNECT_BTN_LEFT = CAL_MODULE_LEFT + CAL_MODULE_WIDTH - CONNECT_BTN_WIDTH - 20;
const CONNECT_BTN_TOP = CAL_MODULE_TOP + (CAL_MODULE_HEIGHT - CONNECT_BTN_HEIGHT) / 2;

export const Scene6CalendarConnect: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Relative frames (scene starts at absolute 630)

  // Module zoom-in land (frames 0-24 relative)
  const landSpring = spring({ frame, fps, config: { damping: 16, stiffness: 70, mass: 1.1 } });
  const sectionScale = interpolate(landSpring, [0, 1], [0.8, 1.0]);
  const sectionO = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Status text fade in (frames 12-36 relative)
  const statusS = spring({ frame: frame - 12, fps, config: { damping: 16, stiffness: 100 } });
  const statusO = interpolate(statusS, [0, 1], [0, 1]);

  // Connected state (frame 54 relative)
  const connected = frame >= 54;
  const connectedProgress = interpolate(frame, [54, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Sweep across module (frames 54-90 relative)
  const sweepW = interpolate(frame, [54, 90], [0, CAL_MODULE_WIDTH], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Check indicator (frames 72-108 relative)
  const checkS = spring({ frame: frame - 72, fps, config: { damping: 12, stiffness: 100 } });
  const checkScale = interpolate(checkS, [0, 1], [0.4, 1.0]);
  const checkO = interpolate(checkS, [0, 1], [0, 1]);

  // Camera tilt back (frames 96-120 relative)
  const tiltBack = interpolate(frame, [96, 120], [1.0, 0.92], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Cursor path (to Connect button center)
  const btnCx = CONNECT_BTN_LEFT + CONNECT_BTN_WIDTH / 2;
  const btnCy = CONNECT_BTN_TOP + CONNECT_BTN_HEIGHT / 2;
  const cursorPoints = [
    { x: 100, y: 400, frame: 24 },
    { x: btnCx, y: btnCy, frame: 54, click: true },
    { x: btnCx, y: btnCy, frame: 120 },
  ];

  // Glass annotation (frames 72-120 relative)
  const glassS = spring({ frame: frame - 72, fps, config: { damping: 14, stiffness: 80 } });
  const glassX = interpolate(glassS, [0, 1], [-60, 0]);
  const glassO = interpolate(glassS, [0, 1], [0, 1]);

  // Exit crossfade (frames 110-120 relative)
  const exitO = interpolate(frame, [110, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const drift = Math.sin(frame * 0.018) * 3;

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Outfit, sans-serif',
        opacity: exitO,
        overflow: 'hidden',
      }}
    >
      {/* Subdued blurred bg */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(247,248,250,0.95)',
          backdropFilter: 'blur(8px)',
        }}
      />
      <GradientMeshBg
        colors={[COLORS.accentSoft, COLORS.bgLight, COLORS.accentLight, '#f0f4ff']}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles count={8} color="rgba(99,102,241,0.2)" />
      </AbsoluteFill>

      <OrbitRing size={300} speed={0.25} dashArray="6 16" color="rgba(99,102,241,0.1)" cx="50%" cy="50%" />

      {/* Camera tilt wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${tiltBack})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Focused calendar module */}
        <div
          style={{
            position: 'relative',
            opacity: sectionO,
            transform: `scale(${sectionScale}) translateY(${drift}px)`,
          }}
        >
          {/* Card wrapping the module */}
          <div
            style={{
              width: CAL_MODULE_WIDTH,
              background: COLORS.bgCard,
              borderRadius: 20,
              padding: 40,
              boxShadow: '0 20px 60px -12px rgba(0,0,0,0.12)',
              border: `1px solid ${COLORS.border}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Progress sweep */}
            {frame >= 54 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: sweepW,
                  height: '100%',
                  background: `linear-gradient(90deg, ${COLORS.accentSoft}80, transparent)`,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Module content */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Left: heading + status */}
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.textPrimary,
                    marginBottom: 2,
                  }}
                >
                  Google Calendar
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: connected
                      ? interpolate(connectedProgress, [0, 1], [0, 1]) > 0.5
                        ? COLORS.success
                        : COLORS.textMuted
                      : COLORS.textMuted,
                    opacity: statusO,
                    fontWeight: 500,
                  }}
                >
                  {connected && connectedProgress > 0.5
                    ? 'Connected ✓'
                    : 'Not connected'}
                </div>
              </div>

              {/* Right: Connect button */}
              <button
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: `1.5px solid ${connected && connectedProgress > 0.5 ? COLORS.success : COLORS.border}`,
                  background:
                    connected && connectedProgress > 0.5
                      ? COLORS.successLight
                      : COLORS.bgCard,
                  fontSize: 13,
                  fontWeight: 600,
                  color:
                    connected && connectedProgress > 0.5
                      ? COLORS.success
                      : COLORS.textPrimary,
                  cursor: 'pointer',
                  boxShadow:
                    connected && connectedProgress > 0.5
                      ? `0 4px 16px rgba(34,197,94,0.2)`
                      : 'none',
                  transition: 'none',
                }}
              >
                {connected && connectedProgress > 0.5 ? 'Connected ✓' : 'Connect'}
              </button>
            </div>

            {/* Check indicator */}
            {frame >= 72 && (
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  opacity: checkO,
                  transform: `scale(${checkScale})`,
                  transformOrigin: 'left center',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: COLORS.success,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px rgba(34,197,94,0.35)`,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline
                      points="20 6 9 17 4 12"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.success,
                  }}
                >
                  Calendar connected successfully
                </span>
              </div>
            )}
          </div>

          {/* Cursor */}
          <FlyCursor
            points={cursorPoints}
            startVisible={24}
          />
        </div>

        {/* Glass annotation */}
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: '30%',
            padding: '14px 22px',
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            transform: `translateX(${glassX}px)`,
            opacity: glassO,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>Connected in seconds</div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 3 }}>Events go straight to calendar</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
