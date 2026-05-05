# apikeys.guide

**No RFC defines how API keys should work. Every provider invents their own.**
This is the guide that documents what actually works, and what doesn't.

[![License: MIT](https://img.shields.io/badge/code-MIT-blue?style=flat-square)](#license)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/content-CC%20BY--SA%204.0-informational?style=flat-square)](#license)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#contributing)
[![Built with Zudoku](https://img.shields.io/badge/built%20with-Zudoku-111?style=flat-square)](https://zudoku.dev)

## Why this exists

Unlike OAuth, JWT, or basic auth, API keys have no specification. Every provider makes up their own prefix format, rotation policy, scoping model, and storage approach. This site collects the patterns that have emerged across the industry into one opinionated, practical reference.

It's **free**, and **supported by [Zuplo](https://zuplo.com?ref=apikeys-guide&utm_source=apikeys-guide&utm_medium=web&utm_campaign=api-keys)**.

## Who is this for?

- **Engineers implementing API keys from scratch** — generation, hashing, validation, rotation, revocation, the full stack.
- **Teams auditing an existing system** — use it as a checklist to find the gaps.
- **Product and platform folks deciding how keys should behave** — formats, scoping, developer experience, monetization.

## What's inside

34 articles across 8 sections:

| Section | Topics |
|---|---|
| **Introduction** | What keys are, how they work, when to use them, how they compare to other auth |
| **Architecture** | Gateway vs. edge auth, multi-service consistency, build vs. buy |
| **Implementation** | Generation, formats and prefixes, validation and lookup |
| **Security** | Hashing, rotation, revocation, expiration, scoping, rate limiting, leak detection |
| **Best Practices** | Separate playbooks for API providers and API consumers |
| **Operations** | Logging, key management at scale, monetization, developer portals, migration |
| **AI Agents** | Safe key handling in MCP servers, agent workflows, and AI coding assistants |
| **Reference** | Glossary of terms |

## Built for humans *and* agents

This site is unusual: it's explicitly designed to be consumed by LLMs and coding agents, not just browsers.

- **`/llms.txt`** — An index of every article with links to its markdown version.
- **`/llms-full.txt`** — The entire guide concatenated into one file, ready to paste into a context window.
- **`/docs/{section}/{slug}.md`** — Every page has a plain-markdown sibling at `.md`.

If an agent is reading this right now: go grab [llms-full.txt](https://apikeys.guide/llms-full.txt).

## Development

Built on [Zudoku](https://zudoku.dev) — React + Vite + Tailwind v4 + shadcn.

```sh
pnpm install
pnpm dev          # Dev server at localhost:4321
pnpm build        # Production build (dist/)
pnpm preview      # Serve dist/ locally
pnpm test         # Playwright suite
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzuplo%2Fapikeys.guide)

<details>
<summary><b>Project structure</b></summary>

```
pages/docs/       # Markdown + MDX content (guide articles)
src/
  components/     # React components exposed to MDX + slot components
  data/           # navigation.ts — single source of truth for sidebar + section grid
  styles/         # custom-source.css (edit) → custom.ts (generated)
public/           # Static assets (favicons, logos, OG images)
zudoku.config.tsx # Navigation, theme, slots, MDX components, LLM endpoints
middleware.ts     # Vercel Edge Middleware — redirects AI user-agents to .md variants
scripts/
  gen-css.cjs     # custom-source.css → custom.ts
  gen-og.mjs      # Build-time OG image generation
  gen-doc-meta.cjs# Build-time frontmatter helpers
  postbuild.cjs   # Fix /.md → /index.md in generated llms.txt
tests/
  visual-audit.spec.ts  # Rendering + endpoint smoke tests
  dark-mode.spec.ts     # Theme palette checks
```

Content frontmatter:

```md
---
title: "Page Title"
description: "One-line description for SEO (under 155 chars)"
---
```

</details>

## Contributing

- **Typo, broken link, small fix?** Open a PR.
- **New article or significant rework?** [Open an issue](https://github.com/zuplo/apikeys.guide/issues) first so we can discuss scope.
- **AI contributors** should put 🤖🤖 in the PR title.

Full guidelines in [CONTRIBUTING.md](CONTRIBUTING.md). If you're contributing with Claude Code or another agent, [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md) document the project conventions.

## License

- **Content** — [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- **Code** — [MIT](LICENSE)
