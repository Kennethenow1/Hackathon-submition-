import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import effectsManifest from "@content/promotion-effects/effects.manifest.json";
import { captureRendered, captureStatic } from "../../lib/capture/client";
import {
  bundleFromRenderedCapture,
  bundleFromStaticCapture,
  bundleFromUpload,
  clearLatestWebsiteComponent,
  loadLatestWebsiteComponent,
  saveWebsiteComponent,
} from "../../lib/storage";
import type { EffectsManifest } from "../../types/effects-manifest";
import type { RenderedCaptureResponse, StaticCaptureResponse } from "../../types/capture";
import { extractFlyerBrand } from "../../lib/brand/extractFlyerBrand";
import type { WebsiteComponentFile } from "../../types/website-artifact";
import "../../styles/create-video.css";
import "../../styles/create-brief.css";
import { BriefCollapsible } from "./BriefCollapsible";
import { BriefStepFooter } from "./BriefStepFooter";
import { PromotionEffectsDisclosure } from "./PromotionEffectsDisclosure";
import { NavigationMdView } from "./NavigationMdView";
import { CreateFlowStageBanner } from "./CreateFlowStageBanner";
import { PipelineWorkflow } from "./PipelineWorkflow";
import { StepFlowConnector } from "./StepFlowConnector";

type SourceMode = "link" | "files";

type CaptureKind = "static" | "rendered" | null;

const manifest = effectsManifest as EffectsManifest;

type BriefStepId = "capture" | "bundle" | "vision" | "effects";

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function persistBundle(bundle: WebsiteComponentFile): Promise<void> {
  try {
    await saveWebsiteComponent(bundle);
  } catch (e) {
    const name = e instanceof DOMException ? e.name : "";
    if (name === "QuotaExceededError") {
      throw new Error(
        "Browser storage quota exceeded — try a smaller page or download JSON only."
      );
    }
    throw e;
  }
}

export function CreateVideoPage() {
  const navigate = useNavigate();
  const [sourceMode, setSourceMode] = useState<SourceMode>("link");
  const [pageUrl, setPageUrl] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [cssFile, setCssFile] = useState<File | null>(null);
  const [jsFile, setJsFile] = useState<File | null>(null);
  const [vision, setVision] = useState("");
  const [videoSpec, setVideoSpec] = useState("");
  const [selectedEffects, setSelectedEffects] = useState<Set<string>>(
    () => new Set()
  );

  const [captureBusy, setCaptureBusy] = useState<CaptureKind>(null);
  const [captureMessage, setCaptureMessage] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const lastCaptureRef = useRef<StaticCaptureResponse | RenderedCaptureResponse | null>(
    null
  );

  const [websiteBundle, setWebsiteBundle] = useState<WebsiteComponentFile | null>(
    null
  );
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [fileProcessBusy, setFileProcessBusy] = useState(false);

  /** Collapsible open state — all start closed */
  const [captureOpen, setCaptureOpen] = useState(true);
  const [bundleOpen, setBundleOpen] = useState(false);
  const [visionOpen, setVisionOpen] = useState(false);
  const [effectsOpen, setEffectsOpen] = useState(false);

  /** Sticky “done” flags for palette highlight + auto-collapse */
  const [stepDone, setStepDone] = useState({
    capture: false,
    bundle: false,
    vision: false,
    effects: false,
  });

  /** Drives the “electricity” animation on the connector after this step */
  const [flowPulse, setFlowPulse] = useState<{ step: BriefStepId; token: number } | null>(
    null
  );

  const effects = manifest.effects ?? [];

  function markStepComplete(step: BriefStepId) {
    setStepDone((d) => ({ ...d, [step]: true }));
  }

  const videoBrandPreview = useMemo(() => {
    if (!websiteBundle) return null;
    return extractFlyerBrand({
      html: websiteBundle.site.html,
      css: websiteBundle.site.css,
      pageUrl: websiteBundle.pageUrl,
      computedSnapshots: websiteBundle.computedSnapshots,
    });
  }, [websiteBundle]);

  useEffect(() => {
    let cancelled = false;
    loadLatestWebsiteComponent()
      .then((b) => {
        if (!cancelled && b) {
          setWebsiteBundle(b);
          setStorageMessage("Restored last saved website component from this browser.");
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Step “done” is only from explicit “Mark step complete” — not inferred from saved bundle (fixes refresh showing step 1 complete). */
  useEffect(() => {
    if (!websiteBundle) {
      setStepDone({
        capture: false,
        bundle: false,
        vision: false,
        effects: false,
      });
    }
  }, [websiteBundle]);

  const prevStepDoneRef = useRef({
    capture: false,
    bundle: false,
    vision: false,
    effects: false,
  });

  useEffect(() => {
    const p = prevStepDoneRef.current;
    const token = Date.now();
    let pulseStep: BriefStepId | null = null;

    if (stepDone.capture && !p.capture) {
      setCaptureOpen(false);
      pulseStep = "capture";
    }
    if (stepDone.bundle && !p.bundle) {
      setBundleOpen(false);
      pulseStep = pulseStep ?? "bundle";
    }
    if (stepDone.vision && !p.vision) {
      setVisionOpen(false);
      pulseStep = pulseStep ?? "vision";
    }
    if (stepDone.effects && !p.effects) {
      setEffectsOpen(false);
      pulseStep = pulseStep ?? "effects";
    }

    if (pulseStep) setFlowPulse({ step: pulseStep, token });
    prevStepDoneRef.current = { ...stepDone };
  }, [stepDone]);

  function toggleEffect(id: string) {
    setSelectedEffects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function parseUrl(raw: string): URL | null {
    const t = raw.trim();
    if (!t) return null;
    try {
      return new URL(t);
    } catch {
      try {
        return new URL(`https://${t}`);
      } catch {
        return null;
      }
    }
  }

  async function storeCaptureAsBundle(
    res: Extract<StaticCaptureResponse, { ok: true }> | Extract<RenderedCaptureResponse, { ok: true }>
  ) {
    setStorageError(null);
    setStorageMessage(null);
    try {
      const bundle =
        res.mode === "static"
          ? bundleFromStaticCapture(res)
          : bundleFromRenderedCapture(res);
      await persistBundle(bundle);
      setWebsiteBundle(bundle);
      setStorageMessage(
        "Saved website component (IndexedDB) with navigation MD for the navigation generator agent."
      );
    } catch (e) {
      setStorageError(e instanceof Error ? e.message : "Could not save bundle");
    }
  }

  async function runCapture(kind: "static" | "rendered") {
    setCaptureError(null);
    setCaptureMessage(null);
    lastCaptureRef.current = null;

    const u = parseUrl(pageUrl);
    if (!u || !/^https?:$/i.test(u.protocol)) {
      setCaptureError("Enter a valid http(s) URL first.");
      return;
    }

    setCaptureBusy(kind);
    try {
      const res =
        kind === "static"
          ? await captureStatic(u.href)
          : await captureRendered(u.href);

      lastCaptureRef.current = res;

      if (!res.ok) {
        const hint = "hint" in res ? res.hint : undefined;
        setCaptureError(
          [res.error, hint].filter(Boolean).join(" — ") || "Capture failed"
        );
        return;
      }

      if (res.mode === "static") {
        setCaptureMessage(
          `Fetched HTML (${res.meta.htmlBytes.toLocaleString()} bytes) + ${res.meta.stylesheetCount} linked stylesheet(s), ${res.meta.inlineStyleTagCount} inline <style> block(s).`
        );
        if (res.warnings.length) {
          setCaptureMessage(
            (m) =>
              `${m} ${res.warnings.length} asset note(s) — see downloaded JSON.`
          );
        }
      } else {
        setCaptureMessage(
          `Rendered DOM (${res.meta.htmlBytes.toLocaleString()} bytes) after JS; sampled ${res.meta.sampledElementCount} / ${res.meta.totalElements} elements with computed CSS.`
        );
      }

      await storeCaptureAsBundle(res);
    } catch (e) {
      setCaptureError(
        e instanceof Error ? e.message : "Network error — is Netlify dev running?"
      );
    } finally {
      setCaptureBusy(null);
    }
  }

  async function processUploadedFiles() {
    setStorageError(null);
    setStorageMessage(null);
    if (!htmlFile) {
      setStorageError("Choose an HTML file first.");
      return;
    }
    setFileProcessBusy(true);
    try {
      const html = await htmlFile.text();
      const css = cssFile ? await cssFile.text() : "";
      const js = jsFile ? await jsFile.text() : "";
      const bundle = bundleFromUpload({
        html,
        css,
        js,
        fileNames: {
          html: htmlFile.name,
          css: cssFile?.name,
          js: jsFile?.name,
        },
      });
      await persistBundle(bundle);
      setWebsiteBundle(bundle);
      setStorageMessage(
        "Stored website component with navigation MD for the navigation generator agent."
      );
    } catch (e) {
      setStorageError(e instanceof Error ? e.message : "Failed to process files");
    } finally {
      setFileProcessBusy(false);
    }
  }

  async function handleClearBundle() {
    setStorageError(null);
    setStorageMessage(null);
    try {
      await clearLatestWebsiteComponent();
      setWebsiteBundle(null);
      setBundleOpen(false);
      setStorageMessage("Cleared saved website component from this browser.");
    } catch {
      setStorageError("Could not clear storage.");
    }
  }

  const captureWorking = captureBusy !== null || fileProcessBusy;
  const loadLabel =
    captureBusy === "static"
      ? "Fetching HTML & CSS"
      : captureBusy === "rendered"
        ? "Rendering in browser"
        : fileProcessBusy
          ? "Processing uploads"
          : "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      sourceMode,
      pageUrl: sourceMode === "link" ? pageUrl : undefined,
      files:
        sourceMode === "files"
          ? {
              html: htmlFile?.name ?? null,
              css: cssFile?.name ?? null,
              js: jsFile?.name ?? null,
            }
          : undefined,
      vision,
      effectIds: [...selectedEffects],
      lastCapture: lastCaptureRef.current?.ok ? lastCaptureRef.current : undefined,
      websiteComponent: websiteBundle,
    };
    console.info("[create-video] submit", payload);
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
            onClick={() => navigate("/")}
          >
            ← Back to home
          </button>
        </div>

        <PipelineWorkflow
          activeStep={0}
          loadingEdgeAfter={
            captureBusy !== null || fileProcessBusy ? 0 : null
          }
        />

        <CreateFlowStageBanner step={0} />

        <form className="create-card create-brief-card" onSubmit={handleSubmit}>
          <h1 className="create-card__title">Create video</h1>
          <p className="create-brief-lede">
            Capture your UI, tune the story, then continue to the generating agent—one calm
            screen at a time.
          </p>

          {captureWorking ? (
            <div
              className="brief-loadbar brief-loadbar--active"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="brief-loadbar__track">
                <div className="brief-loadbar__shine" />
              </div>
              <span className="brief-loadbar__label">{loadLabel}</span>
            </div>
          ) : null}

          <BriefCollapsible
            title="Front-end capture"
            subtitle="Link or files, then fetch into this browser"
            open={captureOpen}
            onOpenChange={setCaptureOpen}
            complete={stepDone.capture}
            footer={
              <BriefStepFooter
                complete={stepDone.capture}
                onComplete={() => markStepComplete("capture")}
              />
            }
          >
            <div className="brief-stack brief-stack--tight">
              <div
                className="create-segment"
                role="group"
                aria-label="How to provide your front-end"
              >
                <button
                  type="button"
                  className="create-segment__btn"
                  aria-pressed={sourceMode === "link"}
                  onClick={() => setSourceMode("link")}
                >
                  Link to a page
                </button>
                <button
                  type="button"
                  className="create-segment__btn"
                  aria-pressed={sourceMode === "files"}
                  onClick={() => setSourceMode("files")}
                >
                  HTML / CSS / JS files
                </button>
              </div>

              {sourceMode === "link" ? (
                <>
                  <div className="brief-field">
                    <label className="brief-field__label" htmlFor="page-url">
                      Public URL
                    </label>
                    <input
                      id="page-url"
                      className="brief-input"
                      type="url"
                      name="pageUrl"
                      placeholder="https://your-site.com/app"
                      value={pageUrl}
                      onChange={(e) => setPageUrl(e.target.value)}
                      autoComplete="url"
                    />
                  </div>
                  <div className="create-capture-actions">
                    <button
                      type="button"
                      className="create-capture-btn create-capture-btn--primary"
                      disabled={captureBusy !== null}
                      onClick={() => runCapture("static")}
                    >
                      {captureBusy === "static"
                        ? "Fetching…"
                        : "Fetch HTML + linked CSS"}
                    </button>
                    <button
                      type="button"
                      className="create-capture-btn"
                      disabled={captureBusy !== null}
                      onClick={() => runCapture("rendered")}
                    >
                      {captureBusy === "rendered"
                        ? "Rendering…"
                        : "Render after JS + computed styles"}
                    </button>
                  </div>
                  <details className="brief-details">
                    <summary>Local dev &amp; Netlify setup</summary>
                    <div className="brief-details__body">
                      Capture uses Netlify Functions. From the repo root run{" "}
                      <code className="create-card__code">npm run dev</code> (starts{" "}
                      <code className="create-card__code">netlify dev</code>). Use the URL the CLI
                      prints (often <code className="create-card__code">http://localhost:8888</code>
                      ). For rendered capture set{" "}
                      <code className="create-card__code">PUPPETEER_EXECUTABLE_PATH</code> to your
                      Chrome/Chromium binary.
                    </div>
                  </details>
                  {captureError ? (
                    <div
                      className="brief-feedback brief-feedback--err"
                      role="alert"
                    >
                      <p className="brief-feedback__kicker">Capture error</p>
                      {captureError}
                    </div>
                  ) : null}
                  {captureMessage && !captureError ? (
                    <div className="brief-feedback brief-feedback--ok">
                      <p className="brief-feedback__kicker">Last capture</p>
                      {captureMessage}
                      {lastCaptureRef.current?.ok ? (
                        <div className="create-capture-result__actions">
                          <button
                            type="button"
                            className="create-capture-result__link"
                            onClick={() => {
                              const r = lastCaptureRef.current;
                              if (r?.ok) {
                                downloadJson(
                                  r,
                                  r.mode === "static"
                                    ? "capture-static.json"
                                    : "capture-rendered.json"
                                );
                              }
                            }}
                          >
                            Download JSON
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="create-file-row">
                    <label className="brief-field__label" htmlFor="file-html">
                      HTML
                    </label>
                    <input
                      id="file-html"
                      name="htmlFile"
                      type="file"
                      accept=".html,.htm,text/html"
                      onChange={(e) =>
                        setHtmlFile(e.target.files?.[0] ?? null)
                      }
                    />
                    {htmlFile ? (
                      <p className="create-file-name">{htmlFile.name}</p>
                    ) : null}
                  </div>
                  <div className="create-file-row">
                    <label className="brief-field__label" htmlFor="file-css">
                      CSS
                    </label>
                    <input
                      id="file-css"
                      name="cssFile"
                      type="file"
                      accept=".css,text/css"
                      onChange={(e) => setCssFile(e.target.files?.[0] ?? null)}
                    />
                    {cssFile ? (
                      <p className="create-file-name">{cssFile.name}</p>
                    ) : null}
                  </div>
                  <div className="create-file-row">
                    <label className="brief-field__label" htmlFor="file-js">
                      JavaScript (optional)
                    </label>
                    <input
                      id="file-js"
                      name="jsFile"
                      type="file"
                      accept=".js,.mjs,.cjs,text/javascript"
                      onChange={(e) => setJsFile(e.target.files?.[0] ?? null)}
                    />
                    {jsFile ? (
                      <p className="create-file-name">{jsFile.name}</p>
                    ) : null}
                  </div>
                  <div className="create-capture-actions">
                    <button
                      type="button"
                      className="create-capture-btn create-capture-btn--primary"
                      disabled={fileProcessBusy}
                      onClick={() => processUploadedFiles()}
                    >
                      {fileProcessBusy ? "Reading files…" : "Store files in browser"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </BriefCollapsible>

          <StepFlowConnector
            animateToken={
              flowPulse?.step === "capture" ? flowPulse.token : 0
            }
          />

          <BriefCollapsible
            title="Saved bundle & outputs"
            subtitle="IndexedDB snapshot + navigation draft"
            badge={websiteBundle && !stepDone.bundle ? "Saved" : undefined}
            open={bundleOpen}
            onOpenChange={setBundleOpen}
            complete={stepDone.bundle}
            footer={
              <BriefStepFooter
                complete={stepDone.bundle}
                onComplete={() => markStepComplete("bundle")}
              />
            }
          >
            <div className="brief-stack brief-stack--tight">
              <p className="brief-muted">
                Stored locally as one bundle: <code className="create-card__code">site.*</code> +{" "}
                <code className="create-card__code">navigationMd</code> for downstream agents.
              </p>
              {storageError ? (
                <div className="brief-feedback brief-feedback--err" role="alert">
                  <p className="brief-feedback__kicker">Storage</p>
                  {storageError}
                </div>
              ) : null}
              {storageMessage && !storageError ? (
                <div className="brief-feedback brief-feedback--ok">
                  <p className="brief-feedback__kicker">Storage</p>
                  {storageMessage}
                </div>
              ) : null}
              {websiteBundle ? (
                <>
                  <p className="create-bundle-meta">
                    <strong>Bundle id:</strong> <code>{websiteBundle.id}</code>
                    <br />
                    <strong>Source:</strong> {websiteBundle.source}
                    {websiteBundle.pageUrl ? (
                      <>
                        <br />
                        <strong>URL:</strong> {websiteBundle.pageUrl}
                      </>
                    ) : null}
                    {websiteBundle.fileNames?.html ? (
                      <>
                        <br />
                        <strong>Files:</strong>{" "}
                        {[
                          websiteBundle.fileNames.html,
                          websiteBundle.fileNames.css,
                          websiteBundle.fileNames.js,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </>
                    ) : null}
                    <br />
                    <strong>Created:</strong> {websiteBundle.createdAt}
                  </p>
                  {videoBrandPreview ? (
                    <div className="brief-feedback brief-feedback--ok">
                      <p className="brief-feedback__kicker">Video brand</p>
                      <p className="create-bundle-meta" style={{ margin: 0 }}>
                        <strong>Name:</strong> {videoBrandPreview.productName}
                        <br />
                        <strong>Logo:</strong>{" "}
                        {videoBrandPreview.logoUrl ? (
                          <a
                            className="create-capture-result__link"
                            href={videoBrandPreview.logoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {videoBrandPreview.logoUrl.slice(0, 64)}
                            {videoBrandPreview.logoUrl.length > 64 ? "…" : ""}
                          </a>
                        ) : (
                          "not detected"
                        )}
                      </p>
                      <div className="brief-brand-strip" aria-label="Brand colors">
                        {(
                          [
                            ["primary", videoBrandPreview.primary],
                            ["secondary", videoBrandPreview.secondary],
                            ["accent", videoBrandPreview.accent],
                            ["background", videoBrandPreview.background],
                          ] as const
                        ).map(([label, hex]) => (
                          <span key={label} className="brief-brand-swatch">
                            <span
                              className="brief-brand-swatch__dot"
                              style={{ background: hex }}
                              title={hex}
                            />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="brief-output brief-output--markdown">
                    <div className="brief-output__label">
                      <span>Navigation</span>
                      <span style={{ opacity: 0.75, fontWeight: 500 }}>
                        rendered preview
                      </span>
                    </div>
                    <div
                      id="nav-draft"
                      className="brief-output__body brief-output__body--markdown"
                      tabIndex={0}
                      role="article"
                      aria-label="Navigation markdown preview"
                    >
                      <NavigationMdView markdown={websiteBundle.navigationMd} />
                    </div>
                  </div>
                  <div className="create-bundle-actions">
                    <button
                      type="button"
                      className="create-capture-btn"
                      onClick={() =>
                        downloadJson(websiteBundle, "website-component.json")
                      }
                    >
                      Download JSON bundle
                    </button>
                    <button
                      type="button"
                      className="create-capture-btn"
                      onClick={() =>
                        downloadText(
                          websiteBundle.navigationMd,
                          "navigation.md",
                          "text/markdown;charset=utf-8"
                        )
                      }
                    >
                      Download navigation.md
                    </button>
                    <button
                      type="button"
                      className="create-capture-btn"
                      onClick={() => void handleClearBundle()}
                    >
                      Clear bundle
                    </button>
                  </div>
                </>
              ) : (
                <p className="brief-muted">
                  No bundle yet — capture a URL or upload HTML above.
                </p>
              )}
            </div>
          </BriefCollapsible>

          <StepFlowConnector
            animateToken={
              flowPulse?.step === "bundle" ? flowPulse.token : 0
            }
          />

          <BriefCollapsible
            title="Video vision"
            subtitle="Mood, pacing, length, and what to highlight"
            open={visionOpen}
            onOpenChange={setVisionOpen}
            complete={stepDone.vision}
            footer={
              <BriefStepFooter
                complete={stepDone.vision}
                onComplete={() => markStepComplete("vision")}
              />
            }
          >
            <div className="brief-stack">
              <div className="brief-field">
                <label className="brief-field__label" htmlFor="vision">
                  Creative direction
                </label>
                <textarea
                  id="vision"
                  name="vision"
                  className="brief-textarea brief-textarea--tall"
                  placeholder="Pacing, mood, key screens, voiceover style…"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                />
              </div>
              <div className="brief-field">
                <label className="brief-field__label" htmlFor="video-spec">
                  Length &amp; production spec
                </label>
                <textarea
                  id="video-spec"
                  name="videoSpec"
                  className="brief-textarea"
                  placeholder="Target duration (e.g. 45s), aspect ratio, FPS, cuts…"
                  value={videoSpec}
                  onChange={(e) => setVideoSpec(e.target.value)}
                />
              </div>
              <p className="brief-muted">
                The generating agent uses this for runtime and pacing; visuals should still follow
                colors from your capture.
              </p>
            </div>
          </BriefCollapsible>

          <StepFlowConnector
            animateToken={
              flowPulse?.step === "vision" ? flowPulse.token : 0
            }
          />

          <BriefCollapsible
            title="Promotion effects"
            subtitle="From your style manifest"
            open={effectsOpen}
            onOpenChange={setEffectsOpen}
            complete={stepDone.effects}
            footer={
              <BriefStepFooter
                complete={stepDone.effects}
                onComplete={() => markStepComplete("effects")}
              />
            }
          >
            <div className="brief-stack brief-stack--tight">
              <p className="brief-muted">
                <code className="create-card__code">content/promotion-effects/effects.manifest.json</code>
              </p>
              <PromotionEffectsDisclosure
                effects={effects}
                selectedEffects={selectedEffects}
                onToggle={toggleEffect}
              />
            </div>
          </BriefCollapsible>

          <StepFlowConnector
            animateToken={
              flowPulse?.step === "effects" ? flowPulse.token : 0
            }
          />

          <div className="brief-footer">
            <p className="brief-footer__note">
              When you are ready, generate timed voice/sound markdown and the{" "}
              <strong>prompt.md</strong> for the Remotion agent.
            </p>
            <button
              type="button"
              className="create-submit"
              onClick={() =>
                navigate("/create/generate", {
                  state: {
                    vision,
                    videoSpec,
                    effectIds: [...selectedEffects],
                  },
                })
              }
            >
              Generate prompt for video agent
            </button>
            {!websiteBundle ? (
              <p className="create-hint">
                No bundle in this browser yet — capture a URL or upload HTML first, or open
                Generate prompts to see what is missing.
              </p>
            ) : null}
            <button type="submit" className="create-submit create-submit--secondary">
              Save run (local preview — console log)
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
