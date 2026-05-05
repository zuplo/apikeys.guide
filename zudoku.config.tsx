import type { ZudokuConfig } from "zudoku";
import { navigation as nav } from "./src/data/navigation";
// MDX-exposed React components used inside markdown docs.
import KeyAnatomy from "./src/components/KeyAnatomy";
import SectionGrid from "./src/components/SectionGrid";
import HomeCTA from "./src/components/HomeCTA";
import HomeTitle from "./src/components/HomeTitle";
import YouTubeEmbed from "./src/components/YouTubeEmbed";
import FAQ from "./src/components/FAQ";
import HowTo from "./src/components/HowTo";
import TLDR from "./src/components/TLDR";
// Slot content for the header strip (GitHub link + PostHog init).
import HeaderActions from "./src/components/HeaderActions";
// Slot content for the footer's leading branding column.
import FooterBranding from "./src/components/FooterBranding";
// Custom stylesheet, kept as a TS module so zudoku.config.tsx bundles
// cleanly for Vite (no Node built-ins in the config file). Edit the
// human-readable CSS at src/styles/custom-source.css and regenerate via
// `pnpm gen:css` — part of the dev/build scripts.
import { customCss } from "./src/styles/custom";

/**
 * Translate our hand-rolled navigation model into Zudoku's typed nav array.
 *
 *  - Markdown files live at pages/docs/<section>/<slug>.md on disk, so the
 *    default Zudoku URL is /docs/<section>/<slug> — matching the existing site
 *    and what middleware.ts expects when rewriting to the .md variant.
 *  - The root doc (introduction/what-are-api-keys) is also mounted at "/" via
 *    an explicit `path` override so the homepage keeps its current URL.
 *  - Everything sits under a single top-level category so Zudoku renders a
 *    left sidebar (not a row of top-nav tabs).
 */

// Convert a doc href to Zudoku's file reference, which is the path relative
// to `docs.files` root without extension. Our files live under pages/docs/,
// so href "/docs/security/hashing-and-storage" -> "docs/security/hashing-and-storage".
const fileFor = (href: string) => href.replace(/^\//, "");

const sections = nav.map((section) => ({
  type: "category" as const,
  label: section.title,
  collapsible: false,
  items: section.items
    // Skip the root doc here — it's mounted explicitly below.
    .filter((i) => i.href !== "/")
    .map((i) => fileFor(i.href)),
}));

const config: ZudokuConfig = {
  canonicalUrlOrigin: "https://apikeys.guide",
  site: {
    title: "apikeys.guide",
    logo: {
      src: { light: "/logo-mark.svg", dark: "/logo-mark-dark.svg" },
      alt: "apikeys.guide",
      width: "32px",
    },
    footer: {
      columns: [
        {
          title: "Guide",
          links: [
            { label: "Introduction", href: "/" },
            { label: "Security", href: "/docs/security/hashing-and-storage" },
            { label: "Implementation", href: "/docs/implementation/key-generation" },
            { label: "Best Practices", href: "/docs/best-practices/for-providers" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "About", href: "/about" },
            { label: "GitHub", href: "https://github.com/zuplo/apikeys.guide" },
            { label: "Contribute", href: "https://github.com/zuplo/apikeys.guide/issues" },
          ],
        },
        {
          title: "Supported by",
          links: [
            {
              label: "Zuplo",
              href: "https://zuplo.com?ref=apikeys-guide&utm_source=apikeys-guide&utm_medium=web&utm_campaign=api-keys",
            },
          ],
        },
      ],
      social: [{ icon: "github", href: "https://github.com/zuplo/apikeys.guide" }],
      copyright: `© ${new Date().getFullYear()} apikeys.guide — An open-source project supported by Zuplo`,
    },
  },
  metadata: {
    // titleTemplate — Helmet replaces %s with the per-page <title> set by
    // Zudoku's MdxPage component (which pulls it from frontmatter `title`).
    title: "%s | apikeys.guide",
    // Used when a page doesn't set its own title (should be rare — every
    // doc has a frontmatter title — but covers the homepage cleanly).
    defaultTitle:
      "apikeys.guide — The missing guide to API key security",
    description:
      "The missing guide to API key security, implementation, and best practices.",
    favicon: "/favicon.svg",
    applicationName: "apikeys.guide",
    generator: "Zudoku",
    keywords: [
      "API keys",
      "API key security",
      "API authentication",
      "API key management",
      "API key rotation",
      "API key hashing",
      "API key best practices",
      "API gateway",
      "OAuth vs API keys",
      "MCP security",
    ],
    authors: ["Zuplo"],
    creator: "Zuplo",
    publisher: "Zuplo",
    robots: "index, follow",
  },
  sitemap: {
    siteUrl: "https://apikeys.guide",
    changefreq: "weekly",
    priority: 0.7,
  },
  theme: {
    // sans/mono come through Zudoku's Google Fonts loader; display is set in
    // customCss via an @import since theme.fonts has no `display` slot.
    fonts: {
      sans: "DM Sans",
      mono: "JetBrains Mono",
    },
    // Map our light/dark palette onto Zudoku's shadcn-style tokens. Values
    // mirror the originals in src/styles/global.css from the Astro site.
    light: {
      background: "#ffffff",
      foreground: "#222222",
      card: "#ffffff",
      cardForeground: "#222222",
      popover: "#ffffff",
      popoverForeground: "#222222",
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      secondary: "#f0f0f0",
      secondaryForeground: "#18181b",
      muted: "#f0f0f0",
      mutedForeground: "#45515e",
      accent: "#f0f0f0",
      accentForeground: "#18181b",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      border: "#e5e7eb",
      input: "#e5e7eb",
      ring: "#3b82f6",
      radius: "0.5rem",
    },
    dark: {
      background: "#0f1117",
      foreground: "#e2e4e9",
      card: "#0f1117",
      cardForeground: "#e2e4e9",
      popover: "#0f1117",
      popoverForeground: "#e2e4e9",
      primary: "#60a5fa",
      primaryForeground: "#0f1117",
      secondary: "#191c24",
      secondaryForeground: "#f1f3f5",
      muted: "#191c24",
      mutedForeground: "#9ca3af",
      accent: "#191c24",
      accentForeground: "#f1f3f5",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      border: "#2a2e3a",
      input: "#2a2e3a",
      ring: "#60a5fa",
      radius: "0.5rem",
    },
    customCss,
  },
  docs: {
    files: "/pages/**/*.{md,mdx}",
    publishMarkdown: true,
    llms: { llmsTxt: true, llmsTxtFull: true, includeProtected: false },
  },
  mdx: {
    // Register globally so any .mdx file can use these without importing.
    components: { KeyAnatomy, SectionGrid, HomeCTA, HomeTitle, YouTubeEmbed, FAQ, HowTo, TLDR },
  },
  navigation: [
    {
      type: "category",
      label: "Documentation",
      items: [
        {
          type: "doc",
          file: "docs/introduction/what-are-api-keys",
          path: "/",
          label: "What Are API Keys?",
        },
        ...sections,
      ],
    },
    // /about is reachable from the footer and from cross-links.
    {
      type: "doc",
      file: "docs/about",
      path: "/about",
      label: "About",
    },
  ],
  redirects: [
    { from: "/docs/introduction/what-are-api-keys", to: "/" },
    { from: "/docs/implementation/revocation", to: "/docs/security/revocation" },
  ],
  slots: {
    "head-navigation-end": HeaderActions,
    "footer-before": FooterBranding,
  },
};

export default config;
