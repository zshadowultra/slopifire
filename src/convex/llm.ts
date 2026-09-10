"use node";

/**
 * LLM access layer — ported from the project's original ai.ts (vly AI gateway →
 * direct OpenAI → graceful fallback), extended with JSON generation for the
 * fragments-style structured builder output.
 */

import { generateAppForPrompt } from "../lib/builder/app-templates";

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const MAX_TOKENS = 4096;

async function callVly(messages: ChatMsg[]): Promise<string | null> {
  const vlyKey = process.env.VLY_INTEGRATION_KEY;
  if (!vlyKey) return null;
  try {
    const { createVlyIntegrations } = await import("@vly-ai/integrations");
    const vly = createVlyIntegrations({ deploymentToken: vlyKey });
    const res = await vly.ai.completion({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
      maxTokens: MAX_TOKENS,
    });
    const text = res.data?.choices?.[0]?.message?.content?.trim();
    if (res.success && text) return text;
    console.error("vly AI completion failed:", res.error ?? "empty response");
  } catch (err) {
    console.error("vly AI completion threw:", err);
  }
  return null;
}

async function callOpenAI(messages: ChatMsg[]): Promise<string | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2,
        max_tokens: MAX_TOKENS,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } else {
      console.error("OpenAI fallback failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("OpenAI fallback threw:", err);
  }
  return null;
}

/** Plain text generation with the standard provider chain, falling back to local generator. */
export async function generateText(messages: ChatMsg[]): Promise<string> {
  const vly = await callVly(messages);
  if (vly) return vly;
  const openai = await callOpenAI(messages);
  if (openai) return openai;
  
  // Keyless offline fallback
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "Build an app";
  const app = generateAppForPrompt(lastUser);
  return app.commentary;
}

/** JSON generation — strips markdown fences before parsing, with keyless fallback. */
export async function generateJson<T>(messages: ChatMsg[]): Promise<T> {
  const vlyKey = process.env.VLY_INTEGRATION_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (vlyKey || openaiKey) {
    try {
      const raw = await generateText(messages);
      return parseJsonLoose<T>(raw);
    } catch (err) {
      console.warn("LLM API call failed, falling back to offline template:", err);
    }
  }

  // Keyless offline builder output fallback
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "Build an app";
  const app = generateAppForPrompt(lastUser);
  const fallbackOutput = {
    commentary: app.commentary,
    title: app.title,
    template: "vite-react",
    files: app.files.map((f) => ({ filePath: f.path, fileContent: f.content })),
    additionalDependencies: [],
    installCommand: "",
  };
  return fallbackOutput as unknown as T;
}

export function parseJsonLoose<T>(raw: string): T {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }
  return JSON.parse(text) as T;
}
