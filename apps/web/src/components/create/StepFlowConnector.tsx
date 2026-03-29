import { useId } from "react";

/** Curly vertical connector between brief steps (same spirit as pipeline bezier). Light runs along the path when `animateToken` changes. */

type StepFlowConnectorProps = {
  /** Change to replay the “light through the wire” animation (0 = idle). */
  animateToken: number;
};

/** Smooth S-curve downward (cubic bezier), similar horizontal feel to pipeline `C` curves. */
const CURVE_D = "M 24 1.5 C 8 11, 40 29, 24 42.5";

export function StepFlowConnector({ animateToken }: StepFlowConnectorProps) {
  const safeId = useId().replace(/:/g, "");
  const gradId = `sf-grad-${safeId}`;
  const glowId = `sf-glow-${safeId}`;

  return (
    <div className="step-flow-connector" aria-hidden="true">
      <svg
        className="step-flow-connector__svg"
        viewBox="0 0 48 44"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor="var(--color-rose-deep)"
              stopOpacity="0.35"
            />
            <stop
              offset="50%"
              stopColor="var(--color-rose)"
              stopOpacity="0.75"
            />
            <stop
              offset="100%"
              stopColor="var(--color-rose-deep)"
              stopOpacity="0.4"
            />
          </linearGradient>
          <linearGradient id={glowId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="var(--color-rose)" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {/* Soft glow under the wire */}
        <path
          d={CURVE_D}
          fill="none"
          stroke="var(--color-rose)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity={0.12}
        />
        {/* Base wire */}
        <path
          d={CURVE_D}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2.35"
          strokeLinecap="round"
          className="step-flow-connector__wire-path"
        />
        {/* Traveling light — only when step just completed */}
        {animateToken > 0 ? (
          <path
            key={animateToken}
            d={CURVE_D}
            fill="none"
            stroke={`url(#${glowId})`}
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="20 80"
            className="step-flow-connector__light-path"
          />
        ) : null}
      </svg>
    </div>
  );
}
