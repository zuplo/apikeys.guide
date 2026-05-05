const fs = require("fs");

const css = fs.readFileSync("src/styles/custom-source.css", "utf-8");
// Escape so the CSS can live inside a backtick-delimited TS template literal.
const escaped = css
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const header = [
  "// AUTO-GENERATED from src/styles/custom-source.css via scripts/gen-css.js.",
  "// Zudoku bundles zudoku.config.tsx with Vite in a browser-like context, so we",
  "// inline the stylesheet as a string rather than reading it off disk at runtime.",
  "",
  "export const customCss = `",
].join("\n");

const footer = "`;\n";

fs.writeFileSync("src/styles/custom.ts", header + escaped + footer);
console.log("wrote src/styles/custom.ts (" + css.length + " chars of CSS)");
