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
import { GradientMesh } from '../helpers/GradientMesh';
import { Particles } from '../helpers/Particles';
import { OrbitRing } from '../helpers/OrbitRing';
import { COLORS } from '../constants';

const { fontFamily: inter } = loadInter();

export const Scene5CheckWork: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Panel entrance
  const panelSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const panelY = interpolate(panelSpring, [0, 1], [80, 0]);

  // Camera pan down
  const camPanY = interpolate(frame, [30, 108], [0, -30], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Check boxes
  const correctDelay = 20;
  const error1Delay = 52;
  const error2Delay = 72;

  const correctSpring = spring({ frame: frame - correctDelay, fps, config: { damping: 16, stiffness: 100 } });
  const error1Spring = spring({ frame: frame - error1Delay, fps, config: { damping: 16, stiffness: 100 } });
  const error2Spring = spring({ frame: frame - error2Delay, fps, config: { damping: 16, stiffness: 100 } });

  // Exit
  const exitOpacity = interpolate(frame, [102, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitBlur = interpolate(frame, [102, 120], [0, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bgPrimary }}>
      <GradientMesh
        colors={[
          COLORS.bgPrimary,
          COLORS.bgSurface,
          '#1a3322',
          '#2a1515',
        ]}
      />
      <Particles count={10} colors={['#2ecc71', '#e74c3c', COLORS.accentBlue]} opacity={0.2} />
      <OrbitRing size={400} speed={0.2} />

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          filter: `blur(${exitBlur}px)`,
          transform: `translateY(${camPanY}px)`,
        }}
      >
        {/* Main panel */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translateY(${panelY}px)`,
            opacity: panelSpring,
            width: 700,
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 20,
              fontWeight: 600,
              color: COLORS.textPrimary,
              marginBottom: 16,
            }}
          >
            ✅ Check Work
          </div>

          {/* Worksheet */}
          <div
            style={{
              background: '#000',
              borderRadius: 12,
              padding: 24,
              position: 'relative',
              aspectRatio: '388 / 533',
              maxHeight: 520,
              overflow: 'hidden',
            }}
          >
            {/* Worksheet lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: '80%',
                  height: 10,
                  borderRadius: 5,
                  background: 'rgba(255,255,255,0.08)',
                  marginBottom: 30,
                  marginLeft: 20,
                }}
              />
            ))}

            {/* Correct box */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 10,
                right: 10,
                height: 60,
                border: '2px solid #2ecc71',
                background: 'rgba(46, 204, 113, 0.2)',
                borderRadius: 8,
                opacity: correctSpring,
                transform: `scale(${interpolate(correctSpring, [0, 1], [0.94, 1])})`,
              }}
            >
              {/* Popup */}
              <div
                style={{
                  position: 'absolute',
                  top: -42,
                  left: 10,
                  background: COLORS.bgSurfaceElevated,
                  color: COLORS.textPrimary,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: inter,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  maxWidth: 220,
                  opacity: correctSpring,
                }}
              >
                ✓ Correct! Well done.
              </div>
            </div>

            {/* Error box 1 */}
            <div
              style={{
                position: 'absolute',
                top: 110,
                left: 10,
                right: 10,
                height: 60,
                border: '2px solid #e74c3c',
                background: 'rgba(231, 76, 60, 0.25)',
                borderRadius: 8,
                opacity: error1Spring,
                transform: `scale(${interpolate(error1Spring, [0, 1], [0.94, 1])})`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -42,
                  right: 10,
                  background: COLORS.bgSurfaceElevated,
                  color: COLORS.textPrimary,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: inter,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  maxWidth: 220,
                  opacity: error1Spring,
                }}
              >
                ✗ Sign error in step 2
              </div>
            </div>

            {/* Error box 2 */}
            <div
              style={{
                position: 'absolute',
                top: 200,
                left: 10,
                right: 10,
                height: 60,
                border: '2px solid #e74c3c',
                background: 'rgba(231, 76, 60, 0.25)',
                borderRadius: 8,
                opacity: error2Spring,
                transform: `scale(${interpolate(error2Spring, [0, 1], [0.94, 1])})`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -42,
                  left: 10,
                  background: COLORS.bgSurfaceElevated,
                  color: COLORS.textPrimary,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: inter,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  maxWidth: 220,
                  opacity: error2Spring,
                }}
              >
                ✗ Arithmetic mistake
              </div>
            </div>
          </div>
        </div>

        {/* Metric callout */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            bottom: 100,
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 500,
            color: COLORS.textSecondary,
            opacity: interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          Catch mistakes before they compound.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
