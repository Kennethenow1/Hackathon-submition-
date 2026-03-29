import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { BrowserFrame } from '../../BrowserFrame';
import { GradientMeshBg } from '../helpers/GradientMeshBg';
import { Particles } from '../helpers/Particles';
import { BlurredOrb } from '../helpers/BlurredOrb';
import { OrbitRing } from '../helpers/OrbitRing';
import { MockHomepage } from '../helpers/MockHomepage';
import { arrowTipOffsetPx, CURSOR_ARROW_PATH_D } from '../../cursorTipOffset';
import { COLORS } from '../constants';

// Cursor targets within the mock homepage layout (relative to browser content area)
const UPLOAD_CENTER = { x: 480, y: 245 };
const INPUT_CENTER = { x: 380, y: 320 };

export const Scene3_UIReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = 150; // frames

  // Browser entrance
  const browserSpring = spring({ frame, fps, config: { damping: 15, stiffness: 50, mass: 1.2 } });
  const browserY = interpolate(browserSpring, [0, 1], [140, 0]);
  const browserScale = interpolate(browserSpring, [0, 1], [0.72, 0.9]);
  const browserO = interpolate(browserSpring, [0, 1], [0, 1]);

  // Camera push-in
  const cameraScale = interpolate(frame, [30, 120], [1.0, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const cameraY = interpolate(frame, [30, 120], [0, -30], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Cursor path: appear at 54, go to upload at 54-84, click at 84, go to input 90-108, click 108
  const cursorAppear = frame >= 54;
  const tip = arrowTipOffsetPx(24);

  let cursorX = 200;
  let cursorY = 450;
  let clicking = false;

  if (frame >= 54 && frame < 84) {
    const t = interpolate(frame, [54, 84], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.quad),
    });
    cursorX = interpolate(t, [0, 1], [200, UPLOAD_CENTER.x]);
    cursorY = interpolate(t, [0, 1], [450, UPLOAD_CENTER.y]);
  } else if (frame >= 84 && frame < 90) {
    cursorX = UPLOAD_CENTER.x;
    cursorY = UPLOAD_CENTER.y;
    if (frame >= 84 && frame <= 88) clicking = true;
  } else if (frame >= 90 && frame < 108) {
    const t = interpolate(frame, [90, 108], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.quad),
    });
    cursorX = interpolate(t, [0, 1], [UPLOAD_CENTER.x, INPUT_CENTER.x]);
    cursorY = interpolate(t, [0, 1], [UPLOAD_CENTER.y, INPUT_CENTER.y]);
  } else if (frame >= 108) {
    cursorX = INPUT_CENTER.x;
    cursorY = INPUT_CENTER.y;
    if (frame >= 108 && frame <= 112) clicking = true;
  }

  const cursorScale = clicking ? 0.85 : 1;

  // Click ripple
  const showRipple1 = frame >= 84 && frame <= 96;
  const showRipple2 = frame >= 108 && frame <= 120;
  const ripple1Scale = spring({ frame: frame - 84, fps, config: { damping: 8, stiffness: 200 } });
  const ripple2Scale = spring({ frame: frame - 108, fps, config: { damping: 8, stiffness: 200 } });

  return (
    <AbsoluteFill>
      <GradientMeshBg colors={['#3490dc', '#f3f4f6', '#ffffff', '#e5e7eb']} intensity={0.7} />
      <Particles count={16} color="rgba(52,144,220,0.25)" />
      <BlurredOrb x={20} y={40} size={280} />
      <OrbitRing size={200} style={{ position: 'absolute', right: 60, top: 40 }} speed={0.25} dashArray="6 10" />

      <AbsoluteFill
        style={{
          transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            transform: `translateY(${browserY}px) scale(${browserScale})`,
            opacity: browserO,
            position: 'relative',
          }}
        >
          <BrowserFrame url="math-gpt.org" width={960} shadow darkMode={false}>
            <div style={{ position: 'relative' }}>
              <MockHomepage width={960} />
              {/* Cursor */}
              {cursorAppear && (
                <div
                  style={{
                    position: 'absolute',
                    left: cursorX - tip.dx,
                    top: cursorY - tip.dy,
                    width: 24,
                    height: 24,
                    transform: `scale(${cursorScale})`,
                    pointerEvents: 'none',
                    zIndex: 9999,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d={CURSOR_ARROW_PATH_D} fill="white" stroke="black" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
              {/* Click ripples */}
              {showRipple1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: UPLOAD_CENTER.x - 20,
                    top: UPLOAD_CENTER.y - 20,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '2px solid rgba(52,144,220,0.5)',
                    background: 'rgba(52,144,220,0.1)',
                    transform: `scale(${ripple1Scale})`,
                    opacity: interpolate(ripple1Scale, [0, 1], [1, 0]),
                    pointerEvents: 'none',
                  }}
                />
              )}
              {showRipple2 && (
                <div
                  style={{
                    position: 'absolute',
                    left: INPUT_CENTER.x - 20,
                    top: INPUT_CENTER.y - 20,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '2px solid rgba(52,144,220,0.5)',
                    background: 'rgba(52,144,220,0.1)',
                    transform: `scale(${ripple2Scale})`,
                    opacity: interpolate(ripple2Scale, [0, 1], [1, 0]),
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          </BrowserFrame>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
