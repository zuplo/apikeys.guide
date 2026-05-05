import type { ReactNode } from "react";
import { Children, isValidElement } from "react";

/**
 * FAQ block for doc pages.
 *
 * Renders a visible question/answer list and emits a sibling JSON-LD
 * FAQPage schema block so search/LLM crawlers can pick up structured
 * answers. Accepts either:
 *
 *   <FAQ items={[{ q: "...", a: "..." }, ...]} />
 *
 * — when the answers are plain strings, or:
 *
 *   <FAQ>
 *     <FAQ.Item question="...">
 *       Prose answer that can include <strong>markup</strong>.
 *     </FAQ.Item>
 *   </FAQ>
 *
 * — when answers need inline formatting. JSON-LD uses a plain-text version
 * of each answer, so if you need formatted prose, also pass a `text` prop
 * on the item with the string form used for schema.
 */

interface FAQItemData {
  q: string;
  a: string;
}

interface FAQItemProps {
  question: string;
  /** Plain-text version used for JSON-LD. Falls back to string children. */
  text?: string;
  children: ReactNode;
}

function FAQItem({ question, children }: FAQItemProps) {
  return (
    <details className="akg-faq__item">
      <summary className="akg-faq__q">{question}</summary>
      <div className="akg-faq__a">{children}</div>
    </details>
  );
}

interface FAQProps {
  items?: FAQItemData[];
  children?: ReactNode;
}

function extractPairs(items: FAQItemData[] | undefined, children: ReactNode): FAQItemData[] {
  if (items && items.length) return items;
  const collected: FAQItemData[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as FAQItemProps;
    if (!props || !props.question) return;
    const plain =
      props.text ??
      (typeof props.children === "string"
        ? props.children
        : Children.toArray(props.children)
            .filter((c) => typeof c === "string")
            .join(" ")
            .trim());
    collected.push({ q: props.question, a: plain || "" });
  });
  return collected;
}

export function FAQ({ items, children }: FAQProps) {
  const pairs = extractPairs(items, children);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((p) => ({
      "@type": "Question",
      name: p.q,
      acceptedAnswer: { "@type": "Answer", text: p.a },
    })),
  };

  return (
    <section className="akg-faq" aria-label="Frequently asked questions">
      {items
        ? items.map((p) => (
            <details key={p.q} className="akg-faq__item">
              <summary className="akg-faq__q">{p.q}</summary>
              <p className="akg-faq__a">{p.a}</p>
            </details>
          ))
        : children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}

FAQ.Item = FAQItem;

export default FAQ;
