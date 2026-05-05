/**
 * Site-wide + per-page discovery metadata.
 *
 * Emits:
 *   - OpenGraph tags (Facebook, LinkedIn, Slack, Discord, iMessage).
 *   - Platform hints (theme-color, color-scheme).
 *   - Two JSON-LD blocks:
 *       1. Site graph — WebSite, Organization (Zuplo), Person (maintainer).
 *       2. Per-page graph — TechArticle + BreadcrumbList, resolved from
 *          the current route via navigation.ts. Absent on /search and on
 *          any route not in the nav data (homepage intro falls through to
 *          the site graph only).
 *
 * Per-page `<title>` and `<meta name="description">` still come from each
 * doc's frontmatter via Zudoku's MdxPage Helmet block; `<link rel="canonical">`
 * is emitted automatically from `canonicalUrlOrigin` in zudoku.config.tsx.
 */
import { Head } from "zudoku/components";
import { useLocation } from "react-router";
import { navigation } from "../data/navigation";
import { DOC_DATES } from "../data/doc-dates";

const SITE_URL = "https://apikeys.guide";
const SITE_NAME = "apikeys.guide";
const SITE_DESCRIPTION =
  "The missing guide to API key security, implementation, and best practices.";
// Per-page PNGs generated at build time by scripts/gen-og.mjs; this path is
// the site-level fallback served for "/" and any route not in navigation.ts.
const OG_IMAGE_DEFAULT = `${SITE_URL}/og/index.png`;

// Site-level fallback dates. Per-page dates come from DOC_DATES, which is
// generated at build time from frontmatter by scripts/gen-doc-meta.cjs.
const SITE_DATE_PUBLISHED = "2026-01-15";
const SITE_DATE_MODIFIED = "2026-04-22";

interface PageMeta {
  title: string;
  description: string;
  sectionTitle: string;
  sectionHref: string;
}

/** Map pathname → page + section metadata, built once at module load. */
const PAGE_META: Record<string, PageMeta> = (() => {
  const map: Record<string, PageMeta> = {};
  for (const section of navigation) {
    const first = section.items[0];
    const sectionHref = first ? first.href : "/";
    for (const item of section.items) {
      map[item.href] = {
        title: item.title,
        description: section.description,
        sectionTitle: section.title,
        sectionHref,
      };
    }
  }
  return map;
})();

const SITE_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#publisher` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#publisher`,
      name: "Zuplo",
      url: "https://zuplo.com",
      logo: `${SITE_URL}/zuplo-logo.svg`,
      sameAs: [
        "https://github.com/zuplo",
        "https://www.linkedin.com/company/zuplo",
        "https://x.com/zuplo",
      ],
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#maintainer`,
      name: "apikeys.guide maintainers",
      url: "https://github.com/zuplo/apikeys.guide/graphs/contributors",
      worksFor: { "@id": `${SITE_URL}/#publisher` },
      sameAs: ["https://github.com/zuplo/apikeys.guide"],
    },
  ],
};

const joinUrl = (path: string) =>
  path === "/" ? SITE_URL : `${SITE_URL}${path}`;

// Mirrors the output layout of scripts/gen-og.mjs: "/" -> /og/index.png,
// "/docs/foo/bar" -> /og/docs/foo/bar.png. Unknown routes fall back to the
// site-level image.
const ogImageFor = (pathname: string): string => {
  if (pathname === "/" || !PAGE_META[pathname]) return OG_IMAGE_DEFAULT;
  return `${SITE_URL}/og${pathname}.png`;
};

function buildPageGraph(pathname: string) {
  const meta = PAGE_META[pathname];
  if (!meta || pathname === "/") return null;

  const pageUrl = joinUrl(pathname);
  const markdownUrl = `${pageUrl}.md`;
  const dates = DOC_DATES[pathname];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        url: pageUrl,
        name: meta.title,
        headline: meta.title,
        description: meta.description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntityOfPage: pageUrl,
        datePublished: dates?.datePublished ?? SITE_DATE_PUBLISHED,
        dateModified: dates?.dateModified ?? SITE_DATE_MODIFIED,
        author: { "@id": `${SITE_URL}/#maintainer` },
        publisher: { "@id": `${SITE_URL}/#publisher` },
        about: meta.sectionTitle,
        articleSection: meta.sectionTitle,
        // Advertise the plaintext markdown sibling as an alternate
        // representation; agents that prefer markdown can pick it up
        // without re-issuing the request.
        encoding: {
          "@type": "MediaObject",
          contentUrl: markdownUrl,
          encodingFormat: "text/markdown",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "apikeys.guide",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: meta.sectionTitle,
            item: joinUrl(meta.sectionHref),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: meta.title,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}

export function SiteMeta() {
  const { pathname } = useLocation();
  // Strip trailing slash (except for "/"); normalises routes so lookup
  // matches navigation.ts hrefs regardless of how Zudoku serves them.
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const pageGraph = buildPageGraph(normalized);
  const meta = PAGE_META[normalized];

  const ogTitle = meta ? `${meta.title} — ${SITE_NAME}` : SITE_NAME;
  const ogDescription = meta ? meta.description : SITE_DESCRIPTION;
  const ogUrl = joinUrl(normalized);
  const ogType = meta ? "article" : "website";
  const ogImage = ogImageFor(normalized);
  const ogImageAlt = meta
    ? `${meta.title} — ${SITE_NAME}`
    : `${SITE_NAME} — ${SITE_DESCRIPTION}`;

  return (
    <Head>
      {/* Readex Pro display font. Loaded via <link> (not @import in CSS)
          because Zudoku concatenates our custom CSS after its own, which
          would break a top-level @import. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&display=swap"
      />

      {/* OpenGraph — Facebook, LinkedIn, Slack, Discord, iMessage, etc. */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter / X — uses OG fallbacks for image/title/description; these
          two lines force the large-image card and attribute the link to the
          Zuplo account. */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@zuplo" />

      {/* Platform hints */}
      <meta name="theme-color" content="#0f1117" media="(prefers-color-scheme: dark)" />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      <meta name="color-scheme" content="light dark" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured data — site graph is always emitted. */}
      <script type="application/ld+json">{JSON.stringify(SITE_GRAPH)}</script>
      {pageGraph ? (
        <script type="application/ld+json">{JSON.stringify(pageGraph)}</script>
      ) : null}
    </Head>
  );
}

export default SiteMeta;
