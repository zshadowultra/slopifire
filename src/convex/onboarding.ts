import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

/** Save the style picked during onboarding and mark onboarding complete. */
export const completeOnboarding = mutation({
  args: { themeChoice: v.union(v.literal("light"), v.literal("dark")) },
  handler: async (ctx, { themeChoice }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return;
    await ctx.db.patch(userId, { themeChoice, onboardingComplete: true });
  },
});
