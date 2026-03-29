import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import effectsManifest from "@content/promotion-effects/effects.manifest.json";
import { runGeneratingAgent } from "../../lib/agents";
import { extractFlyerBrand } from "../../lib/brand/extractFlyerBrand";
import {
  loadGenerationDraft,
  loadLatestWebsiteComponent,
  saveGenerationDraft,
} from "../../lib/storage";
import type { EffectsManifest } from "../../types/effects-manifest";
import type { GenerationDraft, VideoStyle } from "../../types/generating-artifact";
import type { WebsiteComponentFile } from "../../types/website-artifact";
import "../../styles/create-brief.css";
import "../../styles/create-video.css";
import { BriefCollapsible } from "./BriefCollapsible";
import { PromotionEffectsDisclosure } from "./PromotionEffectsDisclosure";
import { CreateFlowStageBanner } from "./CreateFlowStageBanner";
import { PipelineWorkflow } from "./PipelineWorkflow";
import { StepFlowConnector } from "./StepFlowConnector";

const manifest = effectsManifest as EffectsManifest;

type LocationState = {
  vision?: string;
  videoSpec?: string;
  effectIds?: string[];
};

type TabId = "ideas" | "voice" | "sound";

export function GeneratingAgentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;

  const [bundle, setBundle] = useState<WebsiteComponentFile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [vision, setVision] = useState(state?.vision ?? "");
  const [videoSpec, setVideoSpec] = useState(state?.videoSpec ?? "");
  const [selectedEffects, setSelectedEffects] = useState<Set<string>>(
    () => new Set(state?.effectIds ?? [])
  );
  const [videoStyle, setVideoStyle] = useState<VideoStyle>("default");

  const [tab, setTab] = useState<TabId>("ideas");

  const [ideasMd, setIdeasMd] = useState("");
  const [voiceMd, setVoiceMd] = useState("");
  const [soundMd, setSoundMd] = useState("");
  const [promptMd, setPromptMd] = useState("");

  const [agentBusy, setAgentBusy] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [lastVoiceSoundModel, setLastVoiceSoundModel] = useState<string | null>(null);

  const [draftMessage, setDraftMessage] = useState<string | null>(null);

  const effects = manifest.effects ?? [];

  const effectsCatalog = useMemo(
    () =>
      effects.map((e) => ({
        id: e.id,
        label: e.label,
        description: e.description,
      })),
    [effects]
  );

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    loadLatestWebsiteComponent()
      .then((b) => {
        if (cancelled) return;
        if (!b) {
          setBundle(null);
          setLoadError("No website component in this browser. Capture or upload on Create first.");
          return;
        }
        setBundle(b);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not read saved bundle.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!bundle) return;
    let cancelled = false;
    loadGenerationDraft(bundle.id).then((d) => {
      if (cancelled || !d) return;
      if (d.ideasMd) setIdeasMd(d.ideasMd);
      setVoiceMd(d.voiceMd);
      setSoundMd(d.soundMd);
      setPromptMd(d.promptMd);
    });
    return () => {
      cancelled = true;
    };
  }, [bundle?.id]);

  const toggleEffect = useCallback((id: string) => {
    setSelectedEffects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const persistDraft = useCallback(async () => {
    if (!bundle) return;
    setDraftMessage(null);
    const draft: GenerationDraft = {
      websiteBundleId: bundle.id,
      updatedAt: new Date().toISOString(),
      ideasMd,
      voiceMd,
      soundMd,
      promptMd,
    };
    await saveGenerationDraft(draft);
    setDraftMessage("Saved ideas, voice, sound, and prompt drafts for this bundle.");
  }, [bundle, ideasMd, voiceMd, soundMd, promptMd]);

  async function handleRunAgent() {
    if (!bundle) return;
    setAgentError(null);
    setLastModel(null);
    setLastVoiceSoundModel(null);
    setAgentBusy(true);
    try {
      const res = await runGeneratingAgent({
        websiteComponent: bundle,
        vision,
        videoSpec,
        selectedEffectIds: [...selectedEffects],
        effectsCatalog,
        videoStyle,
      });
      if (!res.ok) {
        const hint = res.hint ? ` ${res.hint}` : "";
        setAgentError(
          res.code === "missing_openai_key"
            ? `${res.error} Set OPENAI_API_KEY (default backend), or use Claude with GENERATING_AGENT_PROVIDER=anthropic and ANTHROPIC_API_KEY.`
            : res.code === "missing_anthropic_key"
              ? `${res.error} Set ANTHROPIC_API_KEY or switch to OpenAI with GENERATING_AGENT_PROVIDER=openai.`
              : `${res.error}${hint}`
        );
        return;
      }
      if (res.ideasMd) setIdeasMd(res.ideasMd);
      setVoiceMd(res.voiceMd);
      setSoundMd(res.soundMd);
      setPromptMd(res.promptMd);
      setLastModel(res.model);
      setLastVoiceSoundModel(
        typeof res.voiceSoundModel === "string" && res.voiceSoundModel.trim()
          ? res.voiceSoundModel.trim()
          : null
      );
      await saveGenerationDraft({
        websiteBundleId: bundle.id,
        updatedAt: new Date().toISOString(),
        ideasMd: res.ideasMd ?? "",
        voiceMd: res.voiceMd,
        soundMd: res.soundMd,
        promptMd: res.promptMd,
      });
      setDraftMessage("Agent finished — drafts saved locally.");
    } catch (e) {
      setAgentError(
        e instanceof Error ? e.message : "Request failed — is the functions server running?"
      );
    } finally {
      setAgentBusy(false);
    }
  }

  const tabLabel: Record<TabId, string> = {
    ideas: "Ideas & script",
    voice: "Voiceover (timed)",
    sound: "Sound design",
  };

  return (
    <>
      <div className="create-flow__wash create-flow__wash--tr" aria-hidden="true" />
      <div className="create-flow__wash create-flow__wash--bl" aria-hidden="true" />

      <div className="create-flow create-flow--with-pipeline">
        <div className="create-flow__toolbar">
          <button
            type="button"
            className="create-flow__back"
            onClick={() => navigate("/create")}
          >
            ← Back to create
          </button>
        </div>

        <PipelineWorkflow
          activeStep={1}
          loadingEdgeAfter={agentBusy ? 1 : null}
        />

        <CreateFlowStageBanner step={1} />

        <div className="create-card create-brief-card">
          <h1 className="create-card__title">Generate prompts for video</h1>
          <p className="create-brief-lede">
            Work top to bottom: run the agent once, then refine <strong>prompt.md</strong> and
            your supporting drafts before the Remotion step.
          </p>

          {loadError ? (
            <div
              className="create-capture-result create-capture-result--error"
              role="alert"
            >
              <p className="create-capture-result__title">Cannot open prompt editor</p>
              {loadError}{" "}
              <Link to="/create" className="create-flow__back" style={{ display: "inline" }}>
                Go to Create
              </Link>
            </div>
          ) : bundle ? (
            <p className="create-bundle-meta">
              <strong>Bundle id:</strong> <code>{bundle.id}</code>
              <br />
              <strong>Source:</strong> {bundle.source}
              {bundle.pageUrl ? (
                <>
                  <br />
                  <strong>URL:</strong> {bundle.pageUrl}
                </>
              ) : null}
            </p>
          ) : (
            <p className="create-card__subtitle">Loading saved bundle…</p>
          )}

          {bundle ? (
            <>
              <BriefCollapsible
                title="Run the generating agent"
                subtitle="Saved site, vision, and effects — outputs for the next step"
                defaultOpen={true}
              >
                <div className="brief-stack brief-stack--tight">
                  <p className="brief-muted">
                    The <strong>generating agent</strong> reads your bundle, brainstorms concepts and
                    a script outline, then writes <strong>ideas.md</strong>,{" "}
                    <strong>voice.md</strong>, <strong>sound.md</strong>, and <strong>prompt.md</strong>.
                    Use the tabs to review the narrative arc and audio specs.
                  </p>

                  <fieldset className="create-fieldset">
                    <legend className="create-legend">Context</legend>
                    <label className="create-label" htmlFor="gen-vision">
                      Video vision (from Create when you used “Generate prompt for video agent”)
                    </label>
                    <textarea
                      id="gen-vision"
                      className="create-textarea"
                      value={vision}
                      onChange={(e) => setVision(e.target.value)}
                      placeholder="Pacing, mood, key screens, voiceover style…"
                    />
                    <label className="create-label create-label--spaced" htmlFor="gen-video-spec">
                      Video length &amp; production spec
                    </label>
                    <textarea
                      id="gen-video-spec"
                      className="create-textarea"
                      value={videoSpec}
                      onChange={(e) => setVideoSpec(e.target.value)}
                      placeholder="Target duration (e.g. 45s, 2 min), FPS, format…"
                    />
                    <label className="create-label create-label--spaced" htmlFor="gen-video-style">
                      Video style
                    </label>
                    <div className="create-effects" style={{ gap: "0.5rem" }}>
                      <label className="create-effect">
                        <input
                          type="radio"
                          name="videoStyle"
                          checked={videoStyle === "default"}
                          onChange={() => setVideoStyle("default")}
                        />
                        <span className="create-effect__text">
                          <span className="create-effect__label">Default</span>
                          <p className="create-effect__desc">
                            Cinematic pacing with smooth transitions and natural timing.
                          </p>
                        </span>
                      </label>
                      <label className="create-effect">
                        <input
                          type="radio"
                          name="videoStyle"
                          checked={videoStyle === "fast-paced"}
                          onChange={() => setVideoStyle("fast-paced")}
                        />
                        <span className="create-effect__text">
                          <span className="create-effect__label">Fast-paced</span>
                          <p className="create-effect__desc">
                            Rapid cuts, constant motion, every second has action. Think launch day
                            hype reels and Product Hunt trailers.
                          </p>
                        </span>
                      </label>
                    </div>

                    <PromotionEffectsDisclosure
                      effects={effects}
                      selectedEffects={selectedEffects}
                      onToggle={toggleEffect}
                    />
                  </fieldset>

                  <div className="create-capture-actions">
                    <button
                      type="button"
                      className="create-capture-btn create-capture-btn--primary"
                      disabled={agentBusy}
                      onClick={() => void handleRunAgent()}
                    >
                      {agentBusy ? "Running generating agent…" : "Run generating agent"}
                    </button>
                  </div>

                  {agentError ? (
                    <div
                      className="create-capture-result create-capture-result--error"
                      role="alert"
                    >
                      <p className="create-capture-result__title">Agent error</p>
                      {agentError}
                    </div>
                  ) : null}

                  {lastModel ? (
                    <p className="create-card__note">
                      Last models: visual / ideas + prompt{" "}
                      <code className="create-card__code">{lastModel}</code>
                      {lastVoiceSoundModel ? (
                        <>
                          {" "}
                          · voice + sound{" "}
                          <code className="create-card__code">{lastVoiceSoundModel}</code>
                        </>
                      ) : null}
                    </p>
                  ) : null}

                  <fieldset className="create-fieldset">
                    <legend className="create-legend">Ideas, voice & sound (editable)</legend>
                    <div className="create-gen-tabs" role="tablist" aria-label="Supporting markdown">
                      {(["ideas", "voice", "sound"] as const).map((id) => (
                        <button
                          key={id}
                          type="button"
                          role="tab"
                          aria-selected={tab === id}
                          className={
                            tab === id
                              ? "create-gen-tab create-gen-tab--active"
                              : "create-gen-tab"
                          }
                          onClick={() => setTab(id)}
                        >
                          {tabLabel[id]}
                        </button>
                      ))}
                    </div>
                    {tab === "ideas" ? (
                      <>
                        <label className="create-label" htmlFor="out-ideas">
                          ideas.md — video concept, narrative arc & script outline
                        </label>
                        <textarea
                          id="out-ideas"
                          className="create-nav-preview"
                          style={{ minHeight: "14rem" }}
                          value={ideasMd}
                          onChange={(e) => setIdeasMd(e.target.value)}
                          spellCheck={true}
                          placeholder="The agent will brainstorm video concepts, key selling points, narrative arc, and script ideas here…"
                        />
                      </>
                    ) : null}
                    {tab === "voice" ? (
                      <>
                        <label className="create-label" htmlFor="out-voice">
                          voice.md
                        </label>
                        <textarea
                          id="out-voice"
                          className="create-nav-preview"
                          style={{ minHeight: "14rem" }}
                          value={voiceMd}
                          onChange={(e) => setVoiceMd(e.target.value)}
                          spellCheck={true}
                        />
                      </>
                    ) : null}
                    {tab === "sound" ? (
                      <>
                        <label className="create-label" htmlFor="out-sound">
                          sound.md
                        </label>
                        <textarea
                          id="out-sound"
                          className="create-nav-preview"
                          style={{ minHeight: "14rem" }}
                          value={soundMd}
                          onChange={(e) => setSoundMd(e.target.value)}
                          spellCheck={true}
                        />
                      </>
                    ) : null}
                  </fieldset>
                </div>
              </BriefCollapsible>

              <StepFlowConnector animateToken={0} />

              <BriefCollapsible
                title="Edit prompt.md & continue"
                subtitle="Refine the brief, save drafts, then open the Remotion step"
                defaultOpen={false}
              >
                <div className="brief-stack brief-stack--tight">
                  <p className="brief-muted">
                    Edit <strong>prompt.md</strong> for the coding agent; drafts stay in this browser
                    until you continue.
                  </p>
                  <label className="create-label" htmlFor="prompt-md-main">
                    prompt.md — edit freely
                  </label>
                  <textarea
                    id="prompt-md-main"
                    className="create-nav-preview"
                    style={{ minHeight: "22rem", maxHeight: "min(50vh, 28rem)" }}
                    value={promptMd}
                    onChange={(e) => setPromptMd(e.target.value)}
                    spellCheck={true}
                    placeholder="Run the generating agent above, or paste a prompt…"
                  />

                  <div className="create-capture-actions">
                    <button
                      type="button"
                      className="create-capture-btn create-capture-btn--primary"
                      disabled={!promptMd.trim()}
                      onClick={() =>
                        navigate("/create/remotion", {
                          state: {
                            websiteBundleId: bundle.id,
                            promptMd,
                            voiceMd,
                            soundMd,
                            flyerBrand: extractFlyerBrand({
                              html: bundle.site.html,
                              css: bundle.site.css,
                              pageUrl: bundle.pageUrl,
                              computedSnapshots: bundle.computedSnapshots,
                            }),
                          },
                        })
                      }
                    >
                      Continue to Remotion agent
                    </button>
                    <button
                      type="button"
                      className="create-capture-btn"
                      disabled={agentBusy}
                      onClick={() => void persistDraft()}
                    >
                      Save drafts locally
                    </button>
                  </div>
                  {!promptMd.trim() ? (
                    <p className="create-hint">
                      Fill prompt.md from the step above, or paste your own brief.
                    </p>
                  ) : (
                    <p className="create-hint">
                      After Remotion code and local render, you will land on the video preview page.
                    </p>
                  )}

                  {draftMessage ? (
                    <div className="create-capture-result">
                      <p className="create-capture-result__title">Drafts</p>
                      {draftMessage}
                    </div>
                  ) : null}
                </div>
              </BriefCollapsible>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
