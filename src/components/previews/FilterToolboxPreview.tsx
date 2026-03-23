export default function FilterToolboxPreview() {
  return (
    <svg viewBox="0 0 120 60" width="100%" height="100%" className="svg-preview" role="img" aria-label="Filter toolbox preview">
      {/* Toolbox outline */}
      <rect x="6" y="4" width="108" height="52" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />

      {/* Header bar */}
      <rect x="6" y="4" width="108" height="12" rx="4" fill="var(--color-primary)" opacity="0.15" />
      <text x="14" y="13" fontSize="7" fill="var(--color-primary)" fontWeight="600">Filter Toolbox</text>
      <circle cx="104" cy="10" r="3" fill="var(--color-primary)" opacity="0.3" />

      {/* Filter row 1 */}
      <rect x="10" y="20" width="30" height="8" rx="2" fill="var(--color-primary)" opacity="0.2" />
      <text x="14" y="26" fontSize="5" fill="var(--color-primary)">Region</text>
      <rect x="43" y="20" width="12" height="8" rx="2" fill="var(--color-border)" />
      <text x="46" y="26" fontSize="5" fill="var(--color-text-muted)">=</text>
      <rect x="58" y="20" width="24" height="8" rx="4" fill="#59B578" opacity="0.2" />
      <text x="62" y="26" fontSize="5" fill="#59B578">North</text>
      <circle cx="100" cy="24" r="3" fill="#59B578" />

      {/* Filter row 2 */}
      <rect x="10" y="32" width="30" height="8" rx="2" fill="var(--color-primary)" opacity="0.2" />
      <text x="14" y="38" fontSize="5" fill="var(--color-primary)">Status</text>
      <rect x="43" y="32" width="12" height="8" rx="2" fill="var(--color-border)" />
      <text x="46" y="38" fontSize="5" fill="var(--color-text-muted)">=</text>
      <rect x="58" y="32" width="24" height="8" rx="4" fill="#EF4444" opacity="0.2" />
      <text x="62" y="38" fontSize="5" fill="#EF4444">Active</text>
      <circle cx="100" cy="36" r="3" fill="#EF4444" />

      {/* Quick preset chips at bottom */}
      {['📅','✅','🌍'].map((icon, i) => (
        <g key={i}>
          <rect x={10 + i * 30} y={44} width={26} height={8} rx="4" fill="var(--color-primary)" opacity={0.08 + i * 0.04} />
          <text x={14 + i * 30} y={50} fontSize="5" fill="var(--color-text-muted)">{icon}</text>
        </g>
      ))}
    </svg>
  );
}
