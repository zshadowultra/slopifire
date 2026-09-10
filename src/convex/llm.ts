"use node";

/**
 * LLM access layer — ported from the project's original ai.ts (vly AI gateway →
 * direct OpenAI → graceful fallback), extended with JSON generation for the
 * fragments-style structured builder output.
 */

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

/** Plain text generation with the standard provider chain. */
export async function generateText(messages: ChatMsg[]): Promise<string> {
  const vly = await callVly(messages);
  if (vly) return vly;
  const openai = await callOpenAI(messages);
  if (openai) return openai;
  throw new Error("No LLM provider configured (VLY_INTEGRATION_KEY / OPENAI_API_KEY)");
}

/** JSON generation — strips markdown fences before parsing. */
export async function generateJson<T>(messages: ChatMsg[]): Promise<T> {
  const raw = await generateText(messages);
  return parseJsonLoose<T>(raw);
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
