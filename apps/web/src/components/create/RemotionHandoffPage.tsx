import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { runRemotionCodingAgent, runRemotionRenderPreview } from "../../lib/agents";
import { extractFlyerBrand } from "../../lib/brand/extractFlyerBrand";
import {
  loadLatestWebsiteComponent,
  loadWebsiteComponentById,
} from "../../lib/storage";
import type { RemotionCodingFile } from "../../types/remotion-coding-artifact";
import type { FlyerBrandTokens } from "../../types/flyer-brand";
import "../../styles/create-brief.css";
import "../../styles/create-video.css";
import { BriefCollapsible } from "./BriefCollapsible";
import { CreateFlowStageBanner } from "./CreateFlowStageBanner";
import { PipelineWorkflow } from "./PipelineWorkflow";
import { StepFlowConnector } from "./StepFlowConnector";

type LocationState = {
  websiteBundleId?: string;
  promptMd?: string;
  voiceMd?: string;
  soundMd?: string;
  flyerBrand?: FlyerBrandTokens;
};

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function safeFilename(path: string): string {
  return path.replace(/^packages\/remotion\//, "").replace(/\//g, "__");
}

/** Remotion step: run server agent with vendored skill + prompt.md → proposed package files. */
export function RemotionHandoffPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const s = (location.state as LocationState | null) ?? null;

  const [promptMd, setPromptMd] = useState(s?.promptMd ?? "");
  const [voiceMd, setVoiceMd] = useState(s?.voiceMd ?? "");
  const [soundMd, setSoundMd] = useState(s?.soundMd ?? "");
  const [includeVideo, setIncludeVideo] = useState(true);
  const [includeAudio, setIncludeAudio] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [compositionId, setCompositionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [renderSuggestion, setRenderSuggestion] = useState<string | null>(null);
  const [files, setFiles] = useState<RemotionCodingFile[] | null>(null);

  const [renderBusy, setRenderBusy] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  /** Expand “Review output” when the agent returns anything useful */
  const [reviewOpen, setReviewOpen] = useState(false);

  /** Resolved from navigation (Create → Generate) or re-loaded from the saved website bundle */
  const [flyerBrand, setFlyerBrand] = useState<FlyerBrandTokens | null>(null);
  const [brandLoadError, setBrandLoadError] = useState<string | null>(null);

  useEffect(() => {
    const st = (location.state as LocationState | null) ?? null;
    if (st?.promptMd !== undefined) setPromptMd(st.promptMd);
    if (st?.voiceMd !== undefined) setVoiceMd(st.voiceMd);
    if (st?.soundMd !== undefined) setSoundMd(st.soundMd);
  }, [location.state]);

  useEffect(() => {
    setBrandLoadError(null);
    const st = (location.state as LocationState | null) ?? null;
    if (st?.flyerBrand) {
      setFlyerBrand(st.flyerBrand);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const bid = st?.websiteBundleId;
        const bundle = bid
          ? await loadWebsiteComponentById(bid)
          : await loadLatestWebsiteComponent();
        if (cancelled) return;
        if (!bundle) {
          setFlyerBrand(null);
          if (bid) {
            setBrandLoadError(
              `Bundle id "${bid}" not found in this browser — re-capture on Create or continue (Remotion will use default brand).`
            );
          }
          return;
        }
        setFlyerBrand(
          extractFlyerBrand({
            html: bundle.site.html,
            css: bundle.site.css,
            pageUrl: bundle.pageUrl,
            computedSnapshots: bundle.computedSnapshots,
          })
        );
      } catch {
        if (!cancelled) {
          setFlyerBrand(null);
          setBrandLoadError("Could not load brand from saved bundle.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.state]);

  useEffect(() => {
    const hasOutput =
      Boolean(summary) ||
      Boolean(notes) ||
      Boolean(renderSuggestion) ||
      Boolean(files?.length);
    if (hasOutput) setReviewOpen(true);
    else setReviewOpen(false);
  }, [summary, notes, renderSuggestion, files]);

  async function handleRunAgent() {
    setError(null);
    setModel(null);
    setCompositionId(null);
    setSummary(null);
    setNotes(null);
    setRenderSuggestion(null);
    setFiles(null);
    setRenderError(null);
    if (!promptMd.trim()) {
      setError("Add a prompt (production brief) first.");
      return;
    }
    setBusy(true);
    try {
      const res = await runRemotionCodingAgent({
        promptMd,
        voiceMd: voiceMd || undefined,
        soundMd: soundMd || undefined,
        includeVideo,
        includeAudio,
      });
      if (!res.ok) {
        const hint = "hint" in res && res.hint ? ` ${res.hint}` : "";
        setError(
          res.code === "missing_openai_key"
            ? `${res.error} Set OPENAI_API_KEY for functions, or use Claude with ANTHROPIC_API_KEY (default when set).`
            : res.code === "missing_anthropic_key"
              ? `${res.error} Set ANTHROPIC_API_KEY, or REMOTION_CODING_AGENT_PROVIDER=openai with OPENAI_API_KEY.`
              : `${res.error}${hint}`
        );
        return;
      }
      setModel(res.model);
      setCompositionId(res.compositionId);
      setSummary(res.summary);
      setNotes(res.notes || null);
      setRenderSuggestion(res.renderSuggestion || null);
      setFiles(res.files);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Request failed — is the functions server running?"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRenderAndPreview() {
    setRenderError(null);
    if (!files?.length || !compositionId) {
      setRenderError("Run the coding agent first so files and compositionId are available.");
      return;
    }
    setRenderBusy(true);
    try {
      const res = await runRemotionRenderPreview({
        files,
        compositionId,
        soundMd: includeAudio && soundMd ? soundMd : undefined,
        voiceMd: includeAudio && voiceMd ? voiceMd : undefined,
        ...(flyerBrand
          ? { inputProps: { flyerBrand } }
          : {}),
      });
      if (!res.ok) {
        const hint = res.hint ? ` ${res.hint}` : "";
        setRenderError(
          res.code === "local_repo_required"
            ? `${res.error} This flow needs \`npm run dev\` at the monorepo root (not a hosted Netlify-only deploy).`
            : `${res.error}${hint}`
        );
        return;
      }
      navigate("/create/video", {
        state: {
          videoUrl: res.videoUrl,
          compositionId: res.compositionId,
          websiteBundleId: s?.websiteBundleId,
          audioWarnings: res.audioWarnings,
        },
      });
    } catch (e) {
      setRenderError(
        e instanceof Error ? e.message : "Render request failed — is the functions server running?"
      );
    } finally {
      setRenderBusy(false);
    }
  }

  return (
    <>
      <div className="create-flow__wash create-flow__wash--tr" aria-hidden="true" />
      <div className="create-flow__wash create-flow__wash--bl" aria-hidden="true" />

      <div className="create-flow create-flow--with-pipeline">
        <div className="create-flow__toolbar">
          <button
            type="button"
            className="create-flow__back"
            onClick={() => navigate("/create/generate")}
          >
            ← Back to generating agent
          </button>
        </div>

        <PipelineWorkflow
          activeStep={2}
          loadingEdgeAfter={busy || renderBusy ? 2 : null}
        />

        <CreateFlowStageBanner step={2} />

        <div className="create-card create-brief-card">
          <h1 className="create-card__title">Remotion coding agent</h1>
          <p className="create-brief-lede">
            The server uses your <strong>prompt.md</strong> plus the vendored skill under{" "}
            <code className="create-card__code">agent-context/remotion/</code> and returns proposed
            files in <code className="create-card__code">packages/remotion/</code>. Run the agent
            first, then apply and render locally for the MP4.
          </p>

          {s?.websiteBundleId ? (
            <p className="create-bundle-meta">
              <strong>Bundle id:</strong> <code>{s.websiteBundleId}</code>
            </p>
          ) : (
            <p className="create-card__note">
              No bundle id in navigation state — you can still run the agent if the prompt below is
              filled in. Prefer arriving via{" "}
              <Link to="/create/generate">Generating agent</Link> → Continue.
            </p>
          )}

          {brandLoadError ? (
            <div
              className="create-capture-result create-capture-result--error"
              role="status"
            >
              <p className="create-capture-result__title">Brand for video</p>
              {brandLoadError}
            </div>
          ) : null}

          {flyerBrand ? (
            <div className="create-capture-result">
              <p className="create-capture-result__title">
                Video will use your captured site brand
              </p>
              <p className="create-card__note" style={{ marginTop: "0.35rem" }}>
                Colors and logo are inferred from the HTML/CSS you saved on{" "}
                <Link to="/create">Create</Link> and passed into Remotion as{" "}
                <code className="create-card__code">inputProps.flyerBrand</code> on{" "}
                <strong>Apply files &amp; render video</strong> (full composition, no frame cap).
              </p>
              <p className="create-bundle-meta" style={{ marginTop: "0.5rem" }}>
                <strong>Product:</strong> {flyerBrand.productName}
                <br />
                <strong>Logo URL:</strong>{" "}
                {flyerBrand.logoUrl ? (
                  <a
                    href={flyerBrand.logoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="create-capture-result__link"
                  >
                    open
                  </a>
                ) : (
                  "— (fallback: packages/remotion/public/logo.png)"
                )}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: "0.5rem",
                }}
                aria-label="Brand color swatches"
              >
                {(
                  [
                    ["primary", flyerBrand.primary],
                    ["secondary", flyerBrand.secondary],
                    ["accent", flyerBrand.accent],
                    ["background", flyerBrand.background],
                  ] as const
                ).map(([label, hex]) => (
                  <span
                    key={label}
                    title={`${label}: ${hex}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.8rem",
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        background: hex,
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <BriefCollapsible
            title="Run the Remotion coding agent"
            subtitle="Inputs and media options → proposed files under packages/remotion"
            defaultOpen={true}
          >
            <div className="brief-stack brief-stack--tight">
              <p className="brief-muted">
                Adjust <strong>prompt.md</strong> and optional voice/sound, set output options, then
                run the agent.
              </p>
          <fieldset className="create-fieldset">
            <legend className="create-legend">Inputs (editable)</legend>
            <label className="create-label" htmlFor="remotion-prompt">
              prompt.md — production brief for Remotion
            </label>
            <textarea
              id="remotion-prompt"
              className="create-nav-preview"
              style={{ minHeight: "12rem", maxHeight: "min(40vh, 22rem)" }}
              value={promptMd}
              onChange={(e) => setPromptMd(e.target.value)}
              spellCheck={true}
              placeholder="# Remotion production brief…"
            />
            <label className="create-label" htmlFor="remotion-voice">
              voice.md (optional)
            </label>
            <textarea
              id="remotion-voice"
              className="create-textarea"
              style={{ minHeight: "6rem" }}
              value={voiceMd}
              onChange={(e) => setVoiceMd(e.target.value)}
            />
            <label className="create-label" htmlFor="remotion-sound">
              sound.md (optional)
            </label>
            <textarea
              id="remotion-sound"
              className="create-textarea"
              style={{ minHeight: "6rem" }}
              value={soundMd}
              onChange={(e) => setSoundMd(e.target.value)}
            />
            <p className="create-card__note create-card__note--spaced">
              Output media (the agent will follow these for generated code; you still run{" "}
              <code className="create-card__code">remotion render</code> locally)
            </p>
            <label className="create-effect">
              <input
                type="checkbox"
                checked={includeVideo}
                onChange={() => setIncludeVideo((v) => !v)}
              />
              <span className="create-effect__text">
                <span className="create-effect__label">Include embedded video layers</span>
                <p className="create-effect__desc">
                  Off = no <code className="create-card__code">&lt;Video&gt;</code> / clip playback;
                  motion graphics, images, and text only.
                </p>
              </span>
            </label>
            <label className="create-effect">
              <input
                type="checkbox"
                checked={includeAudio}
                onChange={() => setIncludeAudio((v) => !v)}
              />
              <span className="create-effect__text">
                <span className="create-effect__label">Include audio (voice / SFX)</span>
                <p className="create-effect__desc">
                  Off = silent composition; voice.md / sound.md are not wired into{" "}
                  <code className="create-card__code">&lt;Audio&gt;</code>.
                </p>
              </span>
            </label>
          </fieldset>

          <div className="create-capture-actions">
            <button
              type="button"
              className="create-capture-btn create-capture-btn--primary"
              disabled={busy || !promptMd.trim()}
              onClick={() => void handleRunAgent()}
            >
              {busy ? "Running Remotion coding agent…" : "Run Remotion coding agent"}
            </button>
          </div>

          {error ? (
            <div
              className="create-capture-result create-capture-result--error"
              role="alert"
            >
              <p className="create-capture-result__title">Agent error</p>
              {error}
            </div>
          ) : null}

          {model ? (
            <p className="create-card__note">
              Model: <code className="create-card__code">{model}</code>
            </p>
          ) : null}
            </div>
          </BriefCollapsible>

          <StepFlowConnector animateToken={0} />

          <BriefCollapsible
            title="Review output & render"
            subtitle="Summary, files, then apply and render locally for the MP4"
            open={reviewOpen}
            onOpenChange={setReviewOpen}
          >
            <div className="brief-stack brief-stack--tight">
          {!summary && !notes && !renderSuggestion && !files?.length ? (
            <p className="create-card__note">
              Run the coding agent above to see a summary, notes, and proposed files.
            </p>
          ) : null}

          {summary ? (
            <fieldset className="create-fieldset">
              <legend className="create-legend">Summary</legend>
              <p className="create-card__subtitle" style={{ marginTop: 0 }}>
                {summary}
              </p>
            </fieldset>
          ) : null}

          {notes ? (
            <fieldset className="create-fieldset">
              <legend className="create-legend">Notes</legend>
              <pre className="create-nav-preview" style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {notes}
              </pre>
            </fieldset>
          ) : null}

          {renderSuggestion ? (
            <fieldset className="create-fieldset">
              <legend className="create-legend">Suggested render command</legend>
              <pre className="create-nav-preview" style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {renderSuggestion}
              </pre>
            </fieldset>
          ) : null}

          {files?.length ? (
            <fieldset className="create-fieldset">
              <legend className="create-legend">Proposed files</legend>
              {compositionId ? (
                <p className="create-bundle-meta">
                  <strong>Composition:</strong> <code>{compositionId}</code>
                </p>
              ) : null}
              <p className="create-card__note">
                Click below to apply the agent&apos;s files and render{" "}
                <code className="create-card__code">{compositionId}</code> to{" "}
                <code className="create-card__code">apps/web/public/renders/latest.mp4</code>.
                {flyerBrand
                  ? " Your captured brand tokens are sent as input props."
                  : ""}
              </p>
              <div className="create-capture-actions">
                <button
                  type="button"
                  className="create-capture-btn create-capture-btn--primary"
                  disabled={renderBusy || !compositionId}
                  onClick={() => void handleRenderAndPreview()}
                >
                  {renderBusy
                    ? "Rendering video (may take a few minutes)…"
                    : "Apply files & render video"}
                </button>
              </div>
              {renderError ? (
                <div
                  className="create-capture-result create-capture-result--error"
                  role="alert"
                >
                  <p className="create-capture-result__title">Render error</p>
                  <pre
                    className="create-nav-preview"
                    style={{
                      margin: "0.5rem 0 0",
                      whiteSpace: "pre-wrap",
                      maxHeight: "12rem",
                      fontSize: "0.75rem",
                    }}
                  >
                    {renderError}
                  </pre>
                </div>
              ) : null}
              {files.map((f) => (
                <details key={f.path} className="create-remotion-file">
                  <summary className="create-remotion-file__summary">
                    <code>{f.path}</code>
                    <button
                      type="button"
                      className="create-capture-result__link"
                      style={{ marginLeft: "0.75rem" }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadText(f.content, safeFilename(f.path));
                      }}
                    >
                      Download
                    </button>
                  </summary>
                  <pre className="create-nav-preview create-remotion-file__pre">{f.content}</pre>
                </details>
              ))}
            </fieldset>
          ) : null}
            </div>
          </BriefCollapsible>
        </div>
      </div>
    </>
  );
}
