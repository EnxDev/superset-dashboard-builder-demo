export default function EmbeddedChartPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Embedded chart preview">
      {/* Frame */}
      <rect x="6" y="6" width="148" height="78" rx="4" fill="var(--color-primary)" opacity="0.04" stroke="var(--color-border)" strokeWidth="1" />
      {/* Embed icon */}
      <text x="80" y="30" textAnchor="middle" fontSize="10" fill="var(--color-primary)" opacity="0.4" fontFamily="monospace">&lt;/&gt;</text>
      {/* Mini chart inside */}
      <rect x="20" y="40" width="16" height="28" rx="2" fill="var(--color-primary)" opacity="0.2" />
      <rect x="40" y="48" width="16" height="20" rx="2" fill="var(--color-primary)" opacity="0.15" />
      <rect x="60" y="36" width="16" height="32" rx="2" fill="var(--color-primary)" opacity="0.25" />
      <rect x="80" y="44" width="16" height="24" rx="2" fill="var(--color-primary)" opacity="0.18" />
      <rect x="100" y="52" width="16" height="16" rx="2" fill="var(--color-primary)" opacity="0.12" />
      <rect x="120" y="38" width="16" height="30" rx="2" fill="var(--color-primary)" opacity="0.22" />
    </svg>
  );
}
