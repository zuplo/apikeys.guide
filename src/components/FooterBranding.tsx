/**
 * First column of the footer — logo, site title, and tagline. Injected via
 * the `footer-before` slot and laid out as a sibling of Zudoku's default
 * footer columns via customCss.
 */

const KeyIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

export function FooterBranding() {
  return (
    <div className="akg-footer-brand w-full md:w-auto">
      <div className="akg-footer-brand__header">
        <div className="akg-footer-brand__icon">
          <KeyIcon />
        </div>
        <span className="akg-footer-brand__title">apikeys.guide</span>
      </div>
      <p className="akg-footer-brand__tagline">
        A community resource for API key security best practices, implementation
        patterns, and operational guidance.
      </p>
    </div>
  );
}

export default FooterBranding;
