import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getFunctionName } from "convex/server";
import { generateAppForPrompt } from "./builder/app-templates";

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

export interface MockFile {
  _id: string;
  projectId: string;
  userId: string;
  path: string;
  content: string;
}

interface MockStoreState {
  currentUser: MockUser | null;
  projects: MockProject[];
  messages: MockMessage[];
  files: MockFile[];
}

const STORAGE_KEY = "slopifire_mock_store_v2";

function getInitialStore(): MockStoreState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.files) parsed.files = [];
      return parsed;
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

  const defaultApp = generateAppForPrompt(
    "Build a modern landing page for a creative design agency with animated cards, glowing gradients, and hero section.",
    "Creative Agency Landing Page"
  );

  const initialProject: MockProject = {
    _id: "proj_demo_1",
    _creationTime: Date.now() - 1800000,
    userId: "user_default",
    name: "Creative Agency Landing Page",
    isArchived: false,
    replyPending: false,
    sandboxStatus: "running",
    previewUrl:
      "data:text/html;charset=utf-8," +
      encodeURIComponent(defaultApp.previewHtml),
  };

  const initialFiles: MockFile[] = defaultApp.files.map((f, i) => ({
    _id: `file_demo_${i}`,
    projectId: "proj_demo_1",
    userId: "user_default",
    path: f.path,
    content: f.content,
  }));

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
      content: defaultApp.commentary,
      filePath: "src/App.jsx",
      fileCount: defaultApp.files.length,
      sandboxCreated: true,
    },
  ];

  return {
    currentUser: defaultUser,
    projects: [initialProject],
    messages: initialMessages,
    files: initialFiles,
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

  let fnName = "";
  try {
    fnName = getFunctionName(queryFn);
  } catch {
    fnName = String(queryFn?._name || queryFn?.name || queryFn || "");
  }

  // 1. Current user
  if (fnName === "users:currentUser" || fnName.includes("currentUser")) {
    return currentStore.currentUser;
  }

  // 2. List projects
  if (fnName === "projects:listProjects" || fnName.includes("listProjects")) {
    return [...currentStore.projects].sort(
      (a, b) => b._creationTime - a._creationTime,
    );
  }

  // 3. List files for project
  if (
    fnName === "projects:listFiles" ||
    fnName === "projects:getGeneratedFiles" ||
    fnName.includes("listFiles") ||
    fnName.includes("getGeneratedFiles")
  ) {
    const pId = args?.projectId;
    if (!pId) return [];
    return currentStore.files.filter((f) => f.projectId === pId);
  }

  // 4. List messages
  if (args && "projectId" in args) {
    const pId = args.projectId;
    const project = currentStore.projects.find((p) => p._id === pId);
    if (!project) return null;
    return currentStore.messages
      .filter((m) => m.projectId === pId)
      .sort((a, b) => a._creationTime - b._creationTime);
  }

  // Fallback heuristic:
  if (args && Object.keys(args).length === 0) {
    return [...currentStore.projects].sort(
      (a, b) => b._creationTime - a._creationTime,
    );
  }

  return currentStore.currentUser;
}

export function useMutation(_mutationFn?: any): any {
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
        currentStore.files = currentStore.files.filter(
          (f) => f.projectId !== args.projectId,
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

        // Generate app using offline template generator
        const generated = generateAppForPrompt(content, project.name);
        if (
          project.name === "Untitled" ||
          project.name === "Build a landing page"
        ) {
          project.name = generated.title;
        }

        setTimeout(() => {
          project.replyPending = false;
          project.sandboxStatus = "running";
          project.previewUrl =
            "data:text/html;charset=utf-8," +
            encodeURIComponent(generated.previewHtml);

          // Replace or append generated files
          currentStore.files = currentStore.files.filter(
            (f) => f.projectId !== pId,
          );
          generated.files.forEach((f, idx) => {
            currentStore.files.push({
              _id: `file_${pId}_${idx}_${Date.now()}`,
              projectId: pId,
              userId: currentStore.currentUser?._id || "user_default",
              path: f.path,
              content: f.content,
            });
          });

          const assistantMsg: MockMessage = {
            _id: "msg_" + Math.random().toString(36).substring(2, 9),
            _creationTime: Date.now(),
            projectId: pId,
            userId: currentStore.currentUser?._id || "user_default",
            role: "assistant",
            thoughtSeconds: 1,
            content: generated.commentary,
            filePath: "src/App.jsx",
            fileCount: generated.files.length,
            sandboxCreated: true,
          };
          currentStore.messages.push(assistantMsg);
          notify();
        }, 900);

        return;
      }
    },
    [],
  );
}

export function useAction(_actionFn?: any): any {
  return useCallback(async (_args?: any) => {
    return {};
  }, []);
}
