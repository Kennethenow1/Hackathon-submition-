import Anthropic from "@anthropic-ai/sdk";
import { withAnthropicRetry } from "./anthropic-retry.mjs";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function resolveRoundDelayMs() {
  const raw = process.env.GENERATING_AGENT_ROUND_DELAY_MS;
  if (raw != null && String(raw).trim() !== "") {
    const n = Number.parseInt(String(raw), 10);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
}

/**
 * OpenAI-style tools[] from generating-agent → Anthropic tool definitions.
 * @param {Array<{ type: string; function: { name: string; description?: string; parameters?: object } }>} openAiTools
 */
export function anthropicToolsFromOpenAiFormat(openAiTools) {
  return openAiTools.map((t) => {
    const fn = t.function;
    const schema = fn.parameters && typeof fn.parameters === "object" ? fn.parameters : { type: "object", properties: {} };
    return {
      name: fn.name,
      description: fn.description ?? "",
      input_schema: schema,
    };
  });
}

/**
 * @param {{
 *   apiKey: string;
 *   model: string;
 *   system: string;
 *   userBrief: object;
 *   openAiTools: Array<{ type: string; function: object }>;
 *   runTool: (name: string, args: object, ctx: object) => object;
 *   ctx: object;
 *   maxRounds?: number;
 *   maxOutputTokens?: number;
 * }} opts
 * @returns {Promise<{ submitted: { ideas_md: string; voice_md: string; sound_md: string; prompt_md: string } | null; model: string }>}
 */
export async function runAnthropicGeneratingLoop(opts) {
  const {
    apiKey,
    model,
    system,
    userBrief,
    openAiTools,
    runTool,
    ctx,
    maxRounds = 22,
    maxOutputTokens = 64_000,
  } = opts;

  const client = new Anthropic({ apiKey });
  const tools = anthropicToolsFromOpenAiFormat(openAiTools);

  /** @type {Anthropic.MessageParam[]} */
  const messages = [
    {
      role: "user",
      content: JSON.stringify(userBrief),
    },
  ];

  let submitted = null;
  let rounds = 0;
  const roundDelay = resolveRoundDelayMs();

  while (!submitted && rounds < maxRounds) {
    rounds += 1;
    if (rounds > 1 && roundDelay > 0) {
      await sleep(roundDelay);
    }
    const response = await withAnthropicRetry(
      () =>
        client.messages
          .stream({
            model,
            max_tokens: maxOutputTokens,
            system,
            tools,
            messages,
          })
          .finalMessage(),
      { label: "generating-agent-anthropic", maxAttempts: 8 }
    );

    messages.push({
      role: "assistant",
      content: response.content,
    });

    const toolUses = response.content.filter((b) => b.type === "tool_use");

    if (!toolUses.length) {
      messages.push({
        role: "user",
        content:
          "You must use the provided tools to read the bundle, then call submit_generating_outputs with ideas_md, voice_md, sound_md, and prompt_md. Do not reply with plain text only.",
      });
      continue;
    }

    /** @type {Anthropic.ToolResultBlockParam[]} */
    const toolResults = [];

    for (const block of toolUses) {
      if (block.type !== "tool_use") continue;
      const name = block.name;
      const input = block.input && typeof block.input === "object" ? block.input : {};

      if (name === "submit_generating_outputs") {
        const i = input.ideas_md;
        const v = input.voice_md;
        const s = input.sound_md;
        const p = input.prompt_md;
        if (
          typeof i === "string" &&
          typeof v === "string" &&
          typeof s === "string" &&
          typeof p === "string" &&
          i.trim() &&
          v.trim() &&
          s.trim() &&
          p.trim()
        ) {
          submitted = { ideas_md: i, voice_md: v, sound_md: s, prompt_md: p };
        }
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(
            submitted
              ? { ok: true, message: "Outputs accepted." }
              : {
                  ok: false,
                  message:
                    "All four fields (ideas_md, voice_md, sound_md, prompt_md) must be non-empty markdown strings. Fix and call submit_generating_outputs again.",
                }
          ),
        });
        continue;
      }

      const result = runTool(name, input, ctx);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({
      role: "user",
      content: toolResults,
    });

    if (submitted) break;
  }

  return { submitted, model };
}
