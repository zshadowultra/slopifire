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
    await ctx.scheduler.runAfter(0, internal.ai.reply, {
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

/** Delete a project and its messages. */
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
    await ctx.db.delete(projectId);
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
