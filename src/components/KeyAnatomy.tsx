import { useState } from "react";

/**
 * Interactive "Anatomy of an API key" specimen. Ported from the old
 * Astro component. Three clickable segments (prefix, payload, checksum)
 * each expand a tooltip with a description + link to related docs.
 *
 * Styling lives in src/styles/custom.css (classes prefixed `akg-key-*`).
 */

const SEGMENTS = [
  {
    id: "prefix",
    text: "sk_live",
    href: "/docs/implementation/key-formats-and-prefixes",
    label: "Prefix",
    description:
      "Identifies the key type and environment. Helps with leak detection — scanners like GitHub's secret scanning match known prefixes to flag exposed keys.",
    linkText: "Key Formats & Prefixes",
  },
  {
    id: "payload",
    text: "a1B2c3D4e5F6g7H8i9J0k1L2",
    href: "/docs/implementation/key-generation",
    label: "Random payload (128+ bits)",
    description:
      "The cryptographically random core of the key. Must have at least 128 bits of entropy — generated with a CSPRNG, never sequential or predictable.",
    linkText: "Key Generation",
  },
  {
    id: "checksum",
    text: "xQ9z",
    href: "/docs/security/hashing-and-storage",
    label: "Checksum",
    description:
      "An optional integrity check that catches typos before they hit your API. Lets you reject obviously malformed keys without a database lookup.",
    linkText: "Hashing & Storage",
  },
] as const;

type SegmentId = (typeof SEGMENTS)[number]["id"];

function LabelArrow() {
  return (
    <svg
      className="akg-key-label-arrow"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 0v5M4 5L1.5 2.5M4 5l2.5-2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function KeyAnatomy() {
  const [active, setActive] = useState<SegmentId | null>(null);

  const toggle = (id: SegmentId) => {
    setActive((prev) => (prev === id ? null : id));
  };

  const activeSegment = SEGMENTS.find((s) => s.id === active) ?? null;

  return (
    <div className="akg-key-anatomy not-prose">
      <h2 className="akg-key-anatomy__title">Anatomy of an API key</h2>
      <p className="akg-key-anatomy__subtitle">
        Every segment serves a purpose. Click or tap any part to learn more.
      </p>

      <div className="akg-key-segments text-xs sm:text-sm md:text-base" id="key-segments">
        {SEGMENTS.map((seg, i) => (
          <span key={seg.id} style={{ display: "contents" }}>
            {i > 0 && <span className="akg-key-separator">_</span>}
            <button
              type="button"
              className={`akg-key-segment akg-key-segment--${seg.id} p-1.5 sm:px-3.5 sm:py-2.5`}
              onClick={() => toggle(seg.id)}
              aria-expanded={active === seg.id}
              aria-controls={`tooltip-${seg.id}`}
              data-segment={seg.id}
            >
              {seg.text}
            </button>
          </span>
        ))}
      </div>

      <div className="akg-key-labels text-[0.5625rem] sm:text-[0.6875rem]">
        {SEGMENTS.map((seg, i) => (
          <span key={seg.id} style={{ display: "contents" }}>
            {i > 0 && <div className="akg-key-spacer" />}
            <div className={`akg-key-label--${seg.id}`}>
              <LabelArrow />
              {seg.label}
            </div>
          </span>
        ))}
      </div>

      {activeSegment && (
        <div
          id={`tooltip-${activeSegment.id}`}
          className="akg-key-detail"
          role="region"
          aria-live="polite"
        >
          <p className="akg-key-detail__text">{activeSegment.description}</p>
          <a className="akg-key-detail__link" href={activeSegment.href}>
            {activeSegment.linkText}
            <ArrowRight />
          </a>
        </div>
      )}

      <div className="akg-key-summary">
        <p>
          A well-designed API key tells you{" "}
          <a href="/docs/implementation/key-formats-and-prefixes">what it is</a>, helps
          scanners detect <a href="/docs/security/leak-detection">where it leaked</a>, and
          encodes{" "}
          <a href="/docs/security/scoping-and-permissions">what it can access</a>.
        </p>
      </div>
    </div>
  );
}

export default KeyAnatomy;
