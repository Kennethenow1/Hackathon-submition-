import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { Scene1, SCENE1_DURATION } from './scenes/Scene1';
import { Scene2, SCENE2_DURATION } from './scenes/Scene2';
import { Scene3, SCENE3_DURATION } from './scenes/Scene3';
import { Scene4, SCENE4_DURATION } from './scenes/Scene4';
import { Scene5, SCENE5_DURATION } from './scenes/Scene5';
import { Scene6, SCENE6_DURATION } from './scenes/Scene6';
import { Scene7, SCENE7_DURATION } from './scenes/Scene7';
import { Scene8, SCENE8_DURATION } from './scenes/Scene8';
import { Scene9, SCENE9_DURATION } from './scenes/Scene9';

// Scene start frames from timeline
const S1_START = 0;
const S2_START = 180;
const S3_START = 360;
const S4_START = 540;
const S5_START = 780;
const S6_START = 1020;
const S7_START = 1260;
const S8_START = 1500;
const S9_START = 1680;

export const FLYER_PROMO_DURATION = 1800;

// Crossfade overlap
const XFADE = 15;

export const FlyerPromo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: '#F7F8FA' }}>
      {/* Scene 1 */}
      <Sequence from={S1_START} durationInFrames={SCENE1_DURATION + XFADE} premountFor={30}>
        <Scene1 />
      </Sequence>

      {/* Scene 2 */}
      <Sequence from={S2_START - XFADE} durationInFrames={SCENE2_DURATION + XFADE * 2} premountFor={30}>
        <AbsoluteFill style={{ opacity: interpolate(frame - (S2_START - XFADE), [0, XFADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <Scene2 />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3 */}
      <Sequence from={S3_START - XFADE} durationInFrames={SCENE3_DURATION + XFADE * 2} premountFor={30}>
        <AbsoluteFill style={{ opacity: interpolate(frame - (S3_START - XFADE), [0, XFADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <Scene3 />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4 */}
      <Sequence from={S4_START - XFADE} durationInFrames={SCENE4_DURATION + XFADE * 2} premountFor={30}>
        <AbsoluteFill style={{ opacity: interpolate(frame - (S4_START - XFADE), [0, XFADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <Scene4 />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5 */}
      <Sequence from={S5_START - XFADE} durationInFrames={SCENE5_DURATION + XFADE * 2} premountFor={30}>
        <AbsoluteFill style={{ opacity: interpolate(frame - (S5_START - XFADE), [0, XFADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <Scene5 />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6 */}
      <Sequence from={S6_START - XFADE} durationInFrames={SCENE6_DURATION + XFADE * 2} premountFor={30}>
        <AbsoluteFill style={{ opacity: interpolate(frame - (S6_START - XFADE), [0, XFADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <Scene6 />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 7 */}
      <Sequence from={S7_START - XFADE} durationInFrames={SCENE7_DURATION + XFADE * 2} premountFor={30}>
        <AbsoluteFill style={{ opacity: interpolate(frame - (S7_START - XFADE), [0, XFADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <Scene7 />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 8 */}
      <Sequence from={S8_START - XFADE} durationInFrames={SCENE8_DURATION + XFADE * 2} premountFor={30}>
        <AbsoluteFill style={{ opacity: interpolate(frame - (S8_START - XFADE), [0, XFADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <Scene8 />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 9 */}
      <Sequence from={S9_START - XFADE} durationInFrames={SCENE9_DURATION + XFADE} premountFor={30}>
        <AbsoluteFill style={{ opacity: interpolate(frame - (S9_START - XFADE), [0, XFADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <Scene9 />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
