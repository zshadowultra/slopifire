"use node";

/**
 * Builder orchestrator — the Lovable-style generate → apply → preview loop,
 * modeled on e2b-dev/fragments (chat route → fragment schema → sandbox route)
 * and firecrawl/open-lovable (apply-ai-code → sandbox files → Vite restart).
 *
 * Scheduled from projects.sendMessage. For each user message:
 *   1. Load history + current files
 *   2. Ask the LLM for structured edits (fragments fragmentSchema style)
 *   3. Ensure an E2B sandbox exists with the starter app
 *   4. Write changed files, install new deps, restart Vite
 *   5. Store the assistant message + files + live preview URL
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { generateJson, type ChatMsg } from "./llm";
import { toBuilderPrompt, toEditPrompt } from "../lib/builder/prompts";
import {
  ensureSandbox,
  applyFiles,
  installPackages,
  restartViteServer,
  killSandboxById,
} from "../lib/builder/e2b";

/** Kill the project's E2B sandbox and clear its connection state. */
export const destroy = internalAction({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    // Optional: pass directly when the project row is (being) deleted.
    sandboxId: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, userId, sandboxId }) => {
    const project = await ctx.runQuery(internal.projects.getProject, {
      projectId,
      userId,
    });
    const id = sandboxId ?? project?.sandboxId ?? null;
    if (id) {
      await killSandboxById(id);
    }
    // Only clear DB state when the project still exists (patch would throw).
    if (project !== null) {
      await ctx.runMutation(internal.projects.clearSandboxState, {
        projectId,
      });
    }
  },
});
export interface BuilderOutput {
  commentary: string;
  title: string;
  template: string;
  files: Array<{ filePath: string; fileContent: string }>;
  additionalDependencies: string[];
  installCommand: string;
}

const MAX_CONTEXT_MESSAGES = 12;

export const run = internalAction({
  args: { projectId: v.id("projects"), userId: v.id("users") },
  handler: async (ctx, { projectId, userId }) => {
    // ── 1. Load context ────────────────────────────────────────────────────
    const history = await ctx.runQuery(internal.projects.recentHistory, {
      projectId,
    });
    const currentFiles = await ctx.runQuery(
      internal.projects.getGeneratedFiles,
      { projectId },
    );

    const isFirstBuild = currentFiles.length === 0;

    // ── 2. Ask the model for structured output (fragments chat route) ─────
    const system = isFirstBuild ? toBuilderPrompt() : toEditPrompt();
    const messages: ChatMsg[] = [{ role: "system", content: system }];

    for (const m of history.slice(-MAX_CONTEXT_MESSAGES)) {
      messages.push({ role: m.role, content: m.content });
    }

    if (!isFirstBuild) {
      // Give the model the current state of the app (open-lovable apply flow).
      const fileDump = currentFiles
        .map((f) => `=== ${f.path} ===\n${f.content}`)
        .join("\n\n");
      messages.push({
        role: "user",
        content: `Here is the current state of the project files:\n\n${fileDump}`,
      });
    }

    let output: BuilderOutput;
    try {
      output = await generateJson<BuilderOutput>(messages);
      if (!Array.isArray(output.files) || output.files.length === 0) {
        throw new Error("model returned no files");
      }
      if (typeof output.commentary !== "string") output.commentary = "Done.";
      if (typeof output.title !== "string") output.title = "Update";
      if (!Array.isArray(output.additionalDependencies)) {
        output.additionalDependencies = [];
      }
      if (typeof output.installCommand !== "string") output.installCommand = "";
    } catch (err) {
      console.error("Builder generation failed:", err);
      await ctx.runMutation(internal.projects.appendAssistantMessage, {
        projectId,
        userId,
        reply:
          "Sorry — I couldn't generate the code just now. Please try rephrasing your request.",
      });
      await ctx.runMutation(internal.projects.setSandboxStatus, {
        projectId,
        status: "error",
      });
      return;
    }

    // ── 3. Ensure sandbox (open-lovable createSandbox + setupViteApp) ─────
    const project = await ctx.runQuery(internal.projects.getProject, {
      projectId,
      userId,
    });
    if (project === null) throw new Error("Project not found");

    await ctx.runMutation(internal.projects.setSandboxStatus, {
      projectId,
      status: "building",
    });

    let sandboxId: string;
    let previewUrl: string;
    try {
      const sbx = await ensureSandbox(project.sandboxId ?? null);
      sandboxId = sbx.sandboxId;
      previewUrl = sbx.previewUrl;

      // ── 4. Apply files (fragments: sbx.files.write) ─────────────────────
      await applyFiles(
        sandboxId,
        output.files.map((f) => ({
          path: f.filePath,
          content: f.fileContent,
        })),
      );

      // Install any extra deps the model asked for, then bounce Vite.
      if (
        output.additionalDependencies.length > 0 ||
        output.installCommand.trim()
      ) {
        await installPackages(
          sandboxId,
          output.installCommand ||
            `npm install ${output.additionalDependencies.join(" ")}`,
        );
      } else {
        await restartViteServer(sandboxId);
      }
    } catch (err) {
      console.error("Sandbox build failed:", err);
      await ctx.runMutation(internal.projects.appendAssistantMessage, {
        projectId,
        userId,
        reply: `I hit a snag setting up the sandbox: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
      await ctx.runMutation(internal.projects.setSandboxStatus, {
        projectId,
        status: "error",
      });
      return;
    }

    // ── 5. Persist results (assistant msg, files, preview URL) ───────────
    if (!previewUrl) {
      const indexFile = output.files.find((f) => f.filePath === "index.html");
      if (indexFile) {
        previewUrl =
          "data:text/html;charset=utf-8," +
          encodeURIComponent(indexFile.fileContent);
      }
    }

    await ctx.runMutation(internal.projects.saveBuild, {
      projectId,
      userId,
      commentary: output.commentary,
      title: output.title,
      files: output.files.map((f) => ({
        path: f.filePath,
        content: f.fileContent,
      })),
      sandboxId,
      previewUrl,
      isFirstBuild,
    });
  },
});
