export default function GridContainerPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Grid container preview">
      {/* Grid outline */}
      <rect x="4" y="4" width="152" height="82" rx="4" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
      {/* 3x2 grid cells */}
      <rect x="8" y="8" width="46" height="36" rx="3" fill="var(--color-primary)" opacity="0.08" stroke="var(--color-border)" strokeWidth="0.5" />
      <rect x="58" y="8" width="46" height="36" rx="3" fill="var(--color-primary)" opacity="0.08" stroke="var(--color-border)" strokeWidth="0.5" />
      <rect x="108" y="8" width="40" height="36" rx="3" fill="var(--color-primary)" opacity="0.08" stroke="var(--color-border)" strokeWidth="0.5" />
      <rect x="8" y="48" width="46" height="34" rx="3" fill="var(--color-primary)" opacity="0.08" stroke="var(--color-border)" strokeWidth="0.5" />
      <rect x="58" y="48" width="46" height="34" rx="3" fill="var(--color-primary)" opacity="0.08" stroke="var(--color-border)" strokeWidth="0.5" />
      <rect x="108" y="48" width="40" height="34" rx="3" fill="var(--color-primary)" opacity="0.08" stroke="var(--color-border)" strokeWidth="0.5" />
      {/* Grid label */}
      <text x="80" y="38" textAnchor="middle" fontSize="7" fill="var(--color-text-muted)" opacity="0.5">3 x 2</text>
    </svg>
  );
}
