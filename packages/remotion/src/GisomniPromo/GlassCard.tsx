import React from "react";

type Props = {
  children: React.ReactNode;
  width?: number;
  style?: React.CSSProperties;
};

export const GlassCard: React.FC<Props> = ({
  children,
  width = 380,
  style = {},
}) => {
  return (
    <div
      style={{
        width,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: "28px 32px",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
