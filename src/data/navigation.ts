/**
 * Source-of-truth navigation data used by:
 *   - zudoku.config.tsx — maps these sections into Zudoku's sidebar
 *   - src/components/SectionGrid.tsx — the homepage grid of section cards
 *
 * `href` values are the URLs visitors see; for docs these are `/docs/<section>/<slug>`
 * and match both the on-disk path (pages/<section>/<slug>.md) and the Zudoku
 * route. The root article is mounted at "/" by Zudoku via the doc navigation
 * entry in zudoku.config.tsx, but we still list it here with href "/" so the
 * section grid treats the intro as part of the Introduction section.
 */

export interface NavItem {
  title: string;
  href: string;
}

export interface NavSection {
  title: string;
  description: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Introduction",
    description: "What API keys are, how they compare to other auth methods, and when they're the right choice.",
    items: [
      { title: "What Are API Keys?", href: "/" },
      { title: "How API Keys Work", href: "/docs/introduction/how-api-keys-work" },
      { title: "API Keys vs Other Auth", href: "/docs/introduction/api-keys-vs-other-auth" },
      { title: "When to Use API Keys", href: "/docs/introduction/when-to-use-api-keys" },
      { title: "Getting Started", href: "/docs/introduction/getting-started" },
    ],
  },
  {
    title: "Architecture",
    description: "Gateway patterns, edge authentication, multi-service consistency, and the build-vs-buy decision.",
    items: [
      { title: "Gateway-Based Authentication", href: "/docs/architecture/gateway-based-authentication" },
      { title: "Edge Authentication", href: "/docs/architecture/edge-authentication" },
      { title: "Multi-Service Authentication", href: "/docs/architecture/multi-service-authentication" },
      { title: "Build vs. Buy", href: "/docs/architecture/build-vs-buy" },
    ],
  },
  {
    title: "Implementation",
    description: "Key generation, formats, prefixes, and validation patterns.",
    items: [
      { title: "Key Generation", href: "/docs/implementation/key-generation" },
      { title: "Key Formats & Prefixes", href: "/docs/implementation/key-formats-and-prefixes" },
      { title: "Validation & Lookup", href: "/docs/implementation/validation-and-lookup" },
    ],
  },
  {
    title: "Security",
    description: "Hashing, storage, rotation, revocation, scoping, rate limiting, expiration, and leak detection.",
    items: [
      { title: "Hashing & Storage", href: "/docs/security/hashing-and-storage" },
      { title: "Key Rotation", href: "/docs/security/key-rotation" },
      { title: "Revocation", href: "/docs/security/revocation" },
      { title: "Expiration Policies", href: "/docs/security/expiration-policies" },
      { title: "Scoping & Permissions", href: "/docs/security/scoping-and-permissions" },
      { title: "Rate Limiting", href: "/docs/security/rate-limiting" },
      { title: "Leak Detection", href: "/docs/security/leak-detection" },
    ],
  },
  {
    title: "Best Practices",
    description: "Separate guidance for API providers building key systems and consumers integrating with them.",
    items: [
      { title: "For API Providers", href: "/docs/best-practices/for-providers" },
      { title: "For API Consumers", href: "/docs/best-practices/for-consumers" },
    ],
  },
  {
    title: "Operations",
    description: "Logging, monitoring, auditing, monetization, portals, and managing API keys at scale.",
    items: [
      { title: "Logging & Monitoring", href: "/docs/operations/logging-and-monitoring" },
      { title: "Key Management at Scale", href: "/docs/operations/key-management-at-scale" },
      { title: "API Monetization", href: "/docs/operations/api-monetization" },
      { title: "Developer Portals", href: "/docs/operations/developer-portals" },
      { title: "Migration Strategies", href: "/docs/operations/migration-strategies" },
    ],
  },
  {
    title: "AI Agents",
    description: "API key safety for coding assistants, MCP servers, and agent-driven workflows.",
    items: [
      { title: "How AI Assistants Expose Keys", href: "/docs/ai-agents/how-ai-assistants-expose-keys" },
      { title: "Leakage Vectors in Agent Workflows", href: "/docs/ai-agents/key-leakage-vectors-in-agent-workflows" },
      { title: "OAuth vs API Keys for Agents", href: "/docs/ai-agents/oauth-vs-api-keys-for-agents" },
      { title: "Securing Keys in MCP Configs", href: "/docs/ai-agents/securing-keys-in-mcp-configs" },
      { title: "Least-Privilege Keys for Agents", href: "/docs/ai-agents/least-privilege-keys-for-agents" },
      { title: "Designing MCP Servers", href: "/docs/ai-agents/designing-mcp-servers-that-protect-secrets" },
    ],
  },
  {
    title: "Reference",
    description: "Definitions and cross-references for the concepts used across the guide.",
    items: [
      { title: "Glossary", href: "/docs/reference/glossary" },
    ],
  },
];
