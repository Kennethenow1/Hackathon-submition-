import { AbsoluteFill, Audio, Video, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const FeatureShowcase = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Video src={staticFile("feature-showcase.mp4")} volume={1} />
      <Audio src={staticFile("ambient-rise.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};
