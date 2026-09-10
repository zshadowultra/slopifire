import { LovableHeart } from "@/components/LovableLogo";
import { Button } from "@/components/coss/button";
import {
  Drawer,
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerPopup,
} from "@/components/coss/drawer";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@/components/coss/menu";
import { useAuth } from "@/hooks/use-auth";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  AppWindow,
  ChevronDown,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  LogOut,
  Menu as MenuIcon,
  Mic,
  MoreHorizontal,
  Paperclip,
  Plus,
  RotateCw,
  Search,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { BubbleIn, MicroButton } from "@/components/micro";
import { Suspense, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function Chat() {
  useDarkMode(true);
  const { user, signOut } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPrompt = (
    location.state as { initialPrompt?: string } | null
  )?.initialPrompt;

  const messages = useQuery(api.projects.listMessages, {
    projectId: projectId as Id<"projects">,
  });
  const projects = useQuery(api.projects.listProjects, {});
  const sendMessage = useMutation(api.projects.sendMessage);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const project = (projects ?? []).find((p) => p._id === projectId);
  const displayName = user?.name || user?.email?.split("@")[0] || "there";

  // Send the initial prompt that started this project.
  const initialSentRef = useRef(false);
  useEffect(() => {
    if (initialPrompt && !initialSentRef.current) {
      initialSentRef.current = true;
      navigate(location.pathname, { replace: true, state: null });
      void handleSend(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages === undefined || messages === null ? 0 : messages.length]);

  const handleSend = async (text: string) => {
    const content = text.trim();
    if (!content || !projectId) return;
    setSending(true);
    setInput("");
    try {
      await sendMessage({ projectId: projectId as Id<"projects">, content });
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const suggestions = [
    "Build the app pages",
    "Add a homepage",
    "Wire up the admin",
  ];

  return (
    <div className="isolate-root flex h-dvh bg-background text-foreground">
      {/* Left column: chat (top bar, messages, composer) */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between px-4">
          <MicroButton>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open projects"
              className="flex size-12 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
            >
              <MenuIcon className="size-5" />
            </button>
          </MicroButton>

          <MicroButton>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex h-12 max-w-[55vw] items-center gap-2 rounded-full border border-border bg-card px-5 text-xl font-semibold hover:bg-accent"
            >
              <span className="truncate">
                {project?.name ?? "New project"}
              </span>
              <ChevronDown className="size-5 shrink-0 opacity-60" />
            </button>
          </MicroButton>

          <MicroButton>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              aria-label="Back to home"
              className="flex size-12 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </MicroButton>
        </header>

        {/* Messages */}
        <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
          {messages === undefined ? (
            <div className="flex items-center gap-2 pt-10 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : messages === null ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <LovableHeart size={48} />
              <p className="font-heading text-2xl font-semibold">
                Project not found
              </p>
              <p className="max-w-xs text-muted-foreground">
                This project doesn&apos;t exist or belongs to another workspace.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <LovableHeart size={48} />
              <p className="font-heading text-2xl font-semibold">
                Start the conversation
              </p>
              <p className="max-w-xs text-muted-foreground">
                Describe what you want to build and Lovable will get to work.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-5 pt-4">
              {messages.map((m: Doc<"messages">) => (
                <MessageBubble key={m._id} message={m} />
              ))}
              {project?.replyPending && (
                <div className="flex flex-col gap-2.5">
                  <p className="text-base text-muted-foreground">Thought for 1s</p>
                  <div className="flex items-center gap-2 text-lg text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    {project.sandboxStatus === "building"
                      ? "Building your app…"
                      : "Thinking…"}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </main>

        {/* Mobile: open the live preview in a new tab */}
        {project?.previewUrl && (
          <div className="px-4 pb-2 lg:hidden">
            <MicroButton>
              <a
                href={project.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-base font-medium transition-colors hover:bg-accent"
              >
                <AppWindow className="size-4" />
                Open live preview
                <ExternalLink className="size-4" />
              </a>
            </MicroButton>
          </div>
        )}

        {/* Suggestions + composer */}
        <div className="shrink-0 px-4 pb-5">
          <div className="no-scrollbar mb-3 flex gap-2.5 overflow-x-auto">
            {suggestions.map((s) => (
              <MicroButton key={s}>
                <button
                  type="button"
                  onClick={() => void handleSend(s)}
                  className="shrink-0 rounded-full border border-border bg-card px-4 py-2.5 text-base font-medium transition-colors hover:bg-accent"
                >
                  {s}
                </button>
              </MicroButton>
            ))}
          </div>

          <div className="rounded-[28px] border border-border bg-card shadow-lg shadow-black/10 dark:shadow-black/40">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(input);
                }
              }}
              placeholder="Ask Lovable…"
              rows={2}
              className="w-full resize-none bg-transparent px-5 pt-4 text-lg outline-none placeholder:text-muted-foreground/70"
            />
            <div className="flex items-center justify-between px-3.5 pb-3.5 pt-1">
              <div className="flex items-center gap-2">
                <MicroButton>
                  <button
                    type="button"
                    aria-label="Attach"
                    className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Plus className="size-5" />
                  </button>
                </MicroButton>
                <MicroButton>
                  <button
                    type="button"
                    aria-label="More"
                    className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <MoreHorizontal className="size-5" />
                  </button>
                </MicroButton>
              </div>
              <div className="flex items-center gap-2">
                <MicroButton>
                  <button
                    type="button"
                    className="flex h-10 items-center gap-1.5 rounded-full px-3 text-base font-medium transition-colors hover:bg-accent"
                  >
                    Build
                    <ChevronDown className="size-4 opacity-70" />
                  </button>
                </MicroButton>
                <MicroButton>
                  <button
                    type="button"
                    disabled={!input.trim() || sending}
                    onClick={() => void handleSend(input)}
                    aria-label="Send"
                    className="flex size-10 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
                  >
                    {sending ? (
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
        </div>
      </div>

      {/* Right column: live preview panel (fragments fragment-web pattern) */}
      <aside className="hidden min-h-0 w-[44%] max-w-[640px] shrink-0 flex-col border-l border-border lg:flex">
        <PreviewPanel
          previewUrl={project?.previewUrl ?? null}
          status={project?.sandboxStatus ?? "idle"}
          onReloadFrame={() => {}}
        />
      </aside>

      {/* Projects drawer */}
      <ProjectsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        activeProjectId={projectId}
        onNavigate={(id) => {
          setDrawerOpen(false);
          navigate(`/chat/${id}`);
        }}
        onHome={() => {
          setDrawerOpen(false);
          navigate("/dashboard");
        }}
        onSignOut={async () => {
          setDrawerOpen(false);
          await signOut();
          navigate("/");
        }}
        workspaceLabel={`${displayName}'s Lovable`}
        initial={displayName.charAt(0).toUpperCase()}
      />
    </div>
  );
}

/** Live preview panel with micro interactions on header controls. */
function PreviewPanel({
  previewUrl,
  status,
  onReloadFrame,
}: {
  previewUrl: string | null;
  status: "idle" | "building" | "running" | "error" | undefined;
  onReloadFrame?: () => void;
}) {
  const [frameKey, setFrameKey] = useState(0);
  const hasUrl = previewUrl !== null && previewUrl !== "";
  const building = status === "building";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Panel header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2.5">
          <AppWindow className="size-4.5 text-muted-foreground" />
          <span className="text-base font-semibold">Preview</span>
          {building && (
            <span className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-500">
              <Loader2 className="size-3 animate-spin" />
              Building…
            </span>
          )}
          {!building && status === "running" && hasUrl && (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
              Live
            </span>
          )}
          {status === "error" && (
            <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-500">
              Error
            </span>
          )}
        </div>
        {hasUrl && (
          <div className="flex items-center gap-1">
            <MicroButton onPress={onReloadFrame}>
              <button
                type="button"
                aria-label="Reload preview"
                onClick={() => setFrameKey((k) => k + 1)}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <RotateCw className="size-4" />
              </button>
            </MicroButton>
            <MicroButton>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open in new tab"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ExternalLink className="size-4" />
              </a>
            </MicroButton>
          </div>
        )}
      </div>

      {/* Preview body */}
      {hasUrl ? (
        <iframe
          key={frameKey}
          src={previewUrl}
          title="App preview"
          className="h-full w-full flex-1 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          {building ? (
            <>
              <Loader2 className="size-7 animate-spin text-muted-foreground" />
              <p className="font-heading text-lg font-semibold">
                Spinning up your sandbox…
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Creating an E2B microVM, installing dependencies and starting
                the dev server.
              </p>
            </>
          ) : (
            <>
              <AppWindow className="size-7 text-muted-foreground/50" />
              <p className="font-heading text-lg font-semibold">
                No preview yet
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Send a message and the generated app will appear here, running
                live in a cloud sandbox.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Doc<"messages"> }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-2">
        <BubbleIn>
          <div className="max-w-[80%] rounded-3xl rounded-br-lg bg-muted px-5 py-3.5 text-lg">
            {message.content}
          </div>
        </BubbleIn>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <MicroButton>
            <button
              type="button"
              aria-label="Duplicate"
              className="hover:text-foreground"
            >
              <Copy className="size-4" />
            </button>
          </MicroButton>
          <MicroButton>
            <button
              type="button"
              aria-label="Copy link"
              className="hover:text-foreground"
            >
              <Link2 className="size-4" />
            </button>
          </MicroButton>
          <MicroButton>
            <button
              type="button"
              aria-label="Attach"
              className="hover:text-foreground"
            >
              <Paperclip className="size-4" />
            </button>
          </MicroButton>
          <span>Today at {formatTime(message._creationTime)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {message.thoughtSeconds != null && (
        <p className="text-base text-muted-foreground">
          Thought for {message.thoughtSeconds}s
        </p>
      )}
      {message.fileCount != null && message.fileCount > 0 && (
        <BubbleIn>
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-500">
            <AppWindow className="size-4" />
            Updated {message.fileCount} file
            {message.fileCount === 1 ? "" : "s"}
          </p>
        </BubbleIn>
      )}
      <BubbleIn>
        <p className="whitespace-pre-wrap text-lg leading-relaxed">
          {message.content}
        </p>
      </BubbleIn>
      <div className="flex items-center gap-4 text-muted-foreground">
        <MicroButton>
          <button
            type="button"
            aria-label="Good response"
            className="hover:text-foreground"
          >
            <ThumbsUp className="size-4.5" />
          </button>
        </MicroButton>
        <MicroButton>
          <button
            type="button"
            aria-label="Poor response"
            className="hover:text-foreground"
          >
            <ThumbsDown className="size-4.5" />
          </button>
        </MicroButton>
        <MicroButton>
          <button
            type="button"
            aria-label="Duplicate"
            className="hover:text-foreground"
          >
            <Copy className="size-4.5" />
          </button>
        </MicroButton>
        <MicroButton>
          <button
            type="button"
            aria-label="More options"
            className="hover:text-foreground"
          >
            <MoreHorizontal className="size-4.5" />
          </button>
        </MicroButton>
      </div>
    </div>
  );
}

function ProjectsDrawer({
  open,
  onOpenChange,
  activeProjectId,
  onNavigate,
  onHome,
  onSignOut,
  workspaceLabel,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeProjectId?: string;
  onNavigate: (id: Id<"projects">) => void;
  onHome: () => void;
  onSignOut: () => Promise<void> | void;
  workspaceLabel: string;
  initial: string;
}) {
  const projects = useQuery(api.projects.listProjects, {});
  const [projectQuery, setProjectQuery] = useState("");

  const filtered = (projects ?? []).filter((p) =>
    p.name.toLowerCase().includes(projectQuery.trim().toLowerCase()),
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange} position="left">
      <DrawerPopup className="h-full w-[85vw] max-w-sm rounded-e-3xl border-border bg-card text-card-foreground">
        <DrawerHeader className="flex-row items-center gap-3 border-b border-border/60 pb-4">
          <MicroButton>
            <button
              type="button"
              onClick={onHome}
              aria-label="Home"
              className="flex size-12 items-center justify-center rounded-full border border-border bg-background hover:bg-accent"
            >
              <LovableHeart size={22} />
            </button>
          </MicroButton>
          <MicroButton>
            <button
              type="button"
              onClick={onHome}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background text-lg font-medium hover:bg-accent"
            >
              All projects
              <ChevronDown className="size-4 opacity-70" />
            </button>
          </MicroButton>
          <DrawerClose
            render={
              <MicroButton>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => onOpenChange(false)}
                  className="flex size-12 items-center justify-center rounded-full border border-border bg-background hover:bg-accent"
                />
              </MicroButton>
            }
          >
            <X className="size-5" />
          </DrawerClose>
        </DrawerHeader>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={projectQuery}
              onChange={(e) => setProjectQuery(e.target.value)}
              placeholder="Search projects"
              className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {projects === undefined ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <p className="pt-6 text-lg text-muted-foreground">
              No projects found.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {filtered.map((p: Doc<"projects">) => (
                <li key={p._id}>
                  <MicroButton>
                    <button
                      type="button"
                      onClick={() => onNavigate(p._id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-base font-medium transition-colors ${
                        p._id === activeProjectId
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/60"
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                    </button>
                  </MicroButton>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DrawerFooter className="flex-row items-center gap-3 border-t border-border/60 py-4">
          <MicroButton>
            <button
              type="button"
              onClick={onHome}
              className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full border border-border bg-background px-2 text-left hover:bg-accent"
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
          <MicroButton>
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
              <MenuPopup align="end" side="top" className="w-48">
                <MenuItem
                  className="px-3 py-2.5 text-base"
                  onClick={() => void onSignOut()}
                >
                  <LogOut className="size-4" /> Log out
                </MenuItem>
              </MenuPopup>
            </Menu>
          </MicroButton>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <Chat />
    </Suspense>
  );
}
