import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { Scene1_BrandHook } from './scenes/Scene1_BrandHook';
import { Scene2_ProblemContext } from './scenes/Scene2_ProblemContext';
import { Scene3_UIReveal } from './scenes/Scene3_UIReveal';
import { Scene4_StepByStep } from './scenes/Scene4_StepByStep';
import { Scene5_VideoExplanations } from './scenes/Scene5_VideoExplanations';
import { Scene6_QuizzesGraphing } from './scenes/Scene6_QuizzesGraphing';
import { Scene7_Metrics } from './scenes/Scene7_Metrics';
import { Scene8_ClosingCTA } from './scenes/Scene8_ClosingCTA';
import { TOTAL_DURATION_FRAMES } from './constants';

/*
  Scene layout (frames):
  Scene 1: 0–120     (120 frames)
  Scene 2: 120–240   (120 frames)
  Scene 3: 240–390   (150 frames)
  Scene 4: 390–540   (150 frames)
  Scene 5: 540–660   (120 frames)
  Scene 6: 660–780   (120 frames)
  Scene 7: 780–840   (60 frames)
  Scene 8: 840–900   (60 frames)
  Total: 900 frames
*/

const SCENE_TIMINGS = [
  { from: 0, duration: 120 },     // Scene 1
  { from: 120, duration: 120 },   // Scene 2
  { from: 240, duration: 150 },   // Scene 3
  { from: 390, duration: 150 },   // Scene 4
  { from: 540, duration: 120 },   // Scene 5
  { from: 660, duration: 120 },   // Scene 6
  { from: 780, duration: 60 },    // Scene 7
  { from: 840, duration: 60 },    // Scene 8
];

/** Remotion throws if inputRange is not strictly increasing (e.g. [60,60] when fadeOut is 0). */
function crossfadeOpacity(
  sceneFrame: number,
  duration: number,
  fadeIn: number,
  fadeOut: number
): number {
  const fi = Math.max(0, fadeIn);
  const fo = Math.max(0, fadeOut);

  const inStart = -fi;
  const inEnd = 0;
  const enterO =
    fi > 0 && inStart < inEnd
      ? interpolate(sceneFrame, [inStart, inEnd], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;

  const outStart = duration - fo;
  const outEnd = duration;
  const exitO =
    fo > 0 && outStart < outEnd
      ? interpolate(sceneFrame, [outStart, outEnd], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;

  return enterO * exitO;
}

// Cross-fade wrapper
const CrossfadeScene: React.FC<{
  children: React.ReactNode;
  from: number;
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ children, from, duration, fadeIn = 18, fadeOut = 18 }) => {
  const frame = useCurrentFrame();
  const sceneFrame = frame - from;

  const fi = Math.max(0, fadeIn);
  const fo = Math.max(0, fadeOut);

  if (sceneFrame < -fi || sceneFrame > duration + fo) return null;

  const opacity = crossfadeOpacity(sceneFrame, duration, fi, fo);

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

export const MATHGPT_PROMO_DURATION = TOTAL_DURATION_FRAMES;

export const MathGPTPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#FFFFFF' }}>
      {/* Scene 1 */}
      <Sequence from={SCENE_TIMINGS[0].from} durationInFrames={SCENE_TIMINGS[0].duration + 18} premountFor={10}>
        <Scene1_BrandHook />
      </Sequence>

      {/* Scene 2 */}
      <CrossfadeScene from={SCENE_TIMINGS[1].from} duration={SCENE_TIMINGS[1].duration} fadeIn={18} fadeOut={18}>
        <Sequence from={0} durationInFrames={SCENE_TIMINGS[1].duration + 36}>
          <Scene2_ProblemContext />
        </Sequence>
      </CrossfadeScene>

      {/* Scene 3 */}
      <CrossfadeScene from={SCENE_TIMINGS[2].from} duration={SCENE_TIMINGS[2].duration} fadeIn={18} fadeOut={24}>
        <Sequence from={0} durationInFrames={SCENE_TIMINGS[2].duration + 42}>
          <Scene3_UIReveal />
        </Sequence>
      </CrossfadeScene>

      {/* Scene 4 */}
      <CrossfadeScene from={SCENE_TIMINGS[3].from} duration={SCENE_TIMINGS[3].duration} fadeIn={20} fadeOut={20}>
        <Sequence from={0} durationInFrames={SCENE_TIMINGS[3].duration + 40}>
          <Scene4_StepByStep />
        </Sequence>
      </CrossfadeScene>

      {/* Scene 5 */}
      <CrossfadeScene from={SCENE_TIMINGS[4].from} duration={SCENE_TIMINGS[4].duration} fadeIn={18} fadeOut={18}>
        <Sequence from={0} durationInFrames={SCENE_TIMINGS[4].duration + 36}>
          <Scene5_VideoExplanations />
        </Sequence>
      </CrossfadeScene>

      {/* Scene 6 */}
      <CrossfadeScene from={SCENE_TIMINGS[5].from} duration={SCENE_TIMINGS[5].duration} fadeIn={16} fadeOut={16}>
        <Sequence from={0} durationInFrames={SCENE_TIMINGS[5].duration + 32}>
          <Scene6_QuizzesGraphing />
        </Sequence>
      </CrossfadeScene>

      {/* Scene 7 */}
      <CrossfadeScene from={SCENE_TIMINGS[6].from} duration={SCENE_TIMINGS[6].duration} fadeIn={16} fadeOut={20}>
        <Sequence from={0} durationInFrames={SCENE_TIMINGS[6].duration + 36}>
          <Scene7_Metrics />
        </Sequence>
      </CrossfadeScene>

      {/* Scene 8 — 1f fade-out avoids degenerate interpolate range; visually same as hard cut */}
      <CrossfadeScene from={SCENE_TIMINGS[7].from} duration={SCENE_TIMINGS[7].duration} fadeIn={20} fadeOut={1}>
        <Sequence from={0} durationInFrames={SCENE_TIMINGS[7].duration + 21}>
          <Scene8_ClosingCTA />
        </Sequence>
      </CrossfadeScene>
    </AbsoluteFill>
  );
};
