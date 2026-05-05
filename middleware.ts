/**
 * Vercel Edge Middleware — runs before static files are served.
 *
 * Serves the plaintext .md variant of doc pages to AI agents and to any
 * client that requests markdown via `Accept` content negotiation. Humans
 * and regular search crawlers continue to get the HTML build at the same
 * URL. The redirect response carries `Vary: Accept, User-Agent` and a
 * `Link: <html>; rel="canonical"` header so retrieval crawlers collapse
 * the HTML + markdown pair to a single canonical entity.
 */

const AI_AGENT_PATTERNS = [
  // OpenAI: training, search index, on-behalf-of-user
  "gptbot",
  "oai-searchbot",
  "chatgpt-user",
  // Anthropic: training, search index, on-behalf-of-user
  "claudebot",
  "claude-searchbot",
  "claude-user",
  "claude-web",
  "anthropic",
  "claude-code",
  // Google (Gemini training; regular Googlebot still gets HTML)
  "google-extended",
  // Perplexity
  "perplexitybot",
  "perplexity-user",
  // Apple (intelligence opt-in token)
  "applebot-extended",
  // Amazon, Mistral, DuckDuckGo, Meta
  "amazonbot",
  "mistralai-user",
  "duckassistbot",
  "meta-externalagent",
  // Model Context Protocol clients (Claude Code, Cursor, etc.)
  "modelcontextprotocol",
  "mcp-client",
  // Other training and research crawlers
  "bytespider",
  "cohere-ai",
  "youbot",
  "ccbot",
  "ai2bot",
  "diffbot",
  "omgilibot",
  "timpibot",
];

const MARKDOWN_ACCEPT = /\btext\/(markdown|x-markdown|plain)\b/i;

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  const isRoot = pathname === "/";
  const isDocs = pathname.startsWith("/docs/");

  if ((!isRoot && !isDocs) || pathname.endsWith(".md") || pathname.endsWith(".txt")) {
    return;
  }

  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const accept = request.headers.get("accept") || "";

  const wantsMarkdown =
    MARKDOWN_ACCEPT.test(accept) ||
    AI_AGENT_PATTERNS.some((pattern) => ua.includes(pattern));

  if (!wantsMarkdown) {
    return;
  }

  const cleanPath = pathname.replace(/\/$/, "");
  const target = new URL(isRoot ? "/index.md" : `${cleanPath}.md`, request.url);
  const canonicalHtml = new URL(isRoot ? "/" : cleanPath, request.url);

  return new Response(null, {
    status: 302,
    headers: {
      location: target.toString(),
      vary: "Accept, User-Agent",
      link: `<${canonicalHtml.toString()}>; rel="canonical"`,
    },
  });
}

export const config = {
  matcher: ["/", "/docs/:path*"],
};
