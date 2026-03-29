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
import { PALETTE } from './constants';
import { GradientMesh } from './GradientMesh';
import { Particles } from './Particles';
import { BrowserFrame } from '../BrowserFrame';

const { fontFamily: interFamily } = loadInter();

type CheckBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  isCorrect: boolean;
  label: string;
  feedback: string;
};

const BOXES: CheckBox[] = [
  { x: 30, y: 40, w: 280, h: 60, isCorrect: true, label: 'Step 1', feedback: 'Correct! Good setup.' },
  { x: 30, y: 140, w: 280, h: 60, isCorrect: false, label: 'Step 2', feedback: 'Sign error: should be −2x, not +2x' },
  { x: 30, y: 240, w: 280, h: 60, isCorrect: false, label: 'Step 3', feedback: 'Missing constant C in integration' },
];

const WorksheetMockup: React.FC<{ visibleBoxes: number; clickedIdx: number }> = ({ visibleBoxes, clickedIdx }) => (
  <div
    style={{
      width: 400,
      height: 540,
      background: '#f8f6f0',
      borderRadius: 12,
      padding: 24,
      position: 'relative',
      fontFamily: 'Georgia, serif',
      overflow: 'hidden',
    }}
  >
    {/* Paper texture lines */}
    {Array.from({ length: 16 }).map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 48 + i * 30,
          height: 1,
          background: 'rgba(100,149,237,0.2)',
        }}
      />
    ))}

    {/* Math work content */}
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 24 }}>
        Calculus Practice — Integration
      </div>
      <div style={{ fontSize: 13, color: '#444', lineHeight: 2 }}>
        <div>1. ∫(2x + 1) dx</div>
        <div style={{ marginLeft: 16, color: '#222' }}>= x² + x + C</div>
        <div style={{ marginTop: 12 }}>2. ∫(x² − 2x) dx</div>
        <div style={{ marginLeft: 16, color: '#c0392b' }}>= x³/3 + 2x² / 2</div>
        <div style={{ marginTop: 12 }}>3. ∫(3x² + 1) dx</div>
        <div style={{ marginLeft: 16, color: '#c0392b' }}>= x³ + x</div>
      </div>
    </div>

    {/* Check boxes */}
    {BOXES.map((box, i) => {
      if (i >= visibleBoxes) return null;
      const color = box.isCorrect ? '#2ecc71' : '#e74c3c';
      const bg = box.isCorrect ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.25)';
      return (
        <div key={i}>
          <div
            style={{
              position: 'absolute',
              left: box.x,
              top: box.y,
              width: box.w,
              height: box.h,
              border: `2px solid ${color}`,
              background: bg,
              borderRadius: 6,
              zIndex: 2,
            }}
          />
          {/* Feedback popup */}
          {i < clickedIdx && (
            <div
              style={{
                position: 'absolute',
                left: box.x + box.w + 8,
                top: box.y + box.h / 2 - 18,
                background: '#2a2a2a',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: interFamily,
                boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap',
                zIndex: 10,
              }}
            >
              {box.feedback}
            </div>
          )}
        </div>
      );
    })}
  </div>
);

export const Scene5CheckWork: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance
  const enterS = spring({ frame: frame - 0, fps, config: { damping: 18, stiffness: 70 } });
  const enterX = interpolate(enterS, [0, 1], [200, 0]);
  const enterOpacity = interpolate(enterS, [0, 1], [0, 1]);

  // Box reveals
  const box1Visible = frame >= 20;
  const box2Visible = frame >= 52;
  const box3Visible = frame >= 118;

  const visibleBoxes = (box1Visible ? 1 : 0) + (box2Visible ? 1 : 0) + (box3Visible ? 1 : 0);

  // Feedback popups (clickedIdx determines shown feedback)
  // box1 feedback at frame 26, box2 at 86, box3 at 148
  const clickedIdx =
    frame >= 148 ? 3 :
    frame >= 86 ? 2 :
    frame >= 26 ? 1 : 0;

  // Camera push
  const camScale = interpolate(frame, [150, 200], [1, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Caption
  const captionS = spring({ frame: frame - 200, fps, config: { damping: 18, stiffness: 80 } });
  const captionY = interpolate(captionS, [0, 1], [40, 0]);
  const captionOpacity = interpolate(captionS, [0, 1], [0, 1]);

  // Cursor
  const cursorVisible = frame >= 52 && frame <= 180;
  const cursor2Progress = interpolate(frame, [52, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const cursor3Progress = interpolate(frame, [118, 142], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Cursor positions (within the worksheet area, scaled)
  const cx2 = interpolate(cursor2Progress, [0, 1], [40, 170]);
  const cy2 = interpolate(cursor2Progress, [0, 1], [60, 170]);
  const cx3 = interpolate(cursor3Progress, [0, 1], [cx2, 170]);
  const cy3 = interpolate(cursor3Progress, [0, 1], [cy2, 270]);

  const cursorX = frame >= 118 ? cx3 : cx2;
  const cursorY = frame >= 118 ? cy3 : cy2;

  // Click ripple
  const click2Ripple = frame >= 80 ? spring({ frame: frame - 80, fps, config: { damping: 8, stiffness: 200 } }) : 0;
  const click3Ripple = frame >= 142 ? spring({ frame: frame - 142, fps, config: { damping: 8, stiffness: 200 } }) : 0;

  // Exit
  const exitOpacity = interpolate(frame, [228, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ background: PALETTE.bgPrimary, opacity: exitOpacity }}>
      <GradientMesh
        colors={['#1a1a1a', '#0a0a0a', '#2ecc71', '#e74c3c']}
        baseColor={PALETTE.bgPrimary}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles
          count={14}
          colors={['rgba(46,204,113,0.2)', 'rgba(231,76,60,0.2)', 'rgba(59,130,246,0.25)']}
        />
      </AbsoluteFill>

      {/* Camera push */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${camScale})`,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Worksheet in browser frame */}
        <div
          style={{
            transform: `translateX(${enterX}px)`,
            opacity: enterOpacity,
            perspective: 1200,
          }}
        >
          <div
            style={{
              transform: 'rotateX(-4deg) rotateY(-8deg)',
              transformStyle: 'preserve-3d',
              boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <BrowserFrame url="calcgpt.io/check" width={520} shadow={false} darkMode>
              <div
                style={{
                  background: PALETTE.bgSurface,
                  padding: 24,
                  position: 'relative',
                  minHeight: 600,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: PALETTE.textPrimary,
                    fontFamily: interFamily,
                    marginBottom: 20,
                  }}
                >
                  Check Work ✓
                </div>

                <div style={{ position: 'relative' }}>
                  <WorksheetMockup visibleBoxes={visibleBoxes} clickedIdx={clickedIdx} />

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
                      {/* Click ripple 2 */}
                      {frame >= 80 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -14, left: -14,
                            width: 52, height: 52,
                            borderRadius: '50%',
                            border: `2px solid rgba(231,76,60,${interpolate(click2Ripple, [0, 0.5, 1], [0.8, 0.8, 0])})`,
                            background: `rgba(231,76,60,${interpolate(click2Ripple, [0, 0.5, 1], [0.15, 0.15, 0])})`,
                            transform: `scale(${click2Ripple})`,
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                      {/* Click ripple 3 */}
                      {frame >= 142 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -14, left: -14,
                            width: 52, height: 52,
                            borderRadius: '50%',
                            border: `2px solid rgba(231,76,60,${interpolate(click3Ripple, [0, 0.5, 1], [0.8, 0.8, 0])})`,
                            background: `rgba(231,76,60,${interpolate(click3Ripple, [0, 0.5, 1], [0.15, 0.15, 0])})`,
                            transform: `scale(${click3Ripple})`,
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </BrowserFrame>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div
        style={{
          position: 'absolute',
          left: '4%',
          bottom: '8%',
          transform: `translateY(${captionY}px)`,
          opacity: captionOpacity,
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '16px 24px',
          fontFamily: interFamily,
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: PALETTE.textPrimary, marginBottom: 4 }}>
          Catch mistakes before they cost you points.
        </div>
        <div style={{ fontSize: 14, color: PALETTE.textSecondary }}>Instant feedback on every step.</div>
      </div>
    </AbsoluteFill>
  );
};
