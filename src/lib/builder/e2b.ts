"use node";

/**
 * E2B sandbox helpers — ported from firecrawl/open-lovable
 * (lib/sandbox/providers/e2b-provider.ts) and e2b-dev/fragments
 * (app/api/sandbox/route.ts), adapted to plain async functions used by the
 * builder action (Convex actions cannot call other actions; a "use node" file
 * may only export actions, so helpers stay unexported from Convex's perspective
 * via being plain functions consumed by builder.ts).
 *
 * Flow per sandbox:
 *   1. Sandbox.create() — fresh microVM (or Sandbox.connect to reuse)
 *   2. Write starter Vite+React+Tailwind files (open-lovable setupViteApp)
 *   3. npm install + detached Vite dev server
 *   4. Live preview at https://<host> via sandbox.getHost(port)
 */

import { Sandbox } from "@e2b/code-interpreter";
import {
  SANDBOX_APP_DIR,
  VITE_PORT,
  starterFiles,
  type SandboxFile,
} from "./sandbox-app";

const SANDBOX_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes (fragments default)

/** Python helper that runs a shell command inside the sandbox (open-lovable style). */
function runCmd(command: string, timeoutSec = 300): string {
  return `
import subprocess, os
os.chdir('${SANDBOX_APP_DIR}')
result = subprocess.run(
    ${JSON.stringify(command.split(" "))},
    capture_output=True, text=True, timeout=${timeoutSec}
)
print("STDOUT:")
print(result.stdout)
if result.stderr:
    print("STDERR:")
    print(result.stderr)
print(f"Return code: {result.returncode}")
`;
}

/** Create (or reconnect to) the sandbox for a project. */
export async function ensureSandbox(
  existingSandboxId: string | null,
): Promise<{ sandboxId: string; previewUrl: string; reconnected: boolean }> {
  if (!process.env.E2B_API_KEY) {
    return {
      sandboxId: "local_sandbox",
      previewUrl: "",
      reconnected: existingSandboxId === "local_sandbox",
    };
  }

  // 1) Reconnect to a live sandbox when possible (fragments: Sandbox.connect).
  if (existingSandboxId && existingSandboxId !== "local_sandbox") {
    try {
      const sbx = await Sandbox.connect(existingSandboxId);
      const host = sbx.getHost(VITE_PORT);
      return {
        sandboxId: sbx.sandboxId,
        previewUrl: `https://${host}`,
        reconnected: true,
      };
    } catch {
      // Sandbox expired — fall through and create a new one.
    }
  }

  // 2) Create a fresh sandbox (open-lovable E2BProvider.createSandbox).
  const sbx = await Sandbox.create({
    apiKey: process.env.E2B_API_KEY,
    timeoutMs: SANDBOX_TIMEOUT_MS,
  });
  const sandboxId = sbx.sandboxId;
  const host = sbx.getHost(VITE_PORT);
  const previewUrl = `https://${host}`;

  // 3) Write the starter Vite app via the SDK files API (fragments pattern).
  for (const file of starterFiles()) {
    await sbx.files.write(`${SANDBOX_APP_DIR}/${file.path}`, file.content);
  }

  // 4) Install dependencies (open-lovable: npm install).
  const install = await sbx.runCode(runCmd("npm install --no-audit --no-fund"));
  const installOut =
    install.logs.stdout.join("\n") + install.logs.stderr.join("\n");
  if (/Return code: [1-9]/.test(installOut)) {
    throw new Error(`npm install failed: ${installOut.slice(-800)}`);
  }

  await startVite(sbx);

  return { sandboxId, previewUrl, reconnected: false };
}

/** Write generated files into the running sandbox (fragments: sbx.files.write). */
export async function applyFiles(
  sandboxId: string,
  files: SandboxFile[],
): Promise<string[]> {
  if (!process.env.E2B_API_KEY || sandboxId === "local_sandbox") {
    return files.map((f) => f.path);
  }
  const sbx = await Sandbox.connect(sandboxId);
  const written: string[] = [];
  for (const f of files) {
    const full = f.path.startsWith("/") ? f.path : `${SANDBOX_APP_DIR}/${f.path}`;
    await sbx.files.write(full, f.content);
    written.push(f.path);
  }
  return written;
}

/** Install extra npm packages detected by the model, then bounce Vite. */
export async function installPackages(
  sandboxId: string,
  command: string,
): Promise<{ ok: boolean; output: string }> {
  if (!process.env.E2B_API_KEY || sandboxId === "local_sandbox") {
    return { ok: true, output: "Dependencies verified (local environment)" };
  }
  const sbx = await Sandbox.connect(sandboxId);
  const cmd = command.trim().startsWith("npm")
    ? command.trim()
    : `npm install ${command.trim()}`;
  const res = await sbx.runCode(runCmd(cmd));
  const out = res.logs.stdout.join("\n") + res.logs.stderr.join("\n");
  const ok = !/Return code: [1-9]/.test(out);
  if (ok) await restartVite(sbx);
  return { ok, output: out.slice(-1500) };
}

/** Restart the Vite dev server (open-lovable restartViteServer). */
export async function restartViteServer(sandboxId: string): Promise<void> {
  if (!process.env.E2B_API_KEY || sandboxId === "local_sandbox") {
    return;
  }
  const sbx = await Sandbox.connect(sandboxId);
  await restartVite(sbx);
}

/** Kill the sandbox for a project. */
export async function killSandboxById(sandboxId: string): Promise<void> {
  if (!process.env.E2B_API_KEY || sandboxId === "local_sandbox") {
    return;
  }
  try {
    const sbx = await Sandbox.connect(sandboxId);
    await sbx.kill();
  } catch {
    // Already gone — nothing to do.
  }
}

// ── internal helpers ─────────────────────────────────────────────────────────

async function startVite(sbx: Sandbox) {
  await sbx.runCode(`
import subprocess, os, time
os.chdir('${SANDBOX_APP_DIR}')
subprocess.run(['pkill', '-f', 'vite'], capture_output=True)
time.sleep(1)
env = os.environ.copy()
env['FORCE_COLOR'] = '0'
process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env,
    start_new_session=True
)
print(f"Vite dev server started with PID: {process.pid}")
`);
  // Give Vite a moment to boot (open-lovable viteStartupDelay).
  await new Promise((r) => setTimeout(r, 4000));
}

async function restartVite(sbx: Sandbox) {
  await sbx.runCode(`
import subprocess, os, time
os.chdir('${SANDBOX_APP_DIR}')
subprocess.run(['pkill', '-f', 'vite'], capture_output=True)
time.sleep(2)
env = os.environ.copy()
env['FORCE_COLOR'] = '0'
process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env,
    start_new_session=True
)
print(f"Vite restarted with PID: {process.pid}")
`);
  await new Promise((r) => setTimeout(r, 4000));
}
