import { spawn } from "node:child_process";
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { corsHeaders } from "./lib/cors.mjs";
import { runAudioPipeline } from "./lib/audio-pipeline.mjs";
import { moduleDirname } from "./lib/module-dirname.mjs";

/** 1-2 min videos (~3600 frames @ 1080p) need generous render time */
const RENDER_TIMEOUT_MS = 1_800_000;

const PREVIEW_SKIP_WRITE_PATHS = new Set([
  "packages/remotion/src/index.ts",
]);
const DEFAULT_MUSIC_BED_REL = "apps/web/public/music/mixkit-pop-track-03.mp3";

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function monorepoRoot() {
  const d = moduleDirname();
  const candidates = [
    d,
    path.resolve(d, "..", ".."),
    process.cwd(),
  ];
  for (const root of candidates) {
    if (existsSync(path.join(root, "packages", "remotion", "package.json"))) {
      return path.resolve(root);
    }
  }
  return path.resolve(d, "..", "..");
}

function remotionPackageDir() {
  return path.join(monorepoRoot(), "packages", "remotion");
}

function assertWritableRemotionTree(absFilePath) {
  const base = path.resolve(remotionPackageDir());
  const resolved = path.resolve(absFilePath);
  const prefix = base.endsWith(path.sep) ? base : base + path.sep;
  if (resolved !== base && !resolved.startsWith(prefix)) {
    throw new Error(`Refusing to write outside packages/remotion: ${absFilePath}`);
  }
}

function writeRepoRelativeFile(repoRelativePosix, content) {
  const full = path.resolve(monorepoRoot(), ...repoRelativePosix.split("/"));
  assertWritableRemotionTree(full);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content, "utf8");
}

function validateCompositionId(id) {
  if (typeof id !== "string" || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) {
    return "compositionId must match /^[A-Za-z][A-Za-z0-9_-]*$/";
  }
  return null;
}

function runRemotionRender(compositionId, outputAbs, inputProps) {
  const cwd = remotionPackageDir();
  const propsPath = path.join(cwd, "render-input-props.json");
  const useProps =
    inputProps !== undefined &&
    inputProps !== null &&
    typeof inputProps === "object" &&
    Object.keys(inputProps).length > 0;
  if (useProps) {
    writeFileSync(propsPath, JSON.stringify(inputProps), "utf8");
  }
  const args = ["remotion", "render", "src/index.ts", compositionId, outputAbs];
  if (useProps) {
    args.push("--props=render-input-props.json");
  }
  return new Promise((resolve, reject) => {
    const child = spawn("npx", args, {
      cwd,
      env: { ...process.env },
      shell: false,
    });
    let out = "";
    let err = "";
    child.stdout?.on("data", (c) => {
      out += c.toString();
      if (out.length > 24_000) out = out.slice(-24_000);
    });
    child.stderr?.on("data", (c) => {
      err += c.toString();
      if (err.length > 24_000) err = err.slice(-24_000);
    });
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Render timed out after ${RENDER_TIMEOUT_MS}ms`));
    }, RENDER_TIMEOUT_MS);
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ out, err });
      else
        reject(
          new Error(
            `remotion render exited ${code}\n--- stderr ---\n${err || "(empty)"}\n--- stdout ---\n${out || "(empty)"}`
          )
        );
    });
  });
}

function runFfmpeg(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", args, {
      cwd,
      env: { ...process.env },
      shell: false,
    });
    let out = "";
    let err = "";
    child.stdout?.on("data", (c) => {
      out += c.toString();
      if (out.length > 16_000) out = out.slice(-16_000);
    });
    child.stderr?.on("data", (c) => {
      err += c.toString();
      if (err.length > 16_000) err = err.slice(-16_000);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ out, err });
      else reject(new Error((err || out || `ffmpeg exited ${code}`).slice(-1200)));
    });
  });
}

async function muxBackgroundMusic(videoAbs, musicAbs) {
  const outTmp = `${videoAbs}.musicbed.mp4`;
  await runFfmpeg(
    [
      "-y",
      "-i",
      videoAbs,
      "-stream_loop",
      "-1",
      "-i",
      musicAbs,
      "-filter:a",
      "volume=0.22",
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      outTmp,
    ],
    path.dirname(videoAbs)
  );
  renameSync(outTmp, videoAbs);
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" });
  }

  const root = monorepoRoot();
  const remotionPkg = path.join(root, "packages", "remotion", "package.json");
  if (!existsSync(remotionPkg)) {
    return jsonResponse(501, {
      ok: false,
      code: "local_repo_required",
      error:
        "Video render needs this monorepo on disk. Run `npm run dev` from the repo root (Vite + functions on :9999). Deployed Netlify Functions do not include the Remotion package for CLI render.",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { ok: false, error: "Invalid JSON body" });
  }

  const files = body.files;
  const compositionId = body.compositionId;
  if (!Array.isArray(files) || files.length === 0) {
    return jsonResponse(400, { ok: false, error: "Body must include non-empty files[]" });
  }
  const cidErr = validateCompositionId(compositionId);
  if (cidErr) {
    return jsonResponse(400, { ok: false, error: cidErr });
  }

  for (const f of files) {
    if (!f || typeof f.path !== "string" || typeof f.content !== "string") {
      return jsonResponse(400, { ok: false, error: "Each file needs path and content strings" });
    }
    const p = f.path.replace(/\\/g, "/");
    if (!p.startsWith("packages/remotion/")) {
      return jsonResponse(400, {
        ok: false,
        error: `Invalid path (must start with packages/remotion/): ${p}`,
      });
    }
  }

  try {
    for (const f of files) {
      const p = f.path.replace(/\\/g, "/");
      if (PREVIEW_SKIP_WRITE_PATHS.has(p)) {
        continue;
      }
      writeRepoRelativeFile(p, f.content);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonResponse(500, { ok: false, error: msg, code: "write_failed" });
  }

  const outDir = path.join(root, "apps", "web", "public", "renders");
  mkdirSync(outDir, { recursive: true });
  const outputAbs = path.join(outDir, "latest.mp4");

  const inputProps = body.inputProps;
  const voiceMd = typeof body.voiceMd === "string" ? body.voiceMd : "";
  const includeAudio = body.includeAudio !== false;

  try {
    await runRemotionRender(compositionId, outputAbs, inputProps);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonResponse(422, {
      ok: false,
      error: msg,
      code: "render_failed",
      hint:
        "Set PUPPETEER_EXECUTABLE_PATH or CHROME_PATH to a Chrome/Chromium binary if headless Chrome is missing.",
    });
  }

  if (!existsSync(outputAbs)) {
    return jsonResponse(422, {
      ok: false,
      error: "Render reported success but latest.mp4 was not found.",
      code: "missing_output",
    });
  }

  // Post-render audio pipeline: TTS voiceover only (SFX disabled for now)
  let audioWarnings = [];
  if (includeAudio && voiceMd) {
    try {
      const result = await runAudioPipeline(outputAbs, { voiceMd });
      audioWarnings = result.warnings || [];
    } catch (e) {
      audioWarnings = [`Audio pipeline error: ${e instanceof Error ? e.message : String(e)}`];
    }
  }

  // Fallback safety net: if includeAudio is on but no usable voice was produced, add a background music bed.
  if (includeAudio) {
    const fallbackMusicAbs = path.join(root, ...DEFAULT_MUSIC_BED_REL.split("/"));
    const shouldAddMusicBed =
      !voiceMd ||
      audioWarnings.some((w) =>
        /No valid voice cues parsed|No audio tracks generated successfully|Set ELEVENLABS_API_KEY|Audio pipeline error/i.test(
          String(w)
        )
      );
    if (shouldAddMusicBed) {
      if (existsSync(fallbackMusicAbs)) {
        try {
          await muxBackgroundMusic(outputAbs, fallbackMusicAbs);
          audioWarnings.push("Voiceover unavailable — used default background music bed instead.");
        } catch (e) {
          audioWarnings.push(
            `Music bed fallback failed: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      } else {
        audioWarnings.push(
          `No voiceover and fallback music file missing (${DEFAULT_MUSIC_BED_REL}).`
        );
      }
    }
  }

  return jsonResponse(200, {
    ok: true,
    videoUrl: `/renders/latest.mp4?t=${Date.now()}`,
    compositionId,
    ...(audioWarnings.length > 0 ? { audioWarnings } : {}),
  });
}
