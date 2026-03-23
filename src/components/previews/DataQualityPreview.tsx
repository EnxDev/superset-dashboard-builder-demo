export default function DataQualityPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Data quality alerts preview">
      {/* Alert rows */}
      {[
        { y: 8, color: '#e04355', label: 'Critical' },
        { y: 34, color: '#fcc700', label: 'Warning' },
        { y: 60, color: '#5ac189', label: 'Healthy' },
      ].map((item, i) => (
        <g key={i}>
          <rect x="8" y={item.y} width="144" height="22" rx="4" fill={item.color} opacity="0.08" stroke={item.color} strokeWidth="0.5" strokeOpacity="0.3" />
          <circle cx="22" cy={item.y + 11} r="4" fill={item.color} opacity="0.5" />
          <rect x="32" y={item.y + 6} width="50" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.3" />
          <rect x="32" y={item.y + 13} width="80" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.15" />
          <rect x="120" y={item.y + 6} width="24" height="10" rx="5" fill={item.color} opacity="0.2" />
        </g>
      ))}
    </svg>
  );
}
