import { LovableHeart, LovableWordmark } from "@/components/LovableLogo";
import LightRays from "@/components/LightRays";
import { Button } from "@/components/coss/button";
import { Badge } from "@/components/coss/badge";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Database,
  Github,
  MessagesSquare,
  Palette,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Suspense } from "react";
import { Link } from "react-router";

const features = [
  {
    icon: Sparkles,
    title: "Prompt to product",
    description:
      "Describe your idea in plain language and watch it become a working app with pages, data and auth.",
  },
  {
    icon: Palette,
    title: "Pick your style",
    description:
      "Choose light or dark during onboarding — your whole workspace follows the theme you pick.",
  },
  {
    icon: Database,
    title: "Databases & connectors",
    description:
      "Attach data sources, connect services and generate reports without leaving the chat.",
  },
  {
    icon: Bell,
    title: "Know when it's done",
    description:
      "Enable notifications and get pinged the moment your build finishes work in the background.",
  },
  {
    icon: MessagesSquare,
    title: "Chat-first editing",
    description:
      "Refine anything by asking. Suggestions like “Add a homepage” keep the momentum going.",
  },
  {
    icon: Rocket,
    title: "Ship in minutes",
    description:
      "Projects live in your workspace drawer, ready to reopen, rename and keep building.",
  },
];

const steps = [
  {
    step: "01",
    title: "Log in",
    description:
      "Continue with email and a 6-digit code, or hop in as a guest.",
  },
  {
    step: "02",
    title: "Pick your style",
    description:
      "A quick permission pass and a light/dark choice tune the workspace to you.",
  },
  {
    step: "03",
    title: "Say what to build",
    description:
      "The composer on the home screen turns your prompt into a project instantly.",
  },
];

function Landing() {
  useDarkMode(true);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      {/* LightRays (pulsating) backdrop */}
      <div className="absolute inset-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#FF6B4A"
          raysSpeed={1.3}
          lightSpread={0.95}
          rayLength={2.5}
          pulsating={true}
          fadeDistance={1.25}
          saturation={1.15}
          followMouse={false}
          mouseInfluence={0}
          noiseAmount={0.04}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/80" />

      <div className="isolate-root relative z-10">
        {/* Nav */}
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <LovableWordmark size={28} />
          <div className="flex items-center gap-3">
            <Button
              render={
                <Link to="/auth" />
              }
              variant="ghost"
              className="text-white/80 hover:bg-white/10 hover:text-white dark:bg-transparent dark:text-white/80"
            >
              Log in
            </Button>
            <Button
              render={
                <Link to="/auth?returnTo=%2Fdashboard" />
              }
              className="rounded-full bg-white font-semibold text-black hover:bg-white/90 dark:bg-white dark:text-black"
            >
              Start building
              <ArrowRight />
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="secondary"
              className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/80 dark:bg-white/10 dark:text-white/80"
            >
              <Sparkles className="size-3.5" />
              Idea in, app out
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-6 font-heading text-5xl font-semibold tracking-tight text-balance sm:text-7xl"
          >
            Build something{" "}
            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500 bg-clip-text text-transparent">
              Lovable
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-5 max-w-xl text-lg text-white/65 sm:text-xl"
          >
            Chat your way from “what should we build?” to a shipped product —
            with projects, permissions and a workspace that remembers your
            style.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button
              render={
                <Link to="/auth?returnTo=%2Fdashboard" />
              }
              size="xl"
              className="h-14 rounded-full bg-white px-8 text-lg font-semibold text-black hover:bg-white/90 dark:bg-white dark:text-black"
            >
              Start building free
              <ArrowRight />
            </Button>
            <Button
              render={
                <Link to="/auth" />
              }
              size="xl"
              variant="outline"
              className="h-14 rounded-full border-white/15 bg-white/5 px-8 text-lg text-white/80 hover:bg-white/10 hover:text-white dark:bg-white/5 dark:text-white/80"
            >
              <Github className="fill-current" />
              Continue with GitHub
            </Button>
          </motion.div>

          {/* Composer preview */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="mt-16 w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#1b1d24]/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur"
          >
            <div className="rounded-[22px] bg-black/40 p-5 text-left">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold">
                  V
                </span>
                <p className="text-lg font-medium">
                  What should we build, Vintage?
                </p>
              </div>
              <p className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-base text-white/60">
                Build a landing page
              </p>
              <div className="mt-3 flex items-center justify-between px-1">
                <span className="text-sm text-white/40">Build ⌄</span>
                <span className="text-sm text-white/40">Today at 5:41 PM</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <h2 className="font-heading text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything between prompt and product
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-white/60">
            The replica covers the full Lovable loop — login, onboarding,
            composer, projects and chat.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition-colors hover:bg-white/[0.07]"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/80 to-pink-600/80">
                  <f.icon className="size-5 text-white" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-white/60">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto w-full max-w-4xl px-6 pb-24">
          <div className="grid gap-5 sm:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur"
              >
                <span className="font-heading bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-4xl font-semibold text-transparent">
                  {s.step}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-white/60">
                  {s.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-4xl px-6 pb-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-10 text-center backdrop-blur sm:p-14"
          >
            <LovableHeart size={56} />
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Ready when you are
            </h2>
            <p className="max-w-md text-white/60">
              Sign in, pick your style, and type your first prompt. The rest is
              conversation.
            </p>
            <Button
              render={
                <Link to="/auth?returnTo=%2Fdashboard" />
              }
              size="xl"
              className="h-14 rounded-full bg-white px-10 text-lg font-semibold text-black hover:bg-white/90 dark:bg-white dark:text-black"
            >
              Open the app
              <ArrowRight />
            </Button>
          </motion.div>
        </section>

        <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
          A Lovable-style replica built with coss ui, Convex & LightRays.
        </footer>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-black">
          <div className="size-6 animate-pulse rounded-full bg-white/20" />
        </div>
      }
    >
      <Landing />
    </Suspense>
  );
}
