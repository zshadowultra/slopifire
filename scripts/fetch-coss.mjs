// One-off generator: fetch coss ui registry components and materialize them
// into src/components/coss/ with import paths rewritten for this project.
const BASE = "https://coss.com/ui/r";
const OUT_DIR = "src/components/coss";
const components = [
  "spinner",
  "input",
  "textarea",
  "otp-field",
  "drawer",
  "avatar",
  "separator",
  "badge",
  "menu",
  "popover",
  "scroll-area",
  "skeleton",
  "empty",
  "button",
  "switch",
  "tooltip",
  "use-media-query",
];

import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync(OUT_DIR, { recursive: true });

async function fetchJson(name) {
  const res = await fetch(`${BASE}/${name}.json`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json();
}

const seen = new Set();
const queue = [...components];
const fetched = [];

while (queue.length > 0) {
  const name = queue.shift();
  if (seen.has(name)) continue;
  seen.add(name);
  let item;
  try {
    item = await fetchJson(name);
  } catch (err) {
    console.error(`SKIP ${name}: ${err.message}`);
    continue;
  }
  fetched.push(name);
  // Queue registry dependencies (e.g. button -> spinner)
  for (const dep of item.registryDependencies ?? []) {
    const depName = dep.replace(/^@coss\//, "");
    if (!seen.has(depName)) queue.push(depName);
  }
  if (item.files) {
    for (const file of item.files) {
      const target = file.target ?? file.path ?? `${name}.tsx`;
      const fileName = target.split("/").pop();
      let content = file.content ?? "";
      // Rewrite registry lib/utils import to project alias
      content = content.replaceAll(
        "@/registry/default/lib/utils",
        "@/lib/utils",
      );
      // Rewrite registry ui imports to local coss dir
      content = content.replaceAll(
        /@\/registry\/default\/ui\//g,
        "./",
      );
      content = content.replaceAll(
        /"@\/registry\/default\/ui\/([^"]+)"/g,
        (_m, p1) => `"./${p1}"`,
      );
      // Hooks live one level up from components
      content = content.replaceAll(
        /"@\/registry\/default\/hooks\/([^"]+)"/g,
        (_m, p1) => `"../hooks/${p1}"`,
      );
      const outPath = `${OUT_DIR}/${fileName}`;
      writeFileSync(outPath, content);
      console.log(`WROTE ${outPath} (${content.length} bytes)`);
    }
  }
}

console.log(`Fetched: ${fetched.join(", ")}`);
