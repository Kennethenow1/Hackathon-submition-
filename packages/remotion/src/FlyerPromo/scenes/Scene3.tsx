import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { FloatingBrowser } from '../../BrowserFrame';
import { COLORS } from '../constants';
import { GradientBg } from '../utils/GradientBg';
import { Particles } from '../utils/Particles';
import { LensFlare } from '../utils/LensFlare';
import { Cursor } from '../utils/Cursor';
import { FlyerAppUI } from '../utils/FlyerAppUI';

export const SCENE3_DURATION = 180;

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitOp = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <GradientBg colors={[COLORS.offWhite, COLORS.lightGray, COLORS.subtleBlue, COLORS.white]} />
      <Particles count={14} color="rgba(74,143,231,0.15)" />
      <LensFlare x={20} y={20} size={250} />
      <LensFlare x={80} y={70} size={200} color="rgba(200,210,230,0.2)" />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: exitOp,
        }}
      >
        <FloatingBrowser
          url="flyer.it.com"
          width={860}
          rotateX={-8}
          rotateY={10}
          scale={0.84}
          enterDelay={0}
          durationInFrames={180}
        >
          <FlyerAppUI state="landing" />
        </FloatingBrowser>

        <Cursor
          startDelay={0}
          points={[
            { x: 1320, y: 230, frame: 48 },
            { x: 1200, y: 300, frame: 68 },
            { x: 960, y: 480, frame: 92 },
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
