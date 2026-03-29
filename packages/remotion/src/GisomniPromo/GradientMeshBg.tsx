import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

type Props = {
  colors?: [string, string, string, string];
  baseColor?: string;
};

export const GradientMeshBg: React.FC<Props> = ({
  colors = ["#111111", "#444444", "#999999", "#ffffff"],
  baseColor = "#111111",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -120,
          background: `
            radial-gradient(ellipse 80% 60% at ${50 + Math.sin(frame * 0.008) * 18}% ${40 + Math.cos(frame * 0.006) * 12}%, ${colors[0]}88 0%, transparent 70%),
            radial-gradient(ellipse 70% 80% at ${30 + Math.cos(frame * 0.01) * 22}% ${60 + Math.sin(frame * 0.007) * 18}%, ${colors[1]}55 0%, transparent 65%),
            radial-gradient(ellipse 90% 50% at ${70 + Math.sin(frame * 0.012) * 14}% ${30 + Math.cos(frame * 0.009) * 14}%, ${colors[2]}33 0%, transparent 60%),
            radial-gradient(ellipse 60% 70% at ${50 + Math.cos(frame * 0.011) * 16}% ${70 + Math.sin(frame * 0.008) * 12}%, ${colors[3]}1a 0%, transparent 70%),
            linear-gradient(135deg, ${baseColor} 0%, #1a1a2e 100%)
          `,
        }}
      />
    </AbsoluteFill>
  );
};
