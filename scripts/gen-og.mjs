/**
 * Per-page OG image generator.
 *
 * Reads the hand-authored navigation in src/data/navigation.ts, renders a
 * 1200x630 Satori tree for each page (logo + "apikeys.guide" wordmark +
 * page title), rasterises it to PNG via resvg, and writes to public/og/.
 *
 * Output layout mirrors the page URL:
 *   "/"                                  -> public/og/index.png
 *   "/docs/security/hashing-and-storage" -> public/og/docs/security/hashing-and-storage.png
 *
 * SiteMeta.tsx builds the <meta property="og:image"> URL from the current
 * route using the same mapping. Generated output is gitignored — Vercel
 * regenerates during `pnpm build`.
 *
 * This is intentionally a generic template for the logo + site name + page
 * title; a designed template will replace it later.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "og");

const WIDTH = 1200;
const HEIGHT = 630;

// Tokens lifted from zudoku.config.tsx's dark theme so the OG image is
// visually consistent with the site's dark mode.
const BG = "#0f1117";
const FG = "#f8fafc";
const MUTED = "#9ca3af";
const ACCENT = "#60a5fa";
const LOGO_BG = "#1d2938";

// Parse src/data/navigation.ts by regex. The file is hand-authored structured
// data with a stable shape — adding a TypeScript loader just to read it would
// be overkill. If the shape changes this will throw loudly.
function readPages() {
  const navText = readFileSync(join(root, "src/data/navigation.ts"), "utf-8");
  const pages = [];
  const seen = new Set();
  const pair = /\{\s*title:\s*"([^"]+)",\s*href:\s*"([^"]+)"\s*\}/g;
  let m;
  while ((m = pair.exec(navText)) !== null) {
    const [, title, href] = m;
    if (seen.has(href)) continue;
    seen.add(href);
    pages.push({ title, href });
  }
  if (pages.length === 0) {
    throw new Error("gen-og: could not parse any { title, href } entries from navigation.ts");
  }
  return pages;
}

// Resolve @fontsource/dm-sans's files dir via the package's package.json
// instead of a hardcoded node_modules path — survives pnpm hoisting.
// Fontsource v5 ships woff/woff2 only; Satori reads woff natively.
function loadFonts() {
  const pkgPath = require.resolve("@fontsource/dm-sans/package.json");
  const filesDir = join(dirname(pkgPath), "files");
  return [
    {
      name: "DM Sans",
      weight: 400,
      style: "normal",
      data: readFileSync(join(filesDir, "dm-sans-latin-400-normal.woff")),
    },
    {
      name: "DM Sans",
      weight: 700,
      style: "normal",
      data: readFileSync(join(filesDir, "dm-sans-latin-700-normal.woff")),
    },
  ];
}

// Plain-object element builder — avoids pulling in a JSX transform for one script.
function h(type, props = {}, ...children) {
  const flat = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
  return {
    type,
    props: {
      ...props,
      children: flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat,
    },
  };
}

// Inline copy of the key-mark path from public/logo-mark.svg, recoloured to
// use the accent blue on a slightly lighter card so it reads on the dark bg.
function logoMark() {
  return h(
    "svg",
    {
      width: 64,
      height: 64,
      viewBox: "0 0 32 32",
      xmlns: "http://www.w3.org/2000/svg",
    },
    h("rect", { width: 32, height: 32, rx: 8, fill: LOGO_BG }),
    h(
      "g",
      {
        transform: "translate(6 6)",
        fill: "none",
        stroke: ACCENT,
        "stroke-width": 1.8,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      h("path", {
        d: "M19 1l-2 2m-6.8 6.8a4.5 4.5 0 1 1-6.36 6.36 4.5 4.5 0 0 1 6.36-6.36zm0 0L14 6m0 0l2.5 2.5L20 5l-2.5-2.5m-3 3L17 3",
      }),
    ),
  );
}

function template(pageTitle, { isRoot = false } = {}) {
  return h(
    "div",
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: isRoot ? "center" : "space-between",
        alignItems: isRoot ? "center" : "stretch",
        padding: "72px 80px",
        backgroundColor: BG,
        backgroundImage:
          "radial-gradient(circle at 88% 12%, rgba(96,165,250,0.14) 0%, rgba(96,165,250,0) 55%)",
        color: FG,
        fontFamily: "DM Sans",
      },
    },
    isRoot
      ? // Root: centered logo + wordmark hero, accent bar + tagline below
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 36,
            },
          },
          h(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 32 } },
            // Scaled-up mark for the homepage
            h(
              "svg",
              {
                width: 128,
                height: 128,
                viewBox: "0 0 32 32",
                xmlns: "http://www.w3.org/2000/svg",
              },
              h("rect", { width: 32, height: 32, rx: 8, fill: LOGO_BG }),
              h(
                "g",
                {
                  transform: "translate(6 6)",
                  fill: "none",
                  stroke: ACCENT,
                  "stroke-width": 1.8,
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                },
                h("path", {
                  d: "M19 1l-2 2m-6.8 6.8a4.5 4.5 0 1 1-6.36 6.36 4.5 4.5 0 0 1 6.36-6.36zm0 0L14 6m0 0l2.5 2.5L20 5l-2.5-2.5m-3 3L17 3",
                }),
              ),
            ),
            h(
              "div",
              {
                style: {
                  fontSize: 128,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: FG,
                  lineHeight: 1,
                },
              },
              "apikeys.guide",
            ),
          ),
          h("div", {
            style: {
              width: 140,
              height: 6,
              borderRadius: 3,
              backgroundColor: ACCENT,
            },
          }),
          h(
            "div",
            { style: { fontSize: 30, fontWeight: 400, color: MUTED } },
            "The missing guide to API key security",
          ),
        )
      : null,
    !isRoot
      ? // Header row: logo mark + wordmark
        h(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 20 } },
          logoMark(),
          h(
            "div",
            {
              style: {
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: FG,
              },
            },
            "apikeys.guide",
          ),
        )
      : null,
    !isRoot
      ? // Hero: page title
        h(
          "div",
          {
            style: {
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: FG,
              maxWidth: 1040,
            },
          },
          pageTitle,
        )
      : null,
    !isRoot
      ? // Footer row: accent bar + tagline
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 18 } },
          h("div", {
            style: {
              width: 104,
              height: 6,
              borderRadius: 3,
              backgroundColor: ACCENT,
            },
          }),
          h(
            "div",
            { style: { fontSize: 26, fontWeight: 400, color: MUTED } },
            "The missing guide to API key security",
          ),
        )
      : null,
  );
}

function outPathFor(href) {
  if (href === "/") return join(outDir, "index.png");
  return join(outDir, href.replace(/^\//, "") + ".png");
}

async function main() {
  const pages = readPages();
  const fonts = loadFonts();
  mkdirSync(outDir, { recursive: true });

  for (const page of pages) {
    const svg = await satori(template(page.title, { isRoot: page.href === "/" }), {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    });
    const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
      .render()
      .asPng();
    const dest = outPathFor(page.href);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, png);
  }

  console.log(`gen-og: wrote ${pages.length} images to public/og/`);
}

main().catch((err) => {
  console.error("gen-og failed:", err);
  process.exit(1);
});
