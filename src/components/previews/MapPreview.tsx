export default function MapPreview() {
  return (
    <svg viewBox="0 0 120 80" width="100%" height="100%" className="svg-preview" role="img" aria-label="Map preview">
      {/* simplified world outline */}
      <rect x="8" y="8" width="104" height="64" rx="4" fill="var(--color-primary)" opacity="0.07" stroke="var(--color-border)" strokeWidth="1" />
      {/* continents blobs */}
      <ellipse cx="35" cy="35" rx="18" ry="12" fill="var(--color-primary)" opacity="0.2" />
      <ellipse cx="62" cy="30" rx="22" ry="14" fill="var(--color-primary)" opacity="0.2" />
      <ellipse cx="95" cy="38" rx="14" ry="10" fill="var(--color-primary)" opacity="0.2" />
      <ellipse cx="55" cy="55" rx="12" ry="8" fill="var(--color-primary)" opacity="0.2" />
      {/* pins */}
      {[[38,30],[65,25],[92,35]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="4" fill="var(--color-error)" opacity="0.7" />
          <circle cx={cx} cy={cy} r="2" fill="white" />
        </g>
      ))}
    </svg>
  );
}
