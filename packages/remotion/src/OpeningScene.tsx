import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Img
        src={staticFile("logo.png")}
        style={{
          width: "50%",
          height: "auto",
          transform: `scale(${1 + frame / (5 * fps)})`,
        }}
      />
      <Audio src={staticFile("whoosh.wav")} volume={1} />
    </AbsoluteFill>
  );
};
