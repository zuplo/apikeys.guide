/**
 * Post-process dist/llms.txt to correct the root-doc link.
 *
 * Because the "What Are API Keys?" doc is mounted at path "/" via the
 * navigation config, Zudoku emits "/.md" as the markdown link for it in
 * llms.txt — which isn't a real URL. We publish the file as dist/index.md,
 * so rewrite the link to "/index.md" to match reality (and the path the
 * root-level middleware.ts redirects AI user-agents to).
 */
const fs = require("node:fs");
const path = require("node:path");

const dist = path.join(__dirname, "..", "dist");
const llmsTxt = path.join(dist, "llms.txt");

if (!fs.existsSync(llmsTxt)) {
  console.warn("postbuild: dist/llms.txt not found — did `zudoku build` run?");
  process.exit(0);
}

const original = fs.readFileSync(llmsTxt, "utf-8");
const patched = original.replace(/\/\.md\b/g, "/index.md");
if (patched !== original) {
  fs.writeFileSync(llmsTxt, patched);
  console.log("postbuild: fixed /.md → /index.md in dist/llms.txt");
}

// Ping IndexNow with the freshly built sitemap so Bing (and, by
// extension, ChatGPT's browse tool) picks up changes this deploy
// instead of on its next organic recrawl. The script is a no-op on
// non-production Vercel builds and on local builds.
require("./indexnow.cjs");
