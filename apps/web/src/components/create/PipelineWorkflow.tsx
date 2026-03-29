import { Link } from "react-router-dom";
import "../../styles/create-pipeline.css";

export type PipelineStepIndex = 0 | 1 | 2 | 3;

const STEPS: {
  id: PipelineStepIndex;
  title: string;
  subtitle: string;
  path: string;
}[] = [
  {
    id: 0,
    title: "Capture & brief",
    subtitle: "URL, vision, effects",
    path: "/create",
  },
  {
    id: 1,
    title: "Generate prompts",
    subtitle: "Agent → ideas & prompt.md",
    path: "/create/generate",
  },
  {
    id: 2,
    title: "Remotion code",
    subtitle: "Agent + render",
    path: "/create/remotion",
  },
  {
    id: 3,
    title: "Preview",
    subtitle: "Watch MP4",
    path: "/create/video",
  },
];

export type PipelineWorkflowProps = {
  /** Current step (0–3). */
  activeStep: PipelineStepIndex;
  /** Animates the connector *after* this step (0 = edge from step 1 → 2 area). Use while that stage is working toward the next. */
  loadingEdgeAfter?: PipelineStepIndex | null;
};

function Connector({
  fromStep,
  loading,
}: {
  fromStep: PipelineStepIndex;
  loading: boolean;
}) {
  const id = `pipeline-edge-${fromStep}`;
  return (
    <div
      className={
        "pipeline-connector" + (loading ? " pipeline-connector--loading" : "")
      }
      aria-hidden="true"
    >
      <svg
        className="pipeline-connector__svg"
        viewBox="0 0 120 32"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-rose-deep)" stopOpacity="0.35" />
            <stop offset="50%" stopColor="var(--color-rose)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-rose-deep)" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path
          className="pipeline-connector__path pipeline-connector__path--base"
          d="M 0 16 C 40 4, 80 28, 120 16"
          fill="none"
          stroke={`url(#${id}-g)`}
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <path
          className="pipeline-connector__path pipeline-connector__path--glow"
          d="M 0 16 C 40 4, 80 28, 120 16"
          fill="none"
          stroke="var(--color-rose)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.2"
        />
        {loading ? (
          <path
            className="pipeline-connector__path pipeline-connector__path--dash"
            d="M 0 16 C 40 4, 80 28, 120 16"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="8 14"
          />
        ) : null}
      </svg>
    </div>
  );
}

export function PipelineWorkflow({
  activeStep,
  loadingEdgeAfter = null,
}: PipelineWorkflowProps) {
  return (
    <nav
      className="pipeline"
      aria-label="Video production pipeline"
      data-active-step={activeStep}
    >
      <ol className="pipeline__list">
        {STEPS.map((step, index) => {
          const isActive = step.id === activeStep;
          const isDone = step.id < activeStep;
          const isLast = index === STEPS.length - 1;

          const nodeBody = (
            <>
              <span className="pipeline-node__ring" aria-hidden="true" />
              <span className="pipeline-node__index">{step.id + 1}</span>
              <span className="pipeline-node__text">
                <span className="pipeline-node__title">{step.title}</span>
                <span className="pipeline-node__sub">{step.subtitle}</span>
              </span>
            </>
          );

          const className =
            "pipeline-node" +
            (isActive ? " pipeline-node--active" : "") +
            (isDone ? " pipeline-node--done" : "") +
            (!isActive && !isDone ? " pipeline-node--todo" : "");

          /** Preview has no stable URL without render state — don’t link forward to it from the strip. */
          const canLinkBack = isDone && step.id !== 3;
          const inner =
            canLinkBack ? (
              <Link className={className} to={step.path}>
                {nodeBody}
              </Link>
            ) : (
              <div
                className={className}
                {...(isActive ? { "aria-current": "step" as const } : {})}
              >
                {nodeBody}
              </div>
            );

          return (
            <li key={step.id} className="pipeline__item">
              {inner}
              {!isLast ? (
                <Connector
                  fromStep={step.id}
                  loading={loadingEdgeAfter === step.id}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
