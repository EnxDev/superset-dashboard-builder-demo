export default function SchedulePreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Reports schedule preview">
      {/* Calendar-like header */}
      <rect x="8" y="6" width="144" height="14" rx="3" fill="var(--color-primary)" opacity="0.12" />
      <text x="80" y="16" textAnchor="middle" fontSize="7" fill="var(--color-primary)" fontWeight="600" opacity="0.7">March 2026</text>
      {/* Schedule rows */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="18" cy={34 + i * 20} r="4" fill={['#5ac189', 'var(--color-primary)', '#fcc700'][i]} opacity="0.5" />
          <rect x="28" y={30 + i * 20} width="70" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.3" />
          <rect x="28" y={37 + i * 20} width="40" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.15" />
          <rect x="120" y={31 + i * 20} width="28" height="8" rx="4" fill="var(--color-border)" opacity="0.4" />
        </g>
      ))}
    </svg>
  );
}
