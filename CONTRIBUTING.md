# Contributing to apikeys.guide

## Ways to contribute

- **Fix errors or report issues** -- Open a PR for corrections, open an issue for bugs and suggestions.
- **Improve content** -- Expand an article, add code examples, or clarify confusing sections.
- **Write new articles** -- Open an issue first to discuss scope.

## Content guidelines

- Write for developers. Be practical, not theoretical.
- Use code examples. Include language tags on code blocks.
- Keep articles focused. One topic per page.
- Use h2 for major sections, h3 for subsections. Don't add h1 (rendered from frontmatter).
- Link to other articles in the guide where relevant.

## Adding a new article

1. Create a Markdown (`.md`) or MDX (`.mdx`) file in `pages/docs/{section}/`. Use `.mdx` if the article embeds React components.
2. Add YAML frontmatter with `title` and `description` (see [CLAUDE.md](CLAUDE.md) for conventions).
3. Add the article to `src/data/navigation.ts`.
4. Run `pnpm build` to verify the page renders and all links resolve.

## Pull requests

- One topic per PR.
- Run `pnpm build` before submitting.
- Code PRs that change behavior or add features should include Playwright tests.
- Fill out the [pull request template](.github/pull_request_template.md) when opening a PR.

## License

Content contributions are licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Code contributions under [MIT](LICENSE).
