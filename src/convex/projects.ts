import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

/** List the current user's projects, newest first. */
export const listProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/** Create a new project (chat thread). Returns its id. */
export const createProject = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    return await ctx.db.insert("projects", { userId, name });
  },
});

/** List messages of a project in chronological order. */
export const listMessages = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const project = await ctx.db.get(projectId);
    if (project === null || project.userId !== userId) return null;
    return await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("asc")
      .collect();
  },
});

/** Append a user message and schedule the AI assistant reply. */
export const sendMessage = mutation({
  args: { projectId: v.id("projects"), content: v.string() },
  handler: async (ctx, { projectId, content }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const project = await ctx.db.get(projectId);
    if (project === null || project.userId !== userId) {
      throw new Error("Project not found");
    }
    const trimmed = content.trim();
    if (!trimmed) throw new Error("Message is empty");

    // First user message names the project, like Lovable's "Friendly Greetings"
    if (project.name === "Untitled") {
      const title = trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed;
      await ctx.db.patch(projectId, { name: title });
    }

    await ctx.db.insert("messages", {
      projectId,
      userId,
      role: "user",
      content: trimmed,
    });
    await ctx.db.patch(projectId, { replyPending: true });
    // Builder loop: LLM structured output → E2B sandbox → live preview.
    await ctx.scheduler.runAfter(0, internal.builder.run, {
      projectId,
      userId,
    });
  },
});

/** Rename a project. */
export const renameProject = mutation({
  args: { projectId: v.id("projects"), name: v.string() },
  handler: async (ctx, { projectId, name }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const project = await ctx.db.get(projectId);
    if (project === null || project.userId !== userId) {
      throw new Error("Project not found");
    }
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name is empty");
    await ctx.db.patch(projectId, { name: trimmed });
  },
});

/** Delete a project, its messages, generated files, and E2B sandbox. */
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const project = await ctx.db.get(projectId);
    if (project === null || project.userId !== userId) {
      throw new Error("Project not found");
    }
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    for (const msg of msgs) {
      await ctx.db.delete(msg._id);
    }
    const files = await ctx.db
      .query("generatedFiles")
      .withIndex("by_project_path", (q) => q.eq("projectId", projectId))
      .collect();
    for (const file of files) {
      await ctx.db.delete(file._id);
    }
    await ctx.db.delete(projectId);
    // Tear down the E2B sandbox in the background (best effort).
    if (project.sandboxId) {
      await ctx.scheduler.runAfter(0, internal.builder.destroy, {
        projectId,
        userId,
        sandboxId: project.sandboxId,
      });
    }
  },
});

/** Internal: project lookup guarded by ownership (sandbox actions use this). */
export const getProject = internalQuery({
  args: { projectId: v.id("projects"), userId: v.id("users") },
  handler: async (ctx, { projectId, userId }) => {
    const project = await ctx.db.get(projectId);
    if (project === null || project.userId !== userId) return null;
    return project;
  },
});

/** Internal: recent messages of the project (oldest → newest). */
export const recentHistory = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("asc")
      .collect();
    return msgs.map((m) => ({ role: m.role, content: m.content }));
  },
});

/** Internal: all generated source files for a project. */
export const getGeneratedFiles = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("generatedFiles")
      .withIndex("by_project_path", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

/** Internal: store the assistant reply and clear the pending flag. */
export const appendAssistantMessage = internalMutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    reply: v.string(),
  },
  handler: async (ctx, { projectId, userId, reply }) => {
    await ctx.db.insert("messages", {
      projectId,
      userId,
      role: "assistant",
      content: reply,
      thoughtSeconds: 1,
    });
    await ctx.db.patch(projectId, { replyPending: false });
  },
});

/** Internal: clear sandbox connection info (after kill or before rebuild). */
export const clearSandboxState = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    await ctx.db.patch(projectId, {
      sandboxId: undefined,
      previewUrl: undefined,
      sandboxStatus: "idle",
    });
  },
});

/** Internal: update just the sandbox status (used while building). */
export const setSandboxStatus = internalMutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("idle"),
      v.literal("building"),
      v.literal("running"),
      v.literal("error"),
    ),
  },
  handler: async (ctx, { projectId, status }) => {
    await ctx.db.patch(projectId, { sandboxStatus: status });
  },
});

/** Internal: persist a successful build (assistant msg, files, preview URL). */
export const saveBuild = internalMutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    commentary: v.string(),
    title: v.string(),
    files: v.array(v.object({ path: v.string(), content: v.string() })),
    sandboxId: v.string(),
    previewUrl: v.string(),
    isFirstBuild: v.boolean(),
  },
  handler: async (
    ctx,
    { projectId, userId, commentary, title, files, sandboxId, previewUrl, isFirstBuild },
  ) => {
    await ctx.db.insert("messages", {
      projectId,
      userId,
      role: "assistant",
      content: commentary,
      thoughtSeconds: 1,
      fileCount: files.length,
      sandboxCreated: isFirstBuild,
    });
    for (const f of files) {
      const existing = await ctx.db
        .query("generatedFiles")
        .withIndex("by_project_path", (q) =>
          q.eq("projectId", projectId).eq("path", f.path),
        )
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, { content: f.content });
      } else {
        await ctx.db.insert("generatedFiles", {
          projectId,
          userId,
          path: f.path,
          content: f.content,
        });
      }
    }
    await ctx.db.patch(projectId, {
      replyPending: false,
      sandboxId,
      previewUrl,
      sandboxStatus: "running",
    });
  },
});
