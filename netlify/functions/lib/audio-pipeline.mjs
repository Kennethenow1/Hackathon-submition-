/**
 * Post-render audio pipeline.
 *
 * Parses sound_md / voice_md markdown tables produced by the generating agent,
 * synthesises SFX via ffmpeg's lavfi filters, generates voiceover with
 * OpenAI TTS, mixes everything, and muxes the result into the rendered video.
 *
 * Designed to be resilient: individual clip failures are logged as warnings
 * and the pipeline continues with whatever succeeds.
 */

import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  existsSync,
  writeFileSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";

// ── FFmpeg / FFprobe discovery ────────────────────────────────────

function findBinary(name) {
  const r = spawnSync(name, ["-version"], { stdio: "pipe", timeout: 5000 });
  return r.status === 0 ? name : null;
}

const getFfmpeg = () => findBinary("ffmpeg");
const getFfprobe = () => findBinary("ffprobe");

// ── Markdown table parsing ────────────────────────────────────────

/** Parse `sound_md` table → `{ start, end, duration, cue, description, mixNotes }[]` */
export function parseSoundMd(md) {
  if (!md || typeof md !== "string") return [];
  const out = [];
  for (const line of md.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const c = line.split("|").map((s) => s.trim()).filter(Boolean);
    if (c.length < 3) continue;
    const start = parseFloat(c[0]);
    const end = parseFloat(c[1]);
    if (isNaN(start) || isNaN(end) || start < 0 || end <= start) continue;
    out.push({
      start,
      end,
      duration: end - start,
      cue: (c[2] || "").toLowerCase().trim(),
      description: c[3] || "",
      mixNotes: c[4] || "",
    });
  }
  return out;
}

/** Parse `voice_md` table → `{ start, end, duration, script, deliveryNotes }[]` */
export function parseVoiceMd(md) {
  if (!md || typeof md !== "string") return [];
  const out = [];
  for (const line of md.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const c = line.split("|").map((s) => s.trim()).filter(Boolean);
    if (c.length < 3) continue;
    const start = parseFloat(c[0]);
    const end = parseFloat(c[1]);
    if (isNaN(start) || isNaN(end) || start < 0 || end <= start) continue;
    out.push({
      start,
      end,
      duration: end - start,
      script: c[2] || "",
      deliveryNotes: c[3] || "",
    });
  }
  return out;
}

// ── SFX synthesis via ffmpeg lavfi ────────────────────────────────

function sfxRecipe(cueType, dur) {
  const d = Math.max(0.05, dur);
  const normalized = cueType.replace(/[\s_-]+/g, "");
  const alias = {
    whoosh: "whoosh", swoosh: "whoosh",
    click: "click", tap: "click",
    riser: "riser", build: "riser", swell: "riser",
    ambient: "ambient", ambientbed: "ambient", bed: "ambient",
    ding: "ding", chime: "ding", notification: "ding",
  }[normalized] || "whoosh";

  switch (alias) {
    case "whoosh": {
      const fi = Math.min(d * 0.25, 0.3);
      const foDur = Math.min(d * 0.4, 0.5);
      const foSt = Math.max(0, d - foDur);
      return {
        input: ["-f", "lavfi", "-i", `anoisesrc=d=${d}:c=pink:s=44100`],
        af: `highpass=f=600,lowpass=f=5000,afade=t=in:st=0:d=${fi},afade=t=out:st=${foSt}:d=${foDur},volume=0.55`,
      };
    }
    case "click": {
      const cd = Math.min(d, 0.15);
      return {
        input: ["-f", "lavfi", "-i", `anoisesrc=d=${cd}:c=white:s=44100`],
        af: `highpass=f=3000,lowpass=f=9000,afade=t=out:st=0.015:d=${Math.max(0.01, cd - 0.02)},volume=0.5`,
      };
    }
    case "riser": {
      // Ascending sine sweep via aevalsrc; commas escaped for ffmpeg filter graph
      return {
        input: [
          "-f", "lavfi", "-i",
          `aevalsrc=sin(2*PI*(200+1200*t/${d})*t)*min(t/0.3\\,1):d=${d}:s=44100`,
        ],
        af: `afade=t=out:st=${Math.max(0, d - 0.3)}:d=0.3,volume=0.35`,
      };
    }
    case "ambient": {
      const fade = Math.min(1.5, d * 0.25);
      return {
        input: ["-f", "lavfi", "-i", `anoisesrc=d=${d}:c=pink:s=44100`],
        af: `lowpass=f=1000,highpass=f=60,volume=0.12,afade=t=in:st=0:d=${fade},afade=t=out:st=${Math.max(0, d - fade)}:d=${fade}`,
      };
    }
    case "ding": {
      const decayDur = Math.min(d, 1.0);
      return {
        input: ["-f", "lavfi", "-i", `sine=f=880:d=${decayDur}:s=44100`],
        af: `afade=t=out:st=0.01:d=${Math.max(0.05, decayDur - 0.02)},volume=0.4`,
      };
    }
    default: {
      return {
        input: ["-f", "lavfi", "-i", `sine=f=440:d=${d}:s=44100`],
        af: `volume=0.2,afade=t=in:st=0:d=${Math.min(0.2, d * 0.3)},afade=t=out:st=${Math.max(0, d * 0.7)}:d=${Math.min(0.3, d * 0.3)}`,
      };
    }
  }
}

function generateSfxClip(ffmpeg, cueType, duration, outPath) {
  const { input, af } = sfxRecipe(cueType, duration);
  const r = spawnSync(
    ffmpeg,
    [...input, "-af", af, "-ac", "1", "-ar", "44100", "-y", outPath],
    { stdio: "pipe", timeout: 15_000 },
  );
  if (r.status !== 0) {
    // Fallback: if aevalsrc failed (riser), try simple sine
    if (cueType.includes("riser") || cueType.includes("build")) {
      const d = Math.max(0.05, duration);
      const r2 = spawnSync(ffmpeg, [
        "-f", "lavfi", "-i", `sine=f=300:d=${d}:s=44100`,
        "-af", `tremolo=f=4:d=0.7,volume=0.3,afade=t=in:st=0:d=${d * 0.4},afade=t=out:st=${Math.max(0, d - 0.3)}:d=0.3`,
        "-ac", "1", "-ar", "44100", "-y", outPath,
      ], { stdio: "pipe", timeout: 15_000 });
      if (r2.status === 0) return;
    }
    throw new Error(
      `ffmpeg SFX failed (${cueType}): ${(r.stderr || r.stdout)?.toString().slice(-300)}`,
    );
  }
}

// ── TTS: ElevenLabs (preferred) or OpenAI ─────────────────────────

/** Default "Rachel" — override with ELEVENLABS_VOICE_ID (pick a natural voice in the ElevenLabs library). */
const DEFAULT_ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

function parseEnvFloat(key, fallback) {
  const v = process.env[key];
  if (v == null || String(v).trim() === "") return fallback;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

/** ElevenLabs `speed` (0.7–1.2 typical). Default 1.0; slightly below 1 can sound more relaxed. */
function elevenLabsSpeed() {
  const s = parseEnvFloat("ELEVENLABS_SPEED", 1);
  return Math.min(1.2, Math.max(0.7, s));
}

/**
 * Strip light markdown and shape text so ElevenLabs pauses naturally (punctuation drives prosody).
 * Delivery notes are NOT spoken — only used for voice_settings.
 */
function prepareElevenLabsScript(script, deliveryNotes) {
  let t = String(script || "").trim();
  t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
  t = t.replace(/\*([^*]+)\*/g, "$1");
  t = t.replace(/`([^`]+)`/g, "$1");
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  t = t.replace(/\s+/g, " ");

  const nlow = (deliveryNotes || "").toLowerCase();
  // Clause boundaries → micro-pauses (model reads "..." as a breath)
  t = t.replace(/\s*;\s*/g, ". ... ");
  t = t.replace(/\s*—\s*/g, " ... ");
  t = t.replace(/\s+-\s+/g, ", ");

  if (/\b(slow|deliberate|thoughtful|dramatic)\b/.test(nlow)) {
    t = t.replace(/,\s+/g, ", ... ");
  }
  if (/\b(pause|beat|breath)\b/.test(nlow)) {
    t = t.replace(/\.(\s+)/g, "...$1");
  }

  t = t.replace(/\.{4,}/g, "...");
  t = t.replace(/\.\s*\.\.\./g, "...");
  t = t.trim();
  if (t && !/[.!?…]$/.test(t)) t += ".";
  return t;
}

/** Map delivery notes + env overrides to ElevenLabs voice_settings (defaults tuned for natural, human-like delivery). */
function elevenLabsVoiceSettings(deliveryNotes) {
  const base = {
    stability: parseEnvFloat("ELEVENLABS_STABILITY", 0.36),
    similarity_boost: parseEnvFloat("ELEVENLABS_SIMILARITY_BOOST", 0.82),
    style: parseEnvFloat("ELEVENLABS_STYLE", 0.36),
    use_speaker_boost: process.env.ELEVENLABS_USE_SPEAKER_BOOST !== "0",
  };
  const n = (deliveryNotes || "").toLowerCase();
  if (/\b(energetic|punchy|upbeat|excited|hype|dynamic|playful)\b/.test(n)) {
    return {
      ...base,
      stability: Math.min(base.stability, 0.34),
      style: Math.max(base.style, 0.48),
    };
  }
  if (/\b(calm|warm|soft|gentle|soothing|relaxed|intimate)\b/.test(n)) {
    return {
      ...base,
      stability: Math.max(base.stability, 0.52),
      style: Math.min(base.style, 0.14),
    };
  }
  return base;
}

function isLikelyMp3Buffer(buf) {
  if (!buf || buf.length < 4) return false;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return true; // ID3
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return true; // MPEG frame sync
  return false;
}

function formatElevenLabsErrorBody(status, raw) {
  const slice = (raw || "").slice(0, 600);
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j.detail)) {
      return j.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
    }
    if (typeof j.detail === "string") return j.detail;
    if (j.message) return String(j.message);
  } catch {
    /* keep raw */
  }
  return slice;
}

async function generateTtsElevenLabs(apiKey, script, deliveryNotes, outPath) {
  const voiceId = (process.env.ELEVENLABS_VOICE_ID || "").trim() || DEFAULT_ELEVENLABS_VOICE_ID;
  /** `eleven_turbo_v2_5` is strong for natural English; override with `eleven_multilingual_v2` if needed. */
  const modelId = (process.env.ELEVENLABS_MODEL || "").trim() || "eleven_turbo_v2_5";
  const outputFormat =
    (process.env.ELEVENLABS_OUTPUT_FORMAT || "mp3_44100_128").trim() || "mp3_44100_128";
  const text = prepareElevenLabsScript(script, deliveryNotes);
  if (!text.trim()) {
    throw new Error("Empty script after cleanup");
  }
  let voice_settings = elevenLabsVoiceSettings(deliveryNotes);
  if (process.env.ELEVENLABS_SPEED != null && String(process.env.ELEVENLABS_SPEED).trim() !== "") {
    voice_settings = { ...voice_settings, speed: elevenLabsSpeed() };
  }
  const base = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;
  const url = `${base}?${new URLSearchParams({ output_format: outputFormat })}`;
  const ttsSignal =
    typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(120_000)
      : undefined;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg, audio/*, application/octet-stream, */*",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings,
    }),
    ...(ttsSignal ? { signal: ttsSignal } : {}),
  });
  const bodyBuf = Buffer.from(await resp.arrayBuffer());
  if (!resp.ok) {
    const msg = formatElevenLabsErrorBody(resp.status, bodyBuf.toString("utf8"));
    throw new Error(`ElevenLabs TTS ${resp.status}: ${msg}`);
  }
  if (!isLikelyMp3Buffer(bodyBuf)) {
    const head = bodyBuf.slice(0, 200).toString("utf8").replace(/\s+/g, " ");
    throw new Error(
      `ElevenLabs returned non-audio (check API key / quota). Body starts: ${head.slice(0, 120)}`,
    );
  }
  writeFileSync(outPath, bodyBuf);
}

async function generateTtsOpenAI(apiKey, text, outPath, voice, model) {
  const resp = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      response_format: "mp3",
    }),
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`OpenAI TTS ${resp.status}: ${detail.slice(0, 200)}`);
  }
  writeFileSync(outPath, Buffer.from(await resp.arrayBuffer()));
}

// ── Track assembly helpers ────────────────────────────────────────

/**
 * Mix an array of `{ path, startMs }` clips into one wav file using adelay + amix.
 * Returns true on success.
 */
function mixClips(ffmpeg, clips, totalDurSec, outPath) {
  if (clips.length === 0) return false;
  if (clips.length === 1) {
    const c = clips[0];
    /** `apad=whole_dur` is in samples at the output rate (44100 Hz). */
    const wholeSamples = Math.max(1, Math.round(Number(totalDurSec) * 44100));
    const r = spawnSync(ffmpeg, [
      "-i", c.path,
      "-af", `adelay=${c.startMs}:all=1,apad=whole_dur=${wholeSamples}`,
      "-ac", "1", "-ar", "44100", "-y", outPath,
    ], { stdio: "pipe", timeout: 30_000 });
    return r.status === 0;
  }

  const inputs = clips.flatMap((c) => ["-i", c.path]);
  const delays = clips.map((c, i) => `[${i}]adelay=${c.startMs}:all=1[a${i}]`);
  const labels = clips.map((_, i) => `[a${i}]`).join("");
  const graph =
    delays.join(";") +
    `;${labels}amix=inputs=${clips.length}:duration=longest:normalize=0,alimiter=limit=0.96[out]`;

  const r = spawnSync(ffmpeg, [
    ...inputs,
    "-filter_complex", graph,
    "-map", "[out]",
    "-ac", "1", "-ar", "44100", "-y", outPath,
  ], { stdio: "pipe", timeout: 60_000 });
  return r.status === 0;
}

function assembleSfxTrack(ffmpeg, cues, totalDur, outPath, warnings) {
  const clips = [];
  for (let i = 0; i < cues.length; i++) {
    const clipPath = outPath.replace(/\.wav$/, `-clip${i}.wav`);
    try {
      generateSfxClip(ffmpeg, cues[i].cue, cues[i].duration, clipPath);
      clips.push({ path: clipPath, startMs: Math.round(cues[i].start * 1000) });
    } catch (e) {
      warnings.push(`SFX clip ${i} (${cues[i].cue} @ ${cues[i].start}s): ${e.message}`);
    }
  }
  if (clips.length === 0) return false;
  const ok = mixClips(ffmpeg, clips, totalDur, outPath);
  if (!ok) warnings.push("SFX mix step failed");
  return ok;
}

/**
 * Probe duration of an audio file in seconds. Returns 0 on failure.
 */
function probeClipDuration(ffprobe, filePath) {
  if (!ffprobe) return 0;
  const r = spawnSync(ffprobe, [
    "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", filePath,
  ], { stdio: "pipe", timeout: 10_000 });
  const d = parseFloat(r.stdout?.toString().trim());
  return isNaN(d) ? 0 : d;
}

/**
 * Voice assembly with sequential (non-overlapping) placement.
 * Each clip starts after the *previous clip finishes*, with at least a small gap.
 * This prevents cutting off one line to start the next.
 */
async function assembleVoiceTrack(ffmpeg, rows, totalDur, outPath, warnings) {
  const elevenKey = (process.env.ELEVENLABS_API_KEY || "").trim();
  const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
  const tts =
    elevenKey
      ? { kind: "elevenlabs", key: elevenKey }
      : openaiKey
        ? { kind: "openai", key: openaiKey }
        : null;

  if (!tts) {
    warnings.push("Set ELEVENLABS_API_KEY or OPENAI_API_KEY for TTS voiceover.");
    return false;
  }

  if (tts.kind === "openai") {
    warnings.push(
      "Voiceover uses OpenAI TTS. Set ELEVENLABS_API_KEY for ElevenLabs (more natural, human-like voices).",
    );
  }

  const openaiVoice = process.env.OPENAI_TTS_VOICE || "alloy";
  const openaiModel = process.env.OPENAI_TTS_MODEL || "tts-1";
  const ffprobe = getFfprobe();
  const GAP_MS = Math.round(parseEnvFloat("VOICE_LINE_GAP_MS", 380));

  const generated = [];
  for (let i = 0; i < rows.length; i++) {
    const text = rows[i].script.trim();
    if (!text) continue;
    const clipPath = outPath.replace(/\.wav$/, `-clip${i}.mp3`);
    try {
      if (tts.kind === "elevenlabs") {
        try {
          await generateTtsElevenLabs(tts.key, text, rows[i].deliveryNotes, clipPath);
        } catch (e11) {
          const msg = e11 instanceof Error ? e11.message : String(e11);
          const noFallback = (process.env.ELEVENLABS_NO_OPENAI_FALLBACK || "").trim() === "1";
          if (openaiKey && !noFallback) {
            warnings.push(
              `Voice clip ${i} (${rows[i].start}s): ElevenLabs failed (${msg}). Retrying with OpenAI TTS.`,
            );
            await generateTtsOpenAI(openaiKey, text, clipPath, openaiVoice, openaiModel);
          } else {
            throw e11;
          }
        }
      } else {
        await generateTtsOpenAI(tts.key, text, clipPath, openaiVoice, openaiModel);
      }
      const dur = probeClipDuration(ffprobe, clipPath);
      generated.push({ index: i, path: clipPath, durMs: Math.round(dur * 1000), row: rows[i] });
    } catch (e) {
      warnings.push(`Voice clip ${i} (${rows[i].start}s): ${e.message}`);
    }
  }
  if (generated.length === 0) return false;

  const clips = [];
  let cursor = 0;
  let lastEndSec = 0;
  for (const g of generated) {
    const desiredStart = Math.round(g.row.start * 1000);
    const startMs = Math.max(desiredStart, cursor);
    clips.push({ path: g.path, startMs });
    const endSec = startMs / 1000 + g.durMs / 1000;
    if (endSec > lastEndSec) lastEndSec = endSec;
    cursor = startMs + g.durMs + GAP_MS;
  }

  /** Pad/mix target: at least video length, and at least full narration end (avoids truncating long TTS vs short video). */
  const lineEndPad = parseEnvFloat("VOICE_MIX_END_PAD_SEC", 0.45);
  const mixTotalDurSec = Math.max(totalDur, lastEndSec + lineEndPad);

  const ok = mixClips(ffmpeg, clips, mixTotalDurSec, outPath);
  if (!ok) warnings.push("Voice mix step failed");
  return ok;
}

// ── Video probing & muxing ────────────────────────────────────────

function probeDuration(ffprobe, file) {
  const r = spawnSync(ffprobe, [
    "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", file,
  ], { stdio: "pipe", timeout: 10_000 });
  const d = parseFloat(r.stdout?.toString().trim());
  return isNaN(d) ? 30 : d;
}

function hasAudioStream(ffprobe, file) {
  const r = spawnSync(ffprobe, [
    "-v", "quiet", "-select_streams", "a",
    "-show_entries", "stream=codec_type", "-of", "csv=p=0", file,
  ], { stdio: "pipe", timeout: 10_000 });
  return (r.stdout?.toString() || "").includes("audio");
}

/** Duration of first audio stream in seconds (0 if none / unknown). */
function probeFirstAudioStreamDurationSec(ffprobe, filePath) {
  if (!ffprobe) return 0;
  const r = spawnSync(ffprobe, [
    "-v", "quiet",
    "-select_streams", "a:0",
    "-show_entries", "stream=duration",
    "-of", "csv=p=0",
    filePath,
  ], { stdio: "pipe", timeout: 10_000 });
  const d = parseFloat(r.stdout?.toString().trim());
  return isNaN(d) ? 0 : d;
}

/**
 * Mux external voiceover into video without chopping the VO at the video end.
 * `-shortest` was truncating narration when TTS ran longer than the rendered composition.
 */
function muxAudioIntoVideo(ffmpeg, ffprobe, videoPath, audioTracks, outPath) {
  const tracks = audioTracks.filter((t) => t && existsSync(t));
  if (tracks.length === 0) return false;

  const existingAudio = ffprobe && hasAudioStream(ffprobe, videoPath);
  const minTail = parseEnvFloat("VOICE_MUX_MIN_TAIL_SEC", 0.95);
  const framePad = parseEnvFloat("VOICE_MUX_FRAME_PAD_SEC", 0.12);
  const vReencodeCrf = Math.round(parseEnvFloat("VOICE_MUX_VIDEO_CRF", 18));
  const aacBr = Math.round(parseEnvFloat("VOICE_MUX_AAC_BITRATE_K", 192));

  const V = ffprobe ? probeDuration(ffprobe, videoPath) : 30;

  if (tracks.length === 1 && !existingAudio) {
    const A = ffprobe ? probeClipDuration(ffprobe, tracks[0]) : 0;
    const outDur = Math.max(V, A + minTail) + framePad;
    const vPad = Math.max(0, outDur - V);
    const aPad = Math.max(0, outDur - A);

    if (vPad > 0.02) {
      const fc =
        `[0:v]tpad=stop_mode=clone:stop_duration=${vPad.toFixed(3)}[v];` +
        `[1:a]aformat=sample_rates=44100:channel_layouts=mono,apad=pad_dur=${aPad.toFixed(3)}[a]`;
      const r = spawnSync(
        ffmpeg,
        [
          "-i", videoPath, "-i", tracks[0],
          "-filter_complex", fc,
          "-map", "[v]", "-map", "[a]",
          "-c:v", "libx264", "-preset", "veryfast", "-crf", String(vReencodeCrf),
          "-c:a", "aac", "-b:a", `${aacBr}k`,
          "-movflags", "+faststart",
          "-y", outPath,
        ],
        { stdio: "pipe", timeout: 300_000 },
      );
      return r.status === 0;
    }

    const fc =
      `[1:a]aformat=sample_rates=44100:channel_layouts=mono,apad=pad_dur=${aPad.toFixed(3)}[a]`;
    const r = spawnSync(
      ffmpeg,
      [
        "-i", videoPath, "-i", tracks[0],
        "-filter_complex", fc,
        "-map", "0:v", "-map", "[a]",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", `${aacBr}k`,
        "-movflags", "+faststart",
        "-y", outPath,
      ],
      { stdio: "pipe", timeout: 300_000 },
    );
    return r.status === 0;
  }

  const inputs = ["-i", videoPath, ...tracks.flatMap((t) => ["-i", t])];
  const count = tracks.length + (existingAudio ? 1 : 0);

  const Aembed = existingAudio ? probeFirstAudioStreamDurationSec(ffprobe, videoPath) : 0;
  let Aext = 0;
  for (const t of tracks) {
    if (ffprobe) Aext = Math.max(Aext, probeClipDuration(ffprobe, t));
  }
  const outDur = Math.max(V, Aembed, Aext) + minTail + framePad;
  const vPad = Math.max(0, outDur - V);
  const wholeSamples = Math.max(1, Math.round(outDur * 44100));

  const parts = [];
  if (vPad > 0.02) {
    parts.push(`[0:v]tpad=stop_mode=clone:stop_duration=${vPad.toFixed(3)}[vuse]`);
  }
  if (existingAudio) {
    parts.push(`[0:a]aformat=sample_rates=44100:channel_layouts=mono[orig]`);
  }
  tracks.forEach((_, i) => {
    parts.push(`[${i + 1}]aformat=sample_rates=44100:channel_layouts=mono[t${i}]`);
  });
  const mixLabels = (existingAudio ? "[orig]" : "") + tracks.map((_, i) => `[t${i}]`).join("");
  parts.push(
    `${mixLabels}amix=inputs=${count}:duration=longest:normalize=0,alimiter=limit=0.96,apad=whole_dur=${wholeSamples}[aout]`,
  );

  const fc = parts.join(";");
  const mapV = vPad > 0.02 ? "[vuse]" : "0:v";
  const vCodec = vPad > 0.02 ? ["-c:v", "libx264", "-preset", "veryfast", "-crf", String(vReencodeCrf)] : ["-c:v", "copy"];

  const r = spawnSync(
    ffmpeg,
    [
      ...inputs,
      "-filter_complex", fc,
      "-map", mapV, "-map", "[aout]",
      ...vCodec,
      "-c:a", "aac", "-b:a", `${aacBr}k`,
      "-movflags", "+faststart",
      "-y", outPath,
    ],
    { stdio: "pipe", timeout: 300_000 },
  );
  return r.status === 0;
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Run the full audio pipeline on a rendered video.
 *
 * @param {string} videoPath  Absolute path to the rendered .mp4
 * @param {object} opts
 * @param {string} [opts.voiceMd]  Voiceover markdown from the generating agent
 * @returns {Promise<{ ok: boolean, videoPath: string, warnings: string[] }>}
 */
export async function runAudioPipeline(videoPath, { voiceMd } = {}) {
  const warnings = [];

  const ffmpeg = getFfmpeg();
  if (!ffmpeg) {
    warnings.push("ffmpeg not found; audio pipeline skipped. Install ffmpeg to enable voiceover.");
    return { ok: false, videoPath, warnings };
  }
  const ffprobe = getFfprobe();

  const voiceRows = parseVoiceMd(voiceMd);

  if (voiceRows.length === 0) {
    warnings.push("No valid voice cues parsed; video unchanged.");
    return { ok: true, videoPath, warnings };
  }

  const totalDur = ffprobe ? probeDuration(ffprobe, videoPath) : 30;

  const tmp = path.join(os.tmpdir(), `audio-pipeline-${randomUUID()}`);
  mkdirSync(tmp, { recursive: true });

  try {
    let voicePath = null;

    if (voiceRows.length > 0) {
      voicePath = path.join(tmp, "voice-mix.wav");
      if (!(await assembleVoiceTrack(ffmpeg, voiceRows, totalDur, voicePath, warnings))) {
        voicePath = null;
      }
    }

    if (!voicePath) {
      warnings.push("No audio tracks generated successfully; video unchanged.");
      return { ok: false, videoPath, warnings };
    }

    const tempOut = path.join(tmp, "output.mp4");
    const ok = muxAudioIntoVideo(ffmpeg, ffprobe, videoPath, [voicePath], tempOut);

    if (!ok || !existsSync(tempOut)) {
      warnings.push("Audio mux into video failed; returning silent video.");
      return { ok: false, videoPath, warnings };
    }

    copyFileSync(tempOut, videoPath);
    return { ok: true, videoPath, warnings };
  } finally {
    try { rmSync(tmp, { recursive: true, force: true }); } catch { /* best effort */ }
  }
}
