/**
 * Builder template registry — adapted from e2b-dev/fragments (lib/templates.ts).
 * The replica builds Vite + React + Tailwind apps inside E2B sandboxes, matching
 * firecrawl/open-lovable's sandbox app setup.
 */

export interface BuilderTemplate {
  name: string;
  /** Public npm deps pre-installed in the sandbox app. */
  lib: string[];
  /** Entry file the AI edits most often. */
  file: string;
  /** Extra LLM instructions for this stack. */
  instructions: string;
  /** Port the Vite dev server listens on inside the sandbox. */
  port: number;
}

export const VITE_TEMPLATE_ID = "vite-react-developer" as const;

export const viteTemplate: BuilderTemplate = {
  name: "Vite React developer",
  lib: [
    "react@18.2.0",
    "react-dom@18.2.0",
    "vite@4.3.9",
    "@vitejs/plugin-react@4.0.0",
    "tailwindcss@3.3.0",
    "postcss@8.4.31",
    "autoprefixer@10.4.16",
  ],
  file: "src/App.jsx",
  instructions:
    "A Vite + React 18 app with Tailwind CSS that reloads automatically. Modern, beautiful, responsive UI.",
  port: 5173,
};

/** System-prompt fragment listing available templates (fragments-style). */
export function templatesToPrompt(): string {
  return `1. ${VITE_TEMPLATE_ID}: "${viteTemplate.instructions}". File: ${viteTemplate.file}. Dependencies installed: ${viteTemplate.lib.join(", ")}. Port: ${viteTemplate.port}.`;
}
