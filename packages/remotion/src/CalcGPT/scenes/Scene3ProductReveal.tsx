import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { FloatingBrowser } from '../../BrowserFrame';
import { GradientMesh } from '../helpers/GradientMesh';
import { Particles } from '../helpers/Particles';
import { OrbitRing } from '../helpers/OrbitRing';
import { LensFlare } from '../helpers/LensFlare';
import { COLORS } from '../constants';
import { arrowTipOffsetPx, CURSOR_ARROW_PATH_D } from '../../cursorTipOffset';

const { fontFamily: inter } = loadInter();

export const Scene3ProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Browser entrance
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60, mass: 1.2 },
  });
  const browserY = interpolate(enterSpring, [0, 1], [140, 0]);
  const browserScale = interpolate(enterSpring, [0, 1], [0.72, 0.84]);
  const browserOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // Camera push-in
  const cameraPush = interpolate(frame, [20, 80], [0.84, 0.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const actualScale = frame > 20 ? cameraPush : browserScale;

  // Cursor animation
  const cursorVisible = frame >= 36;
  const cursorX = interpolate(frame, [36, 84], [200, 480], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const cursorY = interpolate(frame, [36, 84], [120, 260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Click ripple at frame 72
  const clickFrame = 72;
  const isClicking = frame >= clickFrame && frame <= clickFrame + 10;
  const clickRippleScale = spring({
    frame: frame - clickFrame,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  const tip = arrowTipOffsetPx(24);

  // Exit zoom prep
  const exitZoom = interpolate(frame, [90, 120], [1, 2.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const exitOpacity = interpolate(frame, [108, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bgPrimary }}>
      <GradientMesh
        colors={[
          COLORS.accentBlue,
          COLORS.accentPurple,
          COLORS.bgSurface,
          COLORS.bgPrimary,
        ]}
      />
      <Particles count={14} colors={[COLORS.accentBlue, COLORS.accentPurple]} />
      <LensFlare x={75} y={35} size={350} color={COLORS.accentBlue} />
      <OrbitRing size={600} speed={0.12} dashArray="4 14" />

      {/* Side text */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: '40%',
          width: '22%',
          opacity: interpolate(frame, [12, 40], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          transform: `translateY(${interpolate(frame, [12, 40], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
        }}
      >
        <div
          style={{
            fontFamily: inter,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.textPrimary,
            lineHeight: 1.3,
            marginBottom: 12,
          }}
        >
          One workspace.
          <br />
          Every math tool.
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 15,
            color: COLORS.textSecondary,
            lineHeight: 1.6,
          }}
        >
          CalcGPT brings everything together.
        </div>
      </div>

      {/* Browser */}
      <div
        style={{
          position: 'absolute',
          right: 60,
          top: '50%',
          transform: `translateY(-50%) translateY(${browserY}px) scale(${exitZoom})`,
          opacity: browserOpacity * exitOpacity,
          transformOrigin: '60% 40%',
        }}
      >
        <FloatingBrowser
          url="calcgpt.ai"
          width={900}
          rotateX={-7}
          rotateY={10}
          scale={actualScale}
          durationInFrames={120}
        >
          {/* Reconstructed CalcGPT hero area */}
          <div
            style={{
              background: COLORS.bgPrimary,
              width: '100%',
              height: 480,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
              position: 'relative',
            }}
          >
            {/* Radial bg */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at 50% 30%, ${COLORS.bgSurface} 0%, ${COLORS.bgPrimary} 70%)`,
              }}
            />
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 36,
                  fontWeight: 500,
                  color: COLORS.textPrimary,
                  lineHeight: 1.2,
                  marginBottom: 16,
                }}
              >
                This AI makes you
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.gradientTextStart}, ${COLORS.gradientTextEnd})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  better at math
                </span>
              </div>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  marginBottom: 24,
                }}
              >
                Break down complex problems into understandable steps.
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  borderRadius: 14,
                  background: COLORS.textPrimary,
                  color: COLORS.bgPrimary,
                  fontFamily: inter,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Use CalcGPT
              </div>
            </div>

            {/* Demo window area */}
            <div
              style={{
                marginTop: 30,
                width: '80%',
                height: 180,
                background: COLORS.bgSurface,
                borderRadius: 16,
                border: `1px solid ${COLORS.borderPrimary}`,
                boxShadow: '0 15px 45px rgba(0,0,0,0.3)',
                padding: 12,
                position: 'relative',
              }}
            >
              {/* Demo dots */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
              </div>
              <div
                style={{
                  width: '70%',
                  height: 10,
                  borderRadius: 5,
                  background: COLORS.borderPrimary,
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  width: '50%',
                  height: 8,
                  borderRadius: 4,
                  background: COLORS.borderPrimary,
                }}
              />
            </div>

            {/* Cursor */}
            {cursorVisible && (
              <div
                style={{
                  position: 'absolute',
                  left: cursorX - tip.dx,
                  top: cursorY - tip.dy,
                  width: 24,
                  height: 24,
                  zIndex: 9999,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  pointerEvents: 'none',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d={CURSOR_ARROW_PATH_D}
                    fill="white"
                    stroke="black"
                    strokeWidth="1.5"
                  />
                </svg>
                {isClicking && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: -8,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: `2px solid rgba(59,130,246,0.5)`,
                      background: 'rgba(59,130,246,0.1)',
                      transform: `scale(${clickRippleScale})`,
                      opacity: interpolate(clickRippleScale, [0, 1], [1, 0]),
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </FloatingBrowser>
      </div>
    </AbsoluteFill>
  );
};
