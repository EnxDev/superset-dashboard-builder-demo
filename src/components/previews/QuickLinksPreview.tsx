export default function QuickLinksPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Quick links preview">
      {/* 2x2 grid of link cards */}
      {[0, 1].map((r) =>
        [0, 1].map((c) => (
          <g key={`${r}-${c}`}>
            <rect x={8 + c * 76} y={8 + r * 40} width="70" height="34" rx="4" fill="var(--color-primary)" opacity="0.06" stroke="var(--color-border)" strokeWidth="0.5" />
            <circle cx={24 + c * 76} cy={22 + r * 40} r="6" fill="var(--color-primary)" opacity="0.2" />
            <rect x={34 + c * 76} y={18 + r * 40} width="36" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.3" />
            <rect x={34 + c * 76} y={26 + r * 40} width="24" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.15" />
          </g>
        ))
      )}
    </svg>
  );
}
