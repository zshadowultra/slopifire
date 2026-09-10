import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Types matching Convex schema
export interface MockUser {
  _id: string;
  _creationTime: number;
  name?: string;
  image?: string;
  email?: string;
  emailVerificationTime?: number;
  isAnonymous?: boolean;
  role?: "admin" | "user" | "member";
  themeChoice?: "light" | "dark";
  onboardingComplete?: boolean;
}

export interface MockProject {
  _id: string;
  _creationTime: number;
  userId: string;
  name: string;
  isArchived?: boolean;
  replyPending?: boolean;
  sandboxId?: string;
  previewUrl?: string;
  sandboxStatus?: "idle" | "building" | "running" | "error";
}

export interface MockMessage {
  _id: string;
  _creationTime: number;
  projectId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  thoughtSeconds?: number;
  filePath?: string;
  fileCount?: number;
  sandboxCreated?: boolean;
}

interface MockStoreState {
  currentUser: MockUser | null;
  projects: MockProject[];
  messages: MockMessage[];
}

const STORAGE_KEY = "slopifire_mock_store_v1";

function generatePreviewHtml(title: string, prompt: string): string {
  const safeTitle = title.replace(/"/g, "&quot;");
  const safePrompt = prompt.replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="bg-[#0f1117] text-white min-h-screen flex flex-col">
  <header class="border-b border-white/10 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="size-7 rounded-lg bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center font-bold text-xs">S</div>
      <span class="font-semibold text-sm tracking-tight">${safeTitle}</span>
    </div>
    <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Live Sandbox</span>
  </header>

  <main class="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 flex flex-col justify-center">
    <div class="inline-block mb-3">
      <span class="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-orange-400 border border-white/15">
        Generated Application
      </span>
    </div>
    <h1 class="text-3xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
      ${safeTitle}
    </h1>
    <p class="text-white/60 text-base md:text-lg mb-8 max-w-xl">
      Prompt: "${safePrompt}"
    </p>

    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
      <div class="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <h3 class="font-semibold text-lg">Interactive Demo</h3>
        <span class="text-xs text-white/40" id="item-count">3 items active</span>
      </div>
      
      <div class="flex gap-2 mb-4">
        <input id="demo-input" type="text" placeholder="Add an item or interaction..." 
          class="flex-1 bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 transition" />
        <button id="demo-btn" 
          class="bg-white text-black font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/90 transition shadow-md">
          Add
        </button>
      </div>

      <ul id="demo-list" class="space-y-2">
        <li class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition">
          <span class="text-sm font-medium">Core application scaffolding</span>
          <span class="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>
        </li>
        <li class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition">
          <span class="text-sm font-medium">Component UI & Responsive layout</span>
          <span class="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>
        </li>
        <li class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition">
          <span class="text-sm font-medium">State management & real-time preview</span>
          <span class="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">Active</span>
        </li>
      </ul>
    </div>
  </main>

  <script>
    const input = document.getElementById('demo-input');
    const btn = document.getElementById('demo-btn');
    const list = document.getElementById('demo-list');
    const count = document.getElementById('item-count');

    function updateCount() {
      count.textContent = list.children.length + ' items active';
    }

    btn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) return;
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition';
      li.innerHTML = '<span class="text-sm font-medium">' + val.replace(/</g, '&lt;') + '</span><span class="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Just added</span>';
      list.prepend(li);
      input.value = '';
      updateCount();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btn.click();
    });
  </script>
</body>
</html>`;
}

function getInitialStore(): MockStoreState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage not accessible
  }

  const defaultUser: MockUser = {
    _id: "user_default",
    _creationTime: Date.now() - 3600000,
    name: "Vintage",
    email: "vintage@slopifire.dev",
    themeChoice: "dark",
    onboardingComplete: true,
    isAnonymous: false,
  };

  const initialProject: MockProject = {
    _id: "proj_demo_1",
    _creationTime: Date.now() - 1800000,
    userId: "user_default",
    name: "Build a landing page",
    isArchived: false,
    replyPending: false,
    sandboxStatus: "running",
    previewUrl:
      "data:text/html;charset=utf-8," +
      encodeURIComponent(
        generatePreviewHtml(
          "Creative Agency Landing Page",
          "Build a modern landing page with animated cards and glowing gradients",
        ),
      ),
  };

  const initialMessages: MockMessage[] = [
    {
      _id: "msg_1",
      _creationTime: Date.now() - 1800000,
      projectId: "proj_demo_1",
      userId: "user_default",
      role: "user",
      content:
        "Build a modern landing page for a creative design agency with animated cards, glowing gradients, and hero section.",
    },
    {
      _id: "msg_2",
      _creationTime: Date.now() - 1795000,
      projectId: "proj_demo_1",
      userId: "user_default",
      role: "assistant",
      thoughtSeconds: 1,
      content:
        "I've built the modern creative design agency landing page featuring an eye-catching hero banner, interactive workspace card, and responsive layout.",
      filePath: "src/App.jsx",
      fileCount: 3,
      sandboxCreated: true,
    },
  ];

  return {
    currentUser: defaultUser,
    projects: [initialProject],
    messages: initialMessages,
  };
}

// Global listener set for reactive updates across components
type Listener = () => void;
const listeners = new Set<Listener>();

const currentStore: MockStoreState = getInitialStore();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStore));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export class ConvexReactClient {
  url: string;
  constructor(url?: string) {
    this.url = url || "";
  }
}

interface MockConvexContextValue {
  store: MockStoreState;
}

const MockConvexContext = createContext<MockConvexContextValue>({
  store: currentStore,
});

export function ConvexAuthProvider({
  children,
}: {
  client?: unknown;
  children: ReactNode;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const value = useMemo(() => ({ store: currentStore }), []);

  return (
    <MockConvexContext.Provider value={value}>
      {children}
    </MockConvexContext.Provider>
  );
}

export const ConvexProvider = ConvexAuthProvider;

export function useConvexAuth() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    isLoading: false,
    isAuthenticated: currentStore.currentUser !== null,
  };
}

export function useAuthActions() {
  const signIn = useCallback(async (provider: string, formData?: FormData) => {
    if (provider === "anonymous") {
      currentStore.currentUser = {
        _id: "user_" + Math.random().toString(36).substring(2, 9),
        _creationTime: Date.now(),
        name: "Guest Builder",
        email: "guest@slopifire.dev",
        isAnonymous: true,
        onboardingComplete: false,
        themeChoice: "dark",
      };
      notify();
      return;
    }

    if (provider === "email-otp" && formData) {
      const email = (formData.get("email") as string) || "user@example.com";
      const code = formData.get("code") as string;
      if (code) {
        currentStore.currentUser = {
          _id: "user_" + Math.random().toString(36).substring(2, 9),
          _creationTime: Date.now(),
          name: email.split("@")[0],
          email,
          isAnonymous: false,
          onboardingComplete: false,
          themeChoice: "dark",
        };
        notify();
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    currentStore.currentUser = null;
    notify();
  }, []);

  return { signIn, signOut };
}

export function useAuthToken() {
  return "mock-auth-token";
}

export function useQuery(queryFn: any, args?: any): any {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // Determine query type by args or function shape
  if (args && "projectId" in args) {
    // api.projects.listMessages
    const pId = args.projectId;
    const project = currentStore.projects.find((p) => p._id === pId);
    if (!project) return null;
    return currentStore.messages
      .filter((m) => m.projectId === pId)
      .sort((a, b) => a._creationTime - b._creationTime);
  }

  // If query is projects.listProjects
  // Can identify by absence of args or currentUser check
  if (queryFn?._name?.includes("currentUser") || (!args && !queryFn)) {
    return currentStore.currentUser;
  }

  // Default: listProjects or currentUser
  // In Dashboard and Chat:
  // const user = useQuery(api.users.currentUser);
  // const projects = useQuery(api.projects.listProjects, {});
  // Let's distinguish by string representation or property if available
  const queryStr = String(queryFn?._name || queryFn?.name || queryFn || "");
  if (queryStr.includes("currentUser")) {
    return currentStore.currentUser;
  }
  if (queryStr.includes("listProjects")) {
    return [...currentStore.projects].sort(
      (a, b) => b._creationTime - a._creationTime,
    );
  }

  // Fallback heuristic:
  // If args is empty object {}, it's listProjects!
  if (args && Object.keys(args).length === 0) {
    return [...currentStore.projects].sort(
      (a, b) => b._creationTime - a._creationTime,
    );
  }

  return currentStore.currentUser;
}

export function useMutation(mutationFn: any): any {
  return useCallback(
    async (args: any) => {
      // 1. completeOnboarding: { themeChoice: "light" | "dark" }
      if (args && "themeChoice" in args) {
        if (currentStore.currentUser) {
          currentStore.currentUser.themeChoice = args.themeChoice;
          currentStore.currentUser.onboardingComplete = true;
          notify();
        }
        return;
      }

      // 2. createProject: { name: string }
      if (args && "name" in args && !("projectId" in args)) {
        const newProjId = "proj_" + Math.random().toString(36).substring(2, 9);
        const newProj: MockProject = {
          _id: newProjId,
          _creationTime: Date.now(),
          userId: currentStore.currentUser?._id || "user_default",
          name: args.name || "Untitled",
          isArchived: false,
          replyPending: false,
          sandboxStatus: "idle",
          previewUrl: "",
        };
        currentStore.projects.unshift(newProj);
        notify();
        return newProjId;
      }

      // 3. renameProject: { projectId: string, name: string }
      if (args && "projectId" in args && "name" in args) {
        const p = currentStore.projects.find((pr) => pr._id === args.projectId);
        if (p) {
          p.name = args.name.trim();
          notify();
        }
        return;
      }

      // 4. deleteProject: { projectId: string }
      if (args && "projectId" in args && Object.keys(args).length === 1) {
        currentStore.projects = currentStore.projects.filter(
          (pr) => pr._id !== args.projectId,
        );
        currentStore.messages = currentStore.messages.filter(
          (m) => m.projectId !== args.projectId,
        );
        notify();
        return;
      }

      // 5. sendMessage: { projectId: string, content: string }
      if (args && "projectId" in args && "content" in args) {
        const pId = args.projectId;
        const project = currentStore.projects.find((pr) => pr._id === pId);
        if (!project) throw new Error("Project not found");

        const content = args.content.trim();
        if (project.name === "Untitled") {
          project.name =
            content.length > 40 ? content.slice(0, 40) + "…" : content;
        }

        const userMsg: MockMessage = {
          _id: "msg_" + Math.random().toString(36).substring(2, 9),
          _creationTime: Date.now(),
          projectId: pId,
          userId: currentStore.currentUser?._id || "user_default",
          role: "user",
          content,
        };
        currentStore.messages.push(userMsg);
        project.replyPending = true;
        project.sandboxStatus = "building";
        notify();

        // Simulate AI thinking and sandbox building
        setTimeout(() => {
          project.replyPending = false;
          project.sandboxStatus = "running";
          project.previewUrl =
            "data:text/html;charset=utf-8," +
            encodeURIComponent(generatePreviewHtml(project.name, content));

          const assistantMsg: MockMessage = {
            _id: "msg_" + Math.random().toString(36).substring(2, 9),
            _creationTime: Date.now(),
            projectId: pId,
            userId: currentStore.currentUser?._id || "user_default",
            role: "assistant",
            thoughtSeconds: 1,
            content: `I've updated **${project.name}** with the changes you requested. The components and styles have been applied and are running in the live preview.`,
            filePath: "src/App.jsx",
            fileCount: 3,
            sandboxCreated: true,
          };
          currentStore.messages.push(assistantMsg);
          notify();
        }, 1200);

        return;
      }
    },
    [mutationFn],
  );
}

export function useAction(actionFn: any): any {
  return useCallback(async (args: any) => {
    return {};
  }, []);
}
