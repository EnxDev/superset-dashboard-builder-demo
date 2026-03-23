export default function PivotPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Pivot table preview">
      {/* Corner header */}
      <rect x="6" y="6" width="36" height="16" rx="2" fill="var(--color-primary)" opacity="0.15" />
      {/* Column headers */}
      <rect x="46" y="6" width="34" height="16" rx="2" fill="var(--color-primary)" opacity="0.2" />
      <rect x="84" y="6" width="34" height="16" rx="2" fill="var(--color-primary)" opacity="0.2" />
      <rect x="122" y="6" width="32" height="16" rx="2" fill="var(--color-primary)" opacity="0.2" />
      <text x="63" y="17" textAnchor="middle" fontSize="6" fill="var(--color-primary)" fontWeight="600">Q1</text>
      <text x="101" y="17" textAnchor="middle" fontSize="6" fill="var(--color-primary)" fontWeight="600">Q2</text>
      <text x="138" y="17" textAnchor="middle" fontSize="6" fill="var(--color-primary)" fontWeight="600">Q3</text>
      {/* Row headers + cells */}
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          <rect x="6" y={26 + r * 15} width="36" height="12" rx="1" fill="var(--color-primary)" opacity="0.08" />
          <text x="24" y={34 + r * 15} textAnchor="middle" fontSize="6" fill="var(--color-text-muted)">
            {['Region A', 'Region B', 'Region C', 'Total'][r]}
          </text>
          {[0, 1, 2].map((c) => (
            <rect key={c} x={46 + c * 38} y={26 + r * 15} width={c === 2 ? 32 : 34} height="12" rx="1" fill="var(--color-border)" opacity={r === 3 ? 0.3 : 0.15} />
          ))}
        </g>
      ))}
    </svg>
  );
}
