import { LovableHeart, LovableWordmark } from "@/components/LovableLogo";
import LightRays from "@/components/LightRays";
import { Button } from "@/components/coss/button";
import {
  Drawer,
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerPopup,
} from "@/components/coss/drawer";
import { MicroButton } from "@/components/micro";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/coss/empty";
import { Input } from "@/components/coss/input";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/coss/menu";
import { useAuth } from "@/hooks/use-auth";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ChevronDown,
  Database,
  FolderOpen,
  Loader2,
  LogOut,
  Menu as MenuIcon,
  Mic,
  Paperclip,
  Plus,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

function Home() {
  useDarkMode(true);
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const projects = useQuery(api.projects.listProjects, {});
  const createProject = useMutation(api.projects.createProject);

  // First-time users go through the style/permissions onboarding first.
  const onboardingReady =
    authLoading || (user ? user.onboardingComplete === true : false);
  useEffect(() => {
    if (!authLoading && user && user.onboardingComplete !== true) {
      navigate("/onboarding", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const displayName =
    user?.name || user?.email?.split("@")[0] || "there";

  const filteredProjects = useMemo(() => {
    if (!projects) return null;
    const q = prompt.trim().toLowerCase(); // reuse composer query for demo search
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, prompt]);

  const workspaceLabel = `${displayName}'s Lovable`;
  const initial = displayName.charAt(0).toUpperCase();

  const handleCreate = async (text: string) => {
    const content = text.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const projectId = await createProject({ name: "Untitled" });
      navigate(`/chat/${projectId}`, { state: { initialPrompt: content } });
    } catch (err) {
      console.error("Failed to create project:", err);
      setSubmitting(false);
    }
  };

  if (authLoading || !onboardingReady) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-black">
        <Loader2 className="size-6 animate-spin text-white/50" />
      </main>
    );
  }

  return (
    <div className="isolate-root relative flex h-dvh flex-col overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <LightRays
          raysOrigin="bottom-center"
          raysColor="#FF6B4A"
          raysSpeed={1.1}
          lightSpread={1.1}
          rayLength={2.8}
          pulsating={true}
          fadeDistance={1.3}
          saturation={1.05}
          followMouse={false}
          mouseInfluence={0}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-transparent" />

      {/* Top bar */}
      <header className="relative z-10 flex h-20 shrink-0 items-center justify-between px-5">
        <MicroButton>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open projects"
            className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] backdrop-blur transition-colors hover:bg-white/[0.12]"
          >
            <MenuIcon className="size-5 text-white/80" />
          </button>
        </MicroButton>
        <LovableWordmark size={30} />
        <span className="size-12" />
      </header>

      {/* Composer */}
      <main className="isolate-root relative z-10 flex flex-1 flex-col justify-center px-6 pb-24">
        <h1 className="font-heading text-4xl tracking-tight text-balance">
          What should we build, {displayName}?
        </h1>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-[#1b1d24]/90 shadow-2xl shadow-black/40 backdrop-blur">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleCreate(prompt);
              }
            }}
            placeholder="Build a landing page"
            rows={2}
            className="w-full resize-none bg-transparent px-6 pt-5 text-lg text-white placeholder:text-white/35 outline-none"
          />
          <div className="flex items-center justify-between px-4 pb-4 pt-1">
            <Menu>
              <MenuTrigger
                render={
                  <button
                    type="button"
                    aria-label="Attach"
                    className="flex size-10 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  />
                }
              >
                <Plus className="size-5" />
              </MenuTrigger>
              <MenuPopup
                align="start"
                sideOffset={8}
                className="w-72 rounded-2xl border-white/10 bg-[#232530] p-2 text-white shadow-2xl"
              >
                <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-white/40">
                  <Search className="size-4" />
                  <input
                    placeholder="Search…"
                    className="w-full bg-transparent text-base outline-none placeholder:text-white/35"
                  />
                </div>
                <MenuItem className="mt-1 rounded-xl px-3 py-3 text-base font-medium hover:bg-white/10">
                  <Paperclip className="size-4" /> Attach
                </MenuItem>
                <MenuItem className="rounded-xl px-3 py-3 text-base font-medium hover:bg-white/10">
                  <Settings2 className="size-4" /> Connectors
                  <ChevronDown className="ml-auto size-4 -rotate-90 opacity-60" />
                </MenuItem>
                <MenuItem className="rounded-xl px-3 py-3 text-base font-medium hover:bg-white/10">
                  <Database className="size-4" /> Databases
                  <ChevronDown className="ml-auto size-4 -rotate-90 opacity-60" />
                </MenuItem>
              </MenuPopup>
            </Menu>

            <div className="flex items-center gap-3">
              <MicroButton>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2 text-lg font-medium text-white hover:text-white/80"
                >
                  Build
                  <ChevronDown className="size-4 opacity-70" />
                </button>
              </MicroButton>
              <MicroButton>
                <button
                  type="button"
                  aria-label="Voice input"
                  className="flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10"
                >
                  <Mic className="size-5" />
                </button>
              </MicroButton>
              <MicroButton>
                <button
                  type="button"
                  disabled={!prompt.trim() || submitting}
                  onClick={() => void handleCreate(prompt)}
                  aria-label="Send"
                  className="flex size-10 items-center justify-center rounded-full bg-white text-black transition-opacity disabled:opacity-30"
                >
                  {submitting ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  )}
                </button>
              </MicroButton>
            </div>
          </div>
        </div>
      </main>

      {/* Projects drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} position="left">
        <DrawerPopup className="h-full w-[85vw] max-w-sm rounded-e-3xl border-white/10 bg-[#1b1c22] text-white">
          <DrawerHeader className="flex-row items-center justify-between gap-3 border-b border-white/5 pb-4">
            <button
              type="button"
              aria-label="Search projects"
              className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/10"
            >
              <Search className="size-5 text-white/80" />
            </button>
            <button
              type="button"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] text-lg font-medium hover:bg-white/10"
            >
              All projects
              <ChevronDown className="size-4 opacity-70" />
            </button>
            <DrawerClose
              render={
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setDrawerOpen(false)}
                  className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/10"
                />
              }
            >
              <X className="size-5 text-white/80" />
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {filteredProjects === null ? (
              <div className="flex items-center gap-2 text-white/40">
                <Loader2 className="size-4 animate-spin" /> Loading…
              </div>
            ) : filteredProjects.length === 0 ? (
              <Empty className="py-16 text-white">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FolderOpen className="size-6 text-white/40" />
                  </EmptyMedia>
                  <EmptyTitle className="text-2xl">
                    No projects found.
                  </EmptyTitle>
                  <EmptyDescription className="text-white/50">
                    Start a build from the home screen and it will show up
                    here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="flex flex-col gap-2">
                {filteredProjects.map((p: Doc<"projects">) => (
                  <li key={p._id}>
                    <ProjectRow
                      projectId={p._id}
                      name={p.name}
                      onOpen={(id) => {
                        setDrawerOpen(false);
                        navigate(`/chat/${id}`);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DrawerFooter className="flex-row items-center gap-3 border-t border-white/5 py-4">
            <MicroButton>
              <button
                type="button"
                className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-2 text-left hover:bg-white/10"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-600 text-base font-semibold text-white">
                  {initial}
                </span>
                <span className="min-w-0 flex-1 truncate text-base font-medium">
                  {workspaceLabel}
                </span>
                <ChevronDown className="me-2 size-4 shrink-0 opacity-60" />
              </button>
            </MicroButton>
            <Menu>
              <MenuTrigger
                render={
                  <button
                    type="button"
                    aria-label="Account"
                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-pink-600 text-lg font-semibold text-white hover:bg-pink-500"
                  />
                }
              >
                {initial}
              </MenuTrigger>
              <MenuPopup
                align="end"
                side="top"
                className="w-48 rounded-2xl border-white/10 bg-[#232530] text-white"
              >
                <MenuItem
                  className="rounded-xl px-3 py-2.5 text-base hover:bg-white/10"
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                >
                  <LogOut className="size-4" /> Log out
                </MenuItem>
                <MenuSeparator className="bg-white/10" />
                <MenuItem className="rounded-xl px-3 py-2.5 text-base text-white/70 hover:bg-white/10">
                  <Settings2 className="size-4" /> Settings
                </MenuItem>
              </MenuPopup>
            </Menu>
          </DrawerFooter>
        </DrawerPopup>
      </Drawer>
    </div>
  );
}

function ProjectRow({
  projectId,
  name,
  onOpen,
}: {
  projectId: Id<"projects">;
  name: string;
  onOpen: (id: Id<"projects">) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(name);
  const renameProject = useMutation(api.projects.renameProject);
  const deleteProject = useMutation(api.projects.deleteProject);

  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 transition-colors hover:bg-white/[0.07]">
      {renaming ? (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={async () => {
            if (draft.trim() && draft !== name) {
              await renameProject({ projectId, name: draft.trim() });
            }
            setRenaming(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-9 rounded-lg border-white/15 bg-white/10 text-base"
        />
      ) : (
        <MicroButton>
          <button
            type="button"
            onClick={() => onOpen(projectId)}
            className="min-w-0 flex-1 text-left text-base font-medium text-white/90"
          >
            {name}
          </button>
        </MicroButton>
      )}
      <Menu>
        <MenuTrigger
          render={
            <button
              type="button"
              aria-label="Project options"
              className="flex size-8 items-center justify-center rounded-lg opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100"
            />
          }
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 fill-current text-white/70"
          >
            <circle cx="5" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="19" cy="12" r="1.8" />
          </svg>
        </MenuTrigger>
        <MenuPopup
          align="end"
          className="w-40 rounded-2xl border-white/10 bg-[#232530] text-white"
        >
          <MenuItem
            className="rounded-xl px-3 py-2.5 text-base hover:bg-white/10"
            onClick={() => {
              setDraft(name);
              setRenaming(true);
            }}
          >
            Rename
          </MenuItem>
          <MenuItem
            className="rounded-xl px-3 py-2.5 text-base text-red-400 hover:bg-white/10"
            onClick={() => void deleteProject({ projectId })}
          >
            Delete
          </MenuItem>
        </MenuPopup>
      </Menu>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-black">
          <Loader2 className="size-6 animate-spin text-white/50" />
        </div>
      }
    >
      <Home />
    </Suspense>
  );
}
