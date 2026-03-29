import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const ClosingScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <h1 style={{ fontSize: "48px", fontWeight: "bold" }}>
        PTT – translating your world, one presentation at a time.
      </h1>
      <Audio src={staticFile("chime.wav")} volume={1} />
    </AbsoluteFill>
  );
};
