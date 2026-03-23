export default function DividerPreview() {
  return (
    <svg viewBox="0 0 160 40" width="100%" height="100%" className="svg-preview" role="img" aria-label="Divider preview">
      {/* Content above */}
      <rect x="12" y="6" width="80" height="4" rx="2" fill="var(--color-border)" opacity="0.3" />
      <rect x="12" y="13" width="60" height="3" rx="1.5" fill="var(--color-border)" opacity="0.2" />
      {/* Divider line */}
      <line x1="8" y1="22" x2="152" y2="22" stroke="var(--color-text-muted)" strokeWidth="1" opacity="0.5" />
      {/* Content below */}
      <rect x="12" y="28" width="90" height="4" rx="2" fill="var(--color-border)" opacity="0.3" />
      <rect x="12" y="35" width="50" height="3" rx="1.5" fill="var(--color-border)" opacity="0.2" />
    </svg>
  );
}
