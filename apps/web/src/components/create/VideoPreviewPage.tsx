import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/create-brief.css";
import "../../styles/create-video.css";
import { BriefCollapsible } from "./BriefCollapsible";
import { CreateFlowStageBanner } from "./CreateFlowStageBanner";
import { PipelineWorkflow } from "./PipelineWorkflow";
import { StepFlowConnector } from "./StepFlowConnector";

export type VideoPreviewLocationState = {
  videoUrl: string;
  compositionId?: string;
  websiteBundleId?: string;
  /** Post-render TTS / mux issues from `remotion-render-preview` (e.g. ElevenLabs quota, missing voice_md rows). */
  audioWarnings?: string[];
};

/** Plays the MP4 written by `remotion-render-preview` into `apps/web/public/renders/latest.mp4`. */
export function VideoPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const s = (location.state as VideoPreviewLocationState | null) ?? null;
  const [cacheBust] = useState(() => Date.now());

  const src = s?.videoUrl
    ? `${s.videoUrl}${s.videoUrl.includes("?") ? "&" : "?"}t=${cacheBust}`
    : null;

  const fullVideoUrl =
    typeof window !== "undefined" && src ? `${window.location.origin}${src}` : null;

  return (
    <>
      <div className="create-flow__wash create-flow__wash--tr" aria-hidden="true" />
      <div className="create-flow__wash create-flow__wash--bl" aria-hidden="true" />

      <div className="create-flow create-flow--with-pipeline">
        <div className="create-flow__toolbar">
          <button
            type="button"
            className="create-flow__back"
            onClick={() => navigate("/create/remotion")}
          >
            ← Back to Remotion agent
          </button>
        </div>

        <PipelineWorkflow activeStep={3} />

        <CreateFlowStageBanner step={3} />

        <div className="create-card create-brief-card">
          <h1 className="create-card__title">Your video</h1>
          <p className="create-brief-lede">
            Full-length MP4 from the last run (entire composition — no frame cap). File:{" "}
            <code className="create-card__code">apps/web/public/renders/latest.mp4</code>{" "}
            (gitignored). Use the timeline and controls to scrub the whole video.
          </p>

          <BriefCollapsible
            title="Playback"
            subtitle="Scrub the full composition in the browser"
            defaultOpen={true}
          >
            <div className="brief-stack brief-stack--tight">
              {src ? (
                <div className="create-video-frame">
                  <video
                    className="create-video-player"
                    src={src}
                    controls
                    playsInline
                    preload="auto"
                  >
                    Your browser does not support embedded video.
                  </video>
                </div>
              ) : (
                <p className="brief-muted">
                  No video URL yet. From the Remotion coding agent page, run{" "}
                  <strong>Apply files &amp; render video</strong> after a successful code generation
                  (local dev only).
                </p>
              )}
            </div>
          </BriefCollapsible>

          <StepFlowConnector animateToken={0} />

          <BriefCollapsible
            title="Render details & audio"
            subtitle="Composition id, shareable link, and voiceover notices"
            defaultOpen={false}
          >
            <div className="brief-stack brief-stack--tight">
            {s?.compositionId ? (
              <p className="create-bundle-meta">
                <strong>Composition:</strong> <code>{s.compositionId}</code>
                {s.websiteBundleId ? (
                  <>
                    <br />
                    <strong>Bundle id:</strong> <code>{s.websiteBundleId}</code>
                  </>
                ) : null}
              </p>
            ) : null}

            {s?.audioWarnings && s.audioWarnings.length > 0 ? (
              <div
                className="create-capture-result create-capture-result--error"
                role="alert"
                style={{ marginBottom: "1rem" }}
              >
                <p className="create-capture-result__title">Voiceover / audio</p>
                <ul style={{ margin: "0.35rem 0 0 1rem", padding: 0 }}>
                  {s.audioWarnings.map((w, idx) => (
                    <li key={idx} style={{ marginBottom: "0.35rem" }}>
                      {w}
                    </li>
                  ))}
                </ul>
                <p className="create-card__note" style={{ marginTop: "0.5rem" }}>
                  For ElevenLabs: set <code className="create-card__code">ELEVENLABS_API_KEY</code> in
                  repo <code className="create-card__code">.env</code> (local) or Netlify environment
                  variables (deployed). If the key is wrong or you are out of quota, the pipeline can
                  fall back to OpenAI speech when{" "}
                  <code className="create-card__code">OPENAI_API_KEY</code> is also set. Ensure{" "}
                  <strong>Include voiceover in render</strong> is on and{" "}
                  <code className="create-card__code">voice_md</code> is present from the generating
                  agent.
                </p>
              </div>
            ) : null}

            {fullVideoUrl ? (
              <p className="create-bundle-meta">
                <strong>Full video link:</strong>{" "}
                <a
                  href={fullVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="create-card__code"
                  style={{ wordBreak: "break-all" }}
                >
                  {fullVideoUrl}
                </a>
              </p>
            ) : null}
            </div>
          </BriefCollapsible>
        </div>
      </div>
    </>
  );
}
