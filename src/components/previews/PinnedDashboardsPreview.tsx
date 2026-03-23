export default function PinnedDashboardsPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Pinned dashboards preview">
      {/* Three dashboard cards */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={6 + i * 52} y="8" width="48" height="60" rx="4" fill="var(--color-primary)" opacity="0.05" stroke="var(--color-border)" strokeWidth="0.8" />
          {/* Thumbnail area */}
          <rect x={10 + i * 52} y="12" width="40" height="28" rx="2" fill="var(--color-primary)" opacity="0.08" />
          {/* Mini chart inside thumbnail */}
          <polyline
            points={`${12 + i * 52},36 ${18 + i * 52},30 ${24 + i * 52},34 ${30 + i * 52},26 ${36 + i * 52},28 ${46 + i * 52},22`}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="1"
            opacity="0.3"
          />
          {/* Title */}
          <rect x={10 + i * 52} y="44" width="34" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.3" />
          {/* Pin icon */}
          <circle cx={46 + i * 52} y="56" r="3" fill="var(--color-primary)" opacity="0.3" cy="56" />
          <rect x={10 + i * 52} y="52" width="24" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.15" />
        </g>
      ))}
      {/* Label */}
      <rect x="8" y="76" width="60" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.2" />
    </svg>
  );
}
