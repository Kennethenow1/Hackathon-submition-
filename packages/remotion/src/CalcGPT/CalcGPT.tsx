import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Scene1Hero } from './Scene1Hero';
import { Scene2Problem } from './Scene2Problem';
import { Scene3ProductReveal } from './Scene3ProductReveal';
import { Scene4Notebook } from './Scene4Notebook';
import { Scene5CheckWork } from './Scene5CheckWork';
import { Scene6Desmos } from './Scene6Desmos';
import { Scene7StudyGrid } from './Scene7StudyGrid';
import { Scene8Proof } from './Scene8Proof';
import { Scene9CTA } from './Scene9CTA';

export const CALCGPT_DURATION_IN_FRAMES = 1980;

// Scene timeline from brief (exact frame offsets)
const SCENES = [
  { start: 0,    dur: 200 }, // Scene 1: Hero (0-180, +20 overlap)
  { start: 160,  dur: 220 }, // Scene 2: Problem (180-360, crossfade overlap)
  { start: 340,  dur: 280 }, // Scene 3: Product reveal (360-600)
  { start: 580,  dur: 280 }, // Scene 4: Notebook (600-840)
  { start: 820,  dur: 280 }, // Scene 5: Check Work (840-1080)
  { start: 1060, dur: 280 }, // Scene 6: Desmos (1080-1320)
  { start: 1300, dur: 280 }, // Scene 7: Study Grid (1320-1560)
  { start: 1540, dur: 280 }, // Scene 8: Proof (1560-1800)
  { start: 1800, dur: 180 }, // Scene 9: CTA (1800-1980)
];

export const CalcGPT: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0a0a0a' }}>
      <Sequence from={SCENES[0].start} durationInFrames={SCENES[0].dur} premountFor={30}>
        <Scene1Hero />
      </Sequence>
      <Sequence from={SCENES[1].start} durationInFrames={SCENES[1].dur} premountFor={30}>
        <Scene2Problem />
      </Sequence>
      <Sequence from={SCENES[2].start} durationInFrames={SCENES[2].dur} premountFor={30}>
        <Scene3ProductReveal />
      </Sequence>
      <Sequence from={SCENES[3].start} durationInFrames={SCENES[3].dur} premountFor={30}>
        <Scene4Notebook />
      </Sequence>
      <Sequence from={SCENES[4].start} durationInFrames={SCENES[4].dur} premountFor={30}>
        <Scene5CheckWork />
      </Sequence>
      <Sequence from={SCENES[5].start} durationInFrames={SCENES[5].dur} premountFor={30}>
        <Scene6Desmos />
      </Sequence>
      <Sequence from={SCENES[6].start} durationInFrames={SCENES[6].dur} premountFor={30}>
        <Scene7StudyGrid />
      </Sequence>
      <Sequence from={SCENES[7].start} durationInFrames={SCENES[7].dur} premountFor={30}>
        <Scene8Proof />
      </Sequence>
      <Sequence from={SCENES[8].start} durationInFrames={SCENES[8].dur} premountFor={30}>
        <Scene9CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
