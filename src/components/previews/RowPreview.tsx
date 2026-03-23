export default function RowPreview() {
  return (
    <svg viewBox="0 0 160 60" width="100%" height="100%" className="svg-preview" role="img" aria-label="Row layout preview">
      {/* Row container */}
      <rect x="4" y="8" width="152" height="44" rx="4" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
      {/* Three columns inside */}
      <rect x="8" y="12" width="44" height="36" rx="3" fill="var(--color-primary)" opacity="0.1" />
      <rect x="56" y="12" width="44" height="36" rx="3" fill="var(--color-primary)" opacity="0.1" />
      <rect x="104" y="12" width="44" height="36" rx="3" fill="var(--color-primary)" opacity="0.1" />
      {/* Labels */}
      <text x="30" y="34" textAnchor="middle" fontSize="7" fill="var(--color-text-muted)">Col</text>
      <text x="78" y="34" textAnchor="middle" fontSize="7" fill="var(--color-text-muted)">Col</text>
      <text x="126" y="34" textAnchor="middle" fontSize="7" fill="var(--color-text-muted)">Col</text>
      {/* Arrow indicators */}
      <line x1="10" y1="52" x2="148" y2="52" stroke="var(--color-primary)" strokeWidth="1" opacity="0.4" markerEnd="url(#arrowR)" />
    </svg>
  );
}
