export default function RecentDatabasesPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Recent databases preview">
      {/* Database icons with names */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {/* DB cylinder icon */}
          <ellipse cx={20} cy={18 + i * 26} rx="10" ry="5" fill="var(--color-primary)" opacity={0.2 - i * 0.04} />
          <rect x="10" y={18 + i * 26} width="20" height="10" fill="var(--color-primary)" opacity={0.15 - i * 0.03} />
          <ellipse cx={20} cy={28 + i * 26} rx="10" ry="5" fill="var(--color-primary)" opacity={0.2 - i * 0.04} />
          {/* DB name */}
          <rect x="38" y={18 + i * 26} width={60 - i * 10} height="5" rx="2" fill="var(--color-text-muted)" opacity="0.3" />
          <rect x="38" y={26 + i * 26} width={40 - i * 5} height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.15" />
          {/* Status */}
          <circle cx="140" cy={23 + i * 26} r="3" fill={['#5ac189', '#5ac189', '#fcc700'][i]} opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}
