import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { outfitFamily, spaceGroteskFamily } from "./fonts";

export const MockDashboard: React.FC = () => {
  const frame = useCurrentFrame();

  const kpis = [
    { label: "Active Users", value: 2847, color: "#111111" },
    { label: "Data Points", value: 14503, color: "#444444" },
    { label: "AI Queries", value: 892, color: "#666666" },
  ];

  // Chart line animation
  const chartProgress = interpolate(frame, [14, 80], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        width: 1300,
        height: 760,
        background: "#f9f9f9",
        display: "flex",
        fontFamily: outfitFamily,
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          background: "#ffffff",
          borderRight: "1px solid #e8e8e8",
          padding: "24px 18px",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: "#111111", marginBottom: 30, letterSpacing: "0.04em" }}>GISOMNI</div>
        {["Dashboard", "Analytics", "AI Chat", "Reports", "Settings"].map((item, i) => (
          <div
            key={item}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: spaceGroteskFamily,
              color: i === 0 ? "#111111" : "#888888",
              background: i === 0 ? "#f0f0f0" : "transparent",
              fontWeight: i === 0 ? 600 : 400,
              marginBottom: 4,
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "28px 36px" }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: "#111111", marginBottom: 24 }}>Analytics Dashboard</div>

        {/* KPI Row */}
        <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>
          {kpis.map((kpi, i) => {
            const countUp = Math.round(interpolate(frame, [14 + i * 6, 70 + i * 6], [0, kpi.value], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }));
            return (
              <div
                key={kpi.label}
                style={{
                  flex: 1,
                  background: "#ffffff",
                  border: "1px solid #e8e8e8",
                  borderRadius: 12,
                  padding: "20px 24px",
                }}
              >
                <div style={{ fontFamily: spaceGroteskFamily, fontSize: 12, color: "#aaaaaa", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: 32, fontWeight: 600, color: kpi.color }}>
                  {countUp.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart area */}
        <div style={{ display: "flex", gap: 20 }}>
          <div
            style={{
              flex: 2,
              background: "#ffffff",
              border: "1px solid #e8e8e8",
              borderRadius: 12,
              padding: "24px",
              height: 300,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ fontFamily: spaceGroteskFamily, fontSize: 12, color: "#aaaaaa", marginBottom: 16, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
              Trend Analysis
            </div>
            <svg width="100%" height="220" viewBox="0 0 600 200">
              <path
                d="M 0 160 Q 60 140 120 120 T 240 90 T 360 60 T 480 40 T 600 20"
                fill="none"
                stroke="#111111"
                strokeWidth={2.5}
                strokeDasharray={600}
                strokeDashoffset={600 - chartProgress * 6}
                strokeLinecap="round"
              />
              <path
                d="M 0 170 Q 80 155 160 140 T 320 110 T 480 85 T 600 60"
                fill="none"
                stroke="#bbbbbb"
                strokeWidth={1.5}
                strokeDasharray={600}
                strokeDashoffset={600 - chartProgress * 6}
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* AI Panel */}
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              border: "1px solid #e8e8e8",
              borderRadius: 12,
              padding: "24px",
              height: 300,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontFamily: spaceGroteskFamily, fontSize: 12, color: "#aaaaaa", marginBottom: 16, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
              AI Insights
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div
                id="ai-prompt-chip"
                style={{
                  padding: "10px 16px",
                  background: "#f5f5f5",
                  borderRadius: 8,
                  fontFamily: spaceGroteskFamily,
                  fontSize: 13,
                  color: "#888888",
                  border: "1px solid #e0e0e0",
                }}
              >
                Ask AI about community trends...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
