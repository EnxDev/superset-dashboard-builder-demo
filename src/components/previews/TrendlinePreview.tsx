export default function TrendlinePreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Big number with trendline preview">
      {/* Big number */}
      <text x="80" y="30" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--color-primary)" opacity="0.85">89.2K</text>
      {/* Subtitle */}
      <text x="80" y="42" textAnchor="middle" fontSize="8" fill="var(--color-text-muted)" opacity="0.6">Active Users</text>
      {/* Trendline */}
      <polyline
        points="15,75 30,70 45,72 60,65 75,60 90,58 105,50 120,52 135,45 148,40"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        opacity="0.5"
      />
      {/* Area under trendline */}
      <polygon
        points="15,75 30,70 45,72 60,65 75,60 90,58 105,50 120,52 135,45 148,40 148,80 15,80"
        fill="var(--color-primary)"
        opacity="0.08"
      />
    </svg>
  );
}
