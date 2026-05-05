import type { ReactNode } from "react";

/**
 * HowTo block for doc pages.
 *
 * Renders a visible, numbered step list and emits a sibling JSON-LD HowTo
 * schema block for crawlers. Accepts:
 *
 *   <HowTo
 *     name="Implement API key authentication"
 *     description="…"
 *     steps={[
 *       { name: "Generate a key", text: "Use a CSPRNG to produce 32 random bytes." },
 *       { name: "Store the hash", text: "SHA-256 the key before persisting." },
 *       …
 *     ]}
 *   />
 *
 * The `text` field is the prose version used both for the visible list and
 * the JSON-LD step description. Keep it a single sentence when possible —
 * longer content belongs in the surrounding doc.
 */

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

interface HowToProps {
  name: string;
  description?: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration, e.g. "PT30M"
  children?: ReactNode;
}

export function HowTo({ name, description, steps, totalTime, children }: HowToProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    ...(description ? { description } : {}),
    ...(totalTime ? { totalTime } : {}),
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
  };

  return (
    <section className="akg-howto" aria-label={name}>
      <p className="akg-howto__title">{name}</p>
      <ol className="akg-howto__steps">
        {steps.map((s) => (
          <li key={s.name}>
            <strong>{s.name}</strong>
            {s.text}
          </li>
        ))}
      </ol>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}

export default HowTo;
