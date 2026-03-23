export default function BigNumberPreview() {
  return (
    <svg viewBox="0 0 160 80" width="100%" height="100%" className="svg-preview" role="img" aria-label="Big number preview">
      {/* Big number */}
      <text x="80" y="40" textAnchor="middle" fontSize="28" fontWeight="700" fill="var(--color-primary)" opacity="0.85">42.8K</text>
      {/* Subtitle */}
      <text x="80" y="56" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)" opacity="0.6">Total Revenue</text>
      {/* Trend indicator */}
      <polygon points="72,64 76,60 80,64" fill="#5ac189" opacity="0.7" />
      <text x="88" y="67" textAnchor="start" fontSize="8" fill="#5ac189" opacity="0.8">+12.4%</text>
    </svg>
  );
}
