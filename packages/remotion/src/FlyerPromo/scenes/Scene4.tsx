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
import { COLORS } from '../constants';
import { FONT_FAMILY } from '../fonts';
import { GradientBg } from '../utils/GradientBg';
import { Particles } from '../utils/Particles';
import { Cursor } from '../utils/Cursor';
import { FlyerAppUI } from '../utils/FlyerAppUI';

export const SCENE4_DURATION = 240;

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera zoom into upload area
  const zoomScale = interpolate(frame, [0, 18], [1.0, 1.65], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Flyer drop animation
  const dropProgress = spring({ frame, fps, delay: 22, config: { damping: 14, stiffness: 80 } });
  const dropY = interpolate(dropProgress, [0, 1], [-300, 0], { extrapolateRight: 'clamp' });
  const dropRot = interpolate(dropProgress, [0, 1], [6, 0], { extrapolateRight: 'clamp' });
  const dropScale = interpolate(dropProgress, [0, 1], [0.92, 1], { extrapolateRight: 'clamp' });

  // Glow pulse on upload area
  const glowPulse = frame >= 8 && frame <= 20
    ? interpolate(frame, [8, 14, 20], [0, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Camera modal
  const showCamera = frame >= 80 && frame <= 122;
  const cameraEnter = spring({ frame, fps, delay: 80, config: { damping: 18, stiffness: 70 } });
  const cameraOp = frame >= 80 ? interpolate(cameraEnter, [0, 1], [0, 1]) : 0;

  // Shutter flash
  const flash = frame >= 114 && frame <= 118
    ? interpolate(frame, [114, 116, 118], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Drift
  const driftY = Math.sin(frame * 0.03) * 4;

  const exitOp = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <GradientBg colors={[COLORS.offWhite, COLORS.subtleBlue, COLORS.white, COLORS.lightGray]} />
      <Particles count={12} color="rgba(74,143,231,0.15)" />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${zoomScale}) translateY(${driftY}px)`,
          transformOrigin: '50% 45%',
          opacity: exitOp,
        }}
      >
        <BrowserFrame url="flyer.it.com" width={860}>
          <div style={{ position: 'relative' }}>
            <FlyerAppUI state="landing" showCamera={showCamera} />

            {/* Upload glow */}
            {glowPulse > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 125,
                  left: 120,
                  right: 120,
                  height: 200,
                  borderRadius: 14,
                  boxShadow: `0 0 30px rgba(74,143,231,${glowPulse})`,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Dropping flyer */}
            {frame >= 22 && frame < 80 && (
              <div
                style={{
                  position: 'absolute',
                  top: 140,
                  left: '50%',
                  transform: `translateX(-50%) translateY(${dropY}px) rotateZ(${dropRot}deg) scale(${dropScale})`,
                  width: 160,
                  height: 200,
                  background: 'linear-gradient(145deg, #fff 0%, #f0f2f5 100%)',
                  borderRadius: 10,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontFamily: FONT_FAMILY,
                  opacity: dropProgress,
                  zIndex: 10,
                }}
              >
                <div style={{ fontSize: 32 }}>📋</div>
                <div style={{ width: '70%', height: 4, borderRadius: 2, background: COLORS.lightGray }} />
                <div style={{ width: '50%', height: 4, borderRadius: 2, background: COLORS.lightGray }} />
              </div>
            )}
          </div>
        </BrowserFrame>

        {/* Shutter flash */}
        {flash > 0 && (
          <AbsoluteFill
            style={{
              background: `rgba(255,255,255,${flash * 0.8})`,
              pointerEvents: 'none',
            }}
          />
        )}

        <Cursor
          startDelay={0}
          points={[
            { x: 960, y: 610, frame: 58 },
            { x: 960, y: 540, frame: 74, click: true },
            { x: 680, y: 580, frame: 100 },
            { x: 700, y: 660, frame: 112, click: true },
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
