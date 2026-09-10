import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

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

/** Append a user message and schedule the assistant reply generation. */
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
    await ctx.scheduler.runAfter(0, internal.projects.generateReply, {
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

/** Internal: naive "assistant" reply so the demo chat feels alive. */
export const generateReply = internalMutation({
  args: { projectId: v.id("projects"), userId: v.id("users") },
  handler: async (ctx, { projectId, userId }) => {
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("asc")
      .collect();
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUser) return;

    const reply = buildReply(lastUser.content);
    await ctx.db.insert("messages", {
      projectId,
      userId,
      role: "assistant",
      content: reply,
      thoughtSeconds: 1,
    });
  },
});

function buildReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/^(hi|hello|hey|yo|sup)\b/.test(p)) {
    return "Hi there! How can I help you today?";
  }
  if (p.includes("landing")) {
    return `Great choice! I sketched a landing page with a hero, feature grid, and call-to-action.\n\nSuggested structure:\n• Sticky nav with logo + CTA\n• Hero with headline and product screenshot\n• 3-column feature highlights\n• Footer with links and social icons\n\nWant me to build all of these sections now?`;
  }
  if (p.includes("dashboard") || p.includes("admin")) {
    return `I can wire up a dashboard with cards for key metrics, a sidebar navigation, and a data table.\n\nShall I go ahead and create the pages?`;
  }
  if (p.includes("report")) {
    return `I can generate a report view with filters, charts, and export to CSV. Which data source should it read from?`;
  }
  return `Got it — "${prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt}". I've noted this for the build. Tell me a bit more about the screens you need, or say "build it" and I'll scaffold the pages.`;
}
