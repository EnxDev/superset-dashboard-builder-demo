export default function SpacerPreview() {
  return (
    <svg viewBox="0 0 160 50" width="100%" height="100%" className="svg-preview" role="img" aria-label="Spacer preview">
      {/* Top content edge */}
      <rect x="8" y="4" width="144" height="6" rx="2" fill="var(--color-border)" opacity="0.3" />
      {/* Spacer area */}
      <rect x="30" y="16" width="100" height="18" rx="3" fill="var(--color-primary)" opacity="0.05" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 2" />
      <text x="80" y="28" textAnchor="middle" fontSize="7" fill="var(--color-text-muted)" opacity="0.5">spacer</text>
      {/* Bottom content edge */}
      <rect x="8" y="40" width="144" height="6" rx="2" fill="var(--color-border)" opacity="0.3" />
    </svg>
  );
}
