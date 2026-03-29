import type { PipelineStepIndex } from "./PipelineWorkflow";

const COPY: Record<PipelineStepIndex, { kicker: string; body: string }> = {
  0: {
    kicker: "Step 1 of 4 — Capture & brief",
    body: "Save your site, describe vision, pick effects, then mark the step complete when you are ready to generate.",
  },
  1: {
    kicker: "Step 2 of 4 — Generate prompts",
    body: "Run the generating agent first (ideas, voice, sound, and prompt.md). Then review prompt.md and continue to Remotion.",
  },
  2: {
    kicker: "Step 3 of 4 — Remotion code",
    body: "Confirm inputs, run the coding agent, then apply files and render locally to write the MP4.",
  },
  3: {
    kicker: "Step 4 of 4 — Preview",
    body: "Scrub the full render. Use back links or copy the URL if you need to share or iterate.",
  },
};

export type CreateFlowStageBannerProps = {
  step: PipelineStepIndex;
};

export function CreateFlowStageBanner({ step }: CreateFlowStageBannerProps) {
  const { kicker, body } = COPY[step];
  return (
    <div className="create-flow-stage-banner" role="status">
      <p className="create-flow-stage-banner__kicker">{kicker}</p>
      <p className="create-flow-stage-banner__body">{body}</p>
    </div>
  );
}
