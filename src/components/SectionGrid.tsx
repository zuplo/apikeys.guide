import { navigation } from "../data/navigation";

/**
 * The 6-card "Explore the guide" grid on the homepage. Mirrors the layout
 * from the old src/pages/index.astro — a featured row (Continue reading +
 * AI Agents) followed by a standard grid of four section cards.
 */

const ArrowRight = (props: { className?: string }) => (
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
    className={props.className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CodeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const GridIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const BookIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const BotIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

export function SectionGrid() {
  const [intro, implementation, security, bestPractices, operations, aiAgents] = navigation;
  const totalArticles = navigation.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <section className="akg-section-grid not-prose">
      <div className="akg-section-grid__header">
        <div>
          <h2 className="akg-section-grid__title">Explore the guide</h2>
          <p className="akg-section-grid__subtitle">
            Six sections. From fundamentals to cutting-edge agent security.
          </p>
        </div>
        <span className="akg-section-grid__count">{totalArticles} articles</span>
      </div>

      {/* Featured row */}
      <div className="akg-section-grid__featured">
        {/* Continue reading */}
        <a href={intro.items[1].href} className="akg-card akg-card--featured akg-card--continue akg-accent-blue">
          <div className="akg-card__header">
            <div className="akg-card__icon">
              <BookIcon />
            </div>
            <h3 className="akg-card__title">{intro.title}</h3>
            <span className="akg-card__badge">Start here</span>
          </div>
          <p className="akg-card__description">
            Keep reading: {intro.items[1].title}, {intro.items[2].title}, and more.
          </p>
          <div className="akg-card__cta">
            <span>{intro.items.length - 1} more articles</span>
            <ArrowRight />
          </div>
        </a>

        {/* AI Agents featured card */}
        <a
          href={aiAgents.items[0].href}
          className="akg-card akg-card--featured akg-card--new akg-card--featured-blue akg-accent-blue"
        >
          <div className="akg-card__header">
            <div className="akg-card__icon">
              <BotIcon />
            </div>
            <h3 className="akg-card__title">{aiAgents.title}</h3>
            <span className="akg-card__badge">New</span>
          </div>
          <p className="akg-card__description">{aiAgents.description}</p>
          <div className="akg-card__cta">
            <span>{aiAgents.items.length} articles</span>
            <ArrowRight />
          </div>
        </a>
      </div>

      {/* Standard grid */}
      <div className="akg-section-grid__standard">
        <StandardCard section={implementation} accent="red" icon={<ShieldIcon />} />
        <StandardCard section={security} accent="amber" icon={<CodeIcon />} />
        <StandardCard section={bestPractices} accent="emerald" icon={<CheckIcon />} />
        <StandardCard section={operations} accent="violet" icon={<GridIcon />} />
      </div>
    </section>
  );
}

function StandardCard({
  section,
  accent,
  icon,
}: {
  section: (typeof navigation)[number];
  accent: "red" | "amber" | "emerald" | "violet";
  icon: React.ReactNode;
}) {
  return (
    <a href={section.items[0].href} className={`akg-card akg-accent-${accent}`}>
      <div className="akg-card__header">
        <div className="akg-card__icon">{icon}</div>
        <h3 className="akg-card__title">{section.title}</h3>
        <span className="akg-card__count">{section.items.length} articles</span>
        <ArrowRight className="akg-card__arrow" />
      </div>
      <p className="akg-card__description">{section.description}</p>
    </a>
  );
}

export default SectionGrid;
