import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Scene1Hero } from "./Scene1Hero";
import { Scene2Challenge } from "./Scene2Challenge";
import { Scene3ProductReveal } from "./Scene3ProductReveal";
import { Scene4ResourceMapping } from "./Scene4ResourceMapping";
import { Scene5Community } from "./Scene5Community";
import { Scene6Insights } from "./Scene6Insights";
import { Scene7Products } from "./Scene7Products";
import { Scene8Proof } from "./Scene8Proof";
import { Scene9CTA } from "./Scene9CTA";

// Master timeline from prompt.md:
// Scene 1: 0–180
// Scene 2: 180–360
// Scene 3: 360–540
// Scene 4: 540–780
// Scene 5: 780–1020
// Scene 6: 1020–1260
// Scene 7: 1260–1470
// Scene 8: 1470–1650
// Scene 9: 1650–1800

// Crossfade overlap durations:
const CF_1_2 = 18;
const CF_2_3 = 24;
const CF_3_4 = 20;
const CF_4_5 = 18;
const CF_5_6 = 22;
const CF_6_7 = 24;
const CF_7_8 = 20;
const CF_8_9 = 18;

export const GISOMNI_PROMO_DURATION = 1800;

// Each scene is a Sequence at the exact frame offset from prompt.
// Crossfade overlaps are achieved by overlapping Sequences and applying
// opacity fades in each scene's exit animation.

export const GisomniPromo: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene visibility helpers for crossfade layering
  const s2FadeIn = interpolate(frame, [180 - CF_1_2, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s3FadeIn = interpolate(frame, [360 - CF_2_3, 360], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s4FadeIn = interpolate(frame, [540 - CF_3_4, 540], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s5FadeIn = interpolate(frame, [780 - CF_4_5, 780], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s6FadeIn = interpolate(frame, [1020 - CF_5_6, 1020], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s7FadeIn = interpolate(frame, [1260 - CF_6_7, 1260], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s8FadeIn = interpolate(frame, [1470 - CF_7_8, 1470], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s9FadeIn = interpolate(frame, [1650 - CF_8_9, 1650], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      {/* Scene 1: frames 0-180 */}
      <Sequence from={0} durationInFrames={180} premountFor={10}>
        <AbsoluteFill>
          <Scene1Hero />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: frames 162-360 (early start for crossfade) */}
      <Sequence from={180 - CF_1_2} durationInFrames={360 - 180 + CF_1_2} premountFor={10}>
        <AbsoluteFill style={{ opacity: frame < 180 ? s2FadeIn : 1 }}>
          <Scene2Challenge />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: frames 336-540 */}
      <Sequence from={360 - CF_2_3} durationInFrames={540 - 360 + CF_2_3} premountFor={10}>
        <AbsoluteFill style={{ opacity: frame < 360 ? s3FadeIn : 1 }}>
          <Scene3ProductReveal />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: frames 520-780 */}
      <Sequence from={540 - CF_3_4} durationInFrames={780 - 540 + CF_3_4} premountFor={10}>
        <AbsoluteFill style={{ opacity: frame < 540 ? s4FadeIn : 1 }}>
          <Scene4ResourceMapping />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: frames 762-1020 */}
      <Sequence from={780 - CF_4_5} durationInFrames={1020 - 780 + CF_4_5} premountFor={10}>
        <AbsoluteFill style={{ opacity: frame < 780 ? s5FadeIn : 1 }}>
          <Scene5Community />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6: frames 998-1260 */}
      <Sequence from={1020 - CF_5_6} durationInFrames={1260 - 1020 + CF_5_6} premountFor={10}>
        <AbsoluteFill style={{ opacity: frame < 1020 ? s6FadeIn : 1 }}>
          <Scene6Insights />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 7: frames 1236-1470 */}
      <Sequence from={1260 - CF_6_7} durationInFrames={1470 - 1260 + CF_6_7} premountFor={10}>
        <AbsoluteFill style={{ opacity: frame < 1260 ? s7FadeIn : 1 }}>
          <Scene7Products />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 8: frames 1450-1650 */}
      <Sequence from={1470 - CF_7_8} durationInFrames={1650 - 1470 + CF_7_8} premountFor={10}>
        <AbsoluteFill style={{ opacity: frame < 1470 ? s8FadeIn : 1 }}>
          <Scene8Proof />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 9: frames 1632-1800 */}
      <Sequence from={1650 - CF_8_9} durationInFrames={1800 - 1650 + CF_8_9} premountFor={10}>
        <AbsoluteFill style={{ opacity: frame < 1650 ? s9FadeIn : 1 }}>
          <Scene9CTA />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
