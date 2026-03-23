export default function ColumnPreview() {
  return (
    <svg viewBox="0 0 100 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Column layout preview">
      {/* Column container */}
      <rect x="20" y="4" width="60" height="82" rx="4" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
      {/* Stacked blocks */}
      <rect x="24" y="8" width="52" height="22" rx="3" fill="var(--color-primary)" opacity="0.12" />
      <rect x="24" y="34" width="52" height="22" rx="3" fill="var(--color-primary)" opacity="0.12" />
      <rect x="24" y="60" width="52" height="22" rx="3" fill="var(--color-primary)" opacity="0.12" />
      {/* Labels */}
      <text x="50" y="22" textAnchor="middle" fontSize="7" fill="var(--color-text-muted)">Block</text>
      <text x="50" y="48" textAnchor="middle" fontSize="7" fill="var(--color-text-muted)">Block</text>
      <text x="50" y="74" textAnchor="middle" fontSize="7" fill="var(--color-text-muted)">Block</text>
    </svg>
  );
}
