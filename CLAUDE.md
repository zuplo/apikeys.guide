## Project

apikeys.guide -- open-source documentation site about API key security. Built on [Zudoku](https://zudoku.dev) (React + Vite + Tailwind v4 + shadcn tokens), deployed to Vercel.

## Commands

```sh
pnpm dev                   # Dev server at localhost:4321 (regenerates custom.ts first)
pnpm build                 # Production build -> dist/ (zero errors required)
pnpm preview               # Serve the built dist/
pnpm gen:css               # Regenerate src/styles/custom.ts from custom-source.css
pnpm test                  # Playwright suite against auto-launched dev server
```

## Architecture

- **Content**: Markdown + MDX in `pages/docs/{section}/`. Frontmatter requires `title` (string); `description` is optional (keep under 155 chars). Zudoku auto-indexes via `docs.files` in `zudoku.config.tsx`.
- **Navigation**: Source of truth is `src/data/navigation.ts`. `zudoku.config.tsx` maps that shape into Zudoku's typed navigation. Update the data file and the sidebar + section grid + llms.txt all reflect it.
- **Components**: React components in `src/components/`. MDX-exposed components (`KeyAnatomy`, `SectionGrid`, `HomeCTA`, `HomeTitle`, `YouTubeEmbed`, `FAQ`, `HowTo`, `TLDR`) are registered in `zudoku.config.tsx > mdx.components` so any `.mdx` file can use them without importing. Slot components: `HeaderActions` (`head-navigation-end` slot) and `FooterBranding` (`footer-before` slot).
- **Layouts**: Zudoku owns the chrome (header, sidebar, TOC, prev/next). We do not write layouts ourselves. Custom chrome tweaks land in slots or `theme.customCss`.
- **Styling**: `src/styles/custom-source.css` is the human-edited stylesheet. It is stringified by `scripts/gen-css.cjs` into `src/styles/custom.ts` and fed to Zudoku via `theme.customCss`. The `gen:css` step runs automatically on `pnpm dev` and `pnpm build`.
- **Agent endpoints**: `docs.publishMarkdown: true` emits `/<slug>.md` siblings. `docs.llms.llmsTxt` and `llmsTxtFull` emit `/llms.txt` + `/llms-full.txt`. `scripts/postbuild.cjs` rewrites `/.md` to `/index.md` in `llms.txt` so the root doc's markdown link resolves.
- **AI user-agent redirect**: `middleware.ts` at the project root is untouched Vercel Edge Middleware; Vercel runs it at the platform level. It redirects known AI user-agents from `/` and `/docs/*` to the `.md` variants that Zudoku publishes.

## Design system

Two-tier palette:
  1. **Shadcn tokens** (`theme.light` / `theme.dark` in `zudoku.config.tsx`) — `background`, `foreground`, `primary`, `muted`, `accent`, `border`, etc. Drive Zudoku's own components.
  2. **`--akg-*` tokens** (in `custom-source.css`) — brand palette, fonts, prose/callout/KeyAnatomy specifics. Reference these when writing new MDX blocks or React components.

Fonts: Readex Pro (display, loaded via `<link>` tags in `SiteMeta.tsx`), DM Sans (sans, via `theme.fonts`), JetBrains Mono (mono, via `theme.fonts`). Readex Pro isn't `@import`ed in `custom-source.css` because Zudoku concatenates our CSS after its own, which would break a top-level `@import`.

## Content rules

- `.mdx` for any doc that embeds React components; `.md` for plain markdown.
- Don't add an h1 — Zudoku renders one from frontmatter `title`. Exception: the root intro doc hides the auto h1 in favor of the `<h1 class="akg-hero-title">API Keys</h1>` hero; this is handled in `custom-source.css`.
- All Zuplo links must include: `?ref=apikeys-guide&utm_source=apikeys-guide&utm_medium=web&utm_campaign=api-keys`.
- Don't add dependencies without a clear reason.

## Testing

- Playwright suite: `pnpm test` — auto-starts `zudoku dev --ssr false`, covers rendering, dark mode, typography, code block backgrounds, checkbox lists, and markdown/llms.txt endpoints.

## Known upstream issue

- `zudoku dev` with SSR enabled (default) crashes at render time on Zudoku 0.76.0 + React 19 with `TypeError: Cannot read properties of undefined (reading 'add')` inside `@zudoku/react-helmet-async`. Production (`pnpm build` + `pnpm preview`) prerenders cleanly. Workaround: `pnpm dev` and the Playwright webServer both pass `--ssr false` until this is fixed upstream.
