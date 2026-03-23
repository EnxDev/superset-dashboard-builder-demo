export default function AnnouncementsPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Announcements preview">
      {/* Megaphone icon */}
      <circle cx="20" cy="18" r="10" fill="var(--color-primary)" opacity="0.12" />
      <text x="20" y="22" textAnchor="middle" fontSize="12" fill="var(--color-primary)" opacity="0.7">📢</text>
      <rect x="36" y="12" width="80" height="5" rx="2" fill="var(--color-primary)" opacity="0.3" />
      <rect x="36" y="20" width="50" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.2" />
      {/* Second item */}
      <line x1="10" y1="34" x2="150" y2="34" stroke="var(--color-border)" strokeWidth="0.5" />
      <circle cx="20" cy="46" r="6" fill="var(--color-border)" opacity="0.3" />
      <rect x="30" y="42" width="90" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.25" />
      <rect x="30" y="49" width="60" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.15" />
      {/* Third item */}
      <line x1="10" y1="60" x2="150" y2="60" stroke="var(--color-border)" strokeWidth="0.5" />
      <circle cx="20" cy="72" r="6" fill="var(--color-border)" opacity="0.3" />
      <rect x="30" y="68" width="70" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.25" />
      <rect x="30" y="75" width="45" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.15" />
    </svg>
  );
}
