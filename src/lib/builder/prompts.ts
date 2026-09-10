/**
 * Builder system prompts — adapted from e2b-dev/fragments (lib/prompt.ts) and
 * open-lovable's generation/apply flows, tuned for the single Vite+React stack.
 */

import { templatesToPrompt, VITE_TEMPLATE_ID } from "./templates";
import { VITE_PORT } from "./sandbox-app";

/**
 * Prompt for the FIRST generation turn: the model returns a JSON object
 * matching the fragment schema (commentary, title, file_path, code).
 */
export function toBuilderPrompt(): string {
  return `You are a skilled software engineer.
You do not make mistakes.
Generate a fragment: a working web app for the user's request.
You can install additional dependencies by listing them in additionalDependencies.
Do not touch project dependency files like package.json or package-lock.json.
Do not wrap code in backticks.
Always break the lines correctly.
The app runs on a Vite dev server on port ${VITE_PORT}; expose the UI through src/App.jsx.
You must use the following template:
${templatesToPrompt()}
`;
}

/**
 * Prompt for FOLLOW-UP turns: the model receives the current file contents and
 * returns targeted edits (open-lovable "apply-ai-code" style).
 */
export function toEditPrompt(): string {
  return `You are an expert frontend engineer editing an existing Vite + React + Tailwind app.
You will receive the current contents of the project files.
Return ONLY a JSON object with your changes:
{
  "commentary": "one short sentence about what you changed",
  "title": "short title of the change, max 3 words",
  "files": [
    { "filePath": "relative/path.jsx", "fileContent": "full new file content" }
  ],
  "additionalDependencies": ["npm packages needed, empty array if none"],
  "installCommand": "npm command to install additionalDependencies, empty string if none"
}
Rules:
- Only include files you actually change; always return their FULL new content.
- Keep the app runnable; do not touch package.json, package-lock.json or vite.config.js.
- Do not wrap code in backticks.
`;
}

/** Parse the model's JSON response, tolerating markdown fences. */
export function parseBuilderJson<T>(raw: string): T {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }
  return JSON.parse(text) as T;
}

export { VITE_TEMPLATE_ID };
