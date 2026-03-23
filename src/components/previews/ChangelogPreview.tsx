export default function ChangelogPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Changelog preview">
      {/* Version badges */}
      <rect x="8" y="8" width="28" height="12" rx="6" fill="var(--color-primary)" opacity="0.8" />
      <text x="22" y="17" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="600">v2.4</text>
      <rect x="40" y="10" width="80" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.3" />
      <rect x="40" y="17" width="60" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.2" />

      <rect x="8" y="32" width="28" height="12" rx="6" fill="var(--color-border)" />
      <text x="22" y="41" textAnchor="middle" fontSize="6" fill="var(--color-text-muted)" fontWeight="600">v2.3</text>
      <rect x="40" y="34" width="90" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.25" />
      <rect x="40" y="41" width="55" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.15" />

      <rect x="8" y="56" width="28" height="12" rx="6" fill="var(--color-border)" />
      <text x="22" y="65" textAnchor="middle" fontSize="6" fill="var(--color-text-muted)" fontWeight="600">v2.2</text>
      <rect x="40" y="58" width="70" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.25" />
      <rect x="40" y="65" width="45" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.15" />

      {/* Timeline line */}
      <line x1="22" y1="22" x2="22" y2="30" stroke="var(--color-border)" strokeWidth="1" />
      <line x1="22" y1="46" x2="22" y2="54" stroke="var(--color-border)" strokeWidth="1" />
    </svg>
  );
}
