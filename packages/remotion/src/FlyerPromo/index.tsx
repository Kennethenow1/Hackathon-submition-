import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, series, Sequence, interpolate, Easing } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { loadFont } from "@remotion/google-fonts/Outfit";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4 } from "./Scene4";
import { Scene5 } from "./Scene5";
import { Scene6 } from "./Scene6";
import { Scene7 } from "./Scene7";
import { Scene8 } from "./Scene8";

loadFont();

// Master timeline:
// Scene 1:  0.0s -  3.0s (90 frames)
// Scene 2:  3.0s -  7.0s (120 frames)
// Scene 3:  7.0s - 11.0s (120 frames)
// Scene 4: 11.0s - 16.0s (150 frames)
// Scene 5: 16.0s - 22.0s (180 frames)
// Scene 6: 22.0s - 27.0s (150 frames)
// Scene 7: 27.0s - 32.0s (150 frames)
// Scene 8: 32.0s - 35.0s (90 frames)
//
// Using TransitionSeries with 28-frame overlaps
// Total raw sum: 90+120+120+150+180+150+150+90 = 1050
// With 7 transitions of 28 frames each: 1050 - 7*28 = 1050 - 196 = 854
// We need exactly 1050 frames, so we use Series with non-overlapping durations
// and handle transitions internally per scene

export const FLYER_COMP_DURATION_IN_FRAMES = 1050;

export const FlyerPromo: React.FC<Record<string, never>> = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      { /* Scene 1: 0-90 */ }
      <Sequence from={0} durationInFrames={100} premountFor={10}>
        <Scene1 />
      </Sequence>
      { /* Scene 2: 90-210 */ }
      <Sequence from={85} durationInFrames={135} premountFor={10}>
        <Scene2 />
      </Sequence>
      { /* Scene 3: 210-330 */ }
      <Sequence from={205} durationInFrames={135} premountFor={10}>
        <Scene3 />
      </Sequence>
      { /* Scene 4: 330-480 */ }
      <Sequence from={325} durationInFrames={165} premountFor={10}>
        <Scene4 />
      </Sequence>
      { /* Scene 5: 480-660 */ }
      <Sequence from={470} durationInFrames={200} premountFor={10}>
        <Scene5 />
      </Sequence>
      { /* Scene 6: 660-810 */ }
      <Sequence from={650} durationInFrames={170} premountFor={10}>
        <Scene6 />
      </Sequence>
      { /* Scene 7: 810-960 */ }
      <Sequence from={802} durationInFrames={168} premountFor={10}>
        <Scene7 />
      </Sequence>
      { /* Scene 8: 960-1050 */ }
      <Sequence from={950} durationInFrames={100} premountFor={10}>
        <Scene8 />
      </Sequence>
    </AbsoluteFill>
  );
};
