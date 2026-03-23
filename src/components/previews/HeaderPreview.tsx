export default function HeaderPreview() {
  return (
    <svg viewBox="0 0 160 50" width="100%" height="100%" className="svg-preview" role="img" aria-label="Header preview">
      {/* Header line */}
      <rect x="8" y="10" width="90" height="10" rx="2" fill="var(--color-primary)" opacity="0.7" />
      {/* Subtitle */}
      <rect x="8" y="26" width="120" height="5" rx="2" fill="var(--color-text-muted)" opacity="0.3" />
      {/* Divider */}
      <line x1="8" y1="38" x2="152" y2="38" stroke="var(--color-border)" strokeWidth="1.5" />
    </svg>
  );
}
