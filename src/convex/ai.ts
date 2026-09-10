"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { createVlyIntegrations } from "@vly-ai/integrations";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM_PROMPT = [
  "You are Lovable, a friendly AI app builder inside a mobile chat.",
  "Be warm, concise (2-6 short sentences or a few bullet lines), and action-oriented.",
  "Prefer short paragraphs and bullet lists; never use markdown tables.",
  "End with a short question or suggestion that moves the project forward.",
].join(" ");

const MAX_CONTEXT_MESSAGES = 12;

/**
 * Scheduled after each user message: generate the assistant reply and store it.
 * Order: vly AI gateway (VLY_INTEGRATION_KEY) -> direct OpenAI key -> graceful canned fallback.
 */
export const reply = internalAction({
  args: { projectId: v.id("projects"), userId: v.id("users") },
  handler: async (ctx, { projectId, userId }) => {
    // Load recent history from the mutation world.
    const history = await ctx.runQuery(internal.projects.recentHistory, {
      projectId,
    });

    const messages: ChatMsg[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-MAX_CONTEXT_MESSAGES),
    ];

    let generated: string;
    try {
      generated = await generate(messages);
    } catch (err) {
      console.error("AI reply generation failed:", err);
      generated = "Sorry — I couldn't generate a reply just now. Please try again.";
    }

    // Store the reply and clear the pending flag.
    await ctx.runMutation(internal.projects.appendAssistantMessage, {
      projectId,
      userId,
      reply: generated,
    });
  },
});

async function generate(messages: ChatMsg[]): Promise<string> {
  // 1) vly AI gateway — the platform-managed integration.
  const vlyKey = process.env.VLY_INTEGRATION_KEY;
  if (vlyKey) {
    try {
      const vly = createVlyIntegrations({ deploymentToken: vlyKey });
      const res = await vly.ai.completion({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        maxTokens: 500,
      });
      const text = res.data?.choices?.[0]?.message?.content?.trim();
      if (res.success && text) return text;
      console.error("vly AI completion failed:", res.error ?? "empty response");
    } catch (err) {
      console.error("vly AI completion threw:", err);
    }
  }

  // 2) Direct OpenAI key fallback.
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
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
          temperature: 0.7,
          max_tokens: 500,
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
  }

  // 3) Graceful fallback so the chat never dead-ends.
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  return fallbackReply(lastUser?.content ?? "");
}

function fallbackReply(prompt: string): string {
  const p = prompt.trim().toLowerCase();
  if (!prompt || /^(hi|hello|hey|yo|sup)\b/.test(p)) {
    return "Hi there! How can I help you today?";
  }
  if (p.includes("landing")) {
    return `Great choice! I sketched a landing page with a hero, feature grid, and call-to-action.\n\nSuggested structure:\n• Sticky nav with logo + CTA\n• Hero with headline and product screenshot\n• 3-column feature highlights\n• Footer with links and social icons\n\nWant me to build all of these sections now?`;
  }
  if (p.includes("dashboard") || p.includes("admin")) {
    return `I can wire up a dashboard with cards for key metrics, a sidebar navigation, and a data table.\n\nShall I go ahead and create the pages?`;
  }
  return `Got it — "${prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt}". I've noted this for the build. Tell me a bit more about the screens you need, or say "build it" and I'll scaffold the pages.`;
}
