import type { ReactNode } from "react";

/**
 * TL;DR summary callout for the top of doc pages.
 *
 * Wraps the page's opening summary in a styled aside instead of an h2 +
 * bullet list, so the frontmatter-rendered <h1> isn't immediately followed
 * by a competing heading.
 *
 * Usage in MDX:
 *
 *   <TLDR>
 *
 *   - First key point.
 *   - Second key point.
 *   - Third key point.
 *
 *   </TLDR>
 *
 * The blank lines around the children are required so MDX parses the
 * inner content as markdown (bullets, links, inline code) rather than
 * literal text.
 */

interface TLDRProps {
  children: ReactNode;
}

export function TLDR({ children }: TLDRProps) {
  return (
    <aside className="akg-tldr" aria-label="TL;DR summary">
      <p className="akg-tldr__label">TL;DR</p>
      <div className="akg-tldr__body">{children}</div>
    </aside>
  );
}

export default TLDR;
