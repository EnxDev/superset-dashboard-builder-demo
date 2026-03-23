export default function SearchBoxPreview() {
  return (
    <svg viewBox="0 0 160 50" width="100%" height="100%" className="svg-preview" role="img" aria-label="Search box preview">
      {/* Search input */}
      <rect x="12" y="12" width="136" height="26" rx="6" fill="var(--color-bg)" stroke="var(--color-border)" strokeWidth="1.5" />
      {/* Magnifying glass */}
      <circle cx="28" cy="25" r="5" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" opacity="0.5" />
      <line x1="32" y1="29" x2="35" y2="32" stroke="var(--color-text-muted)" strokeWidth="1.5" opacity="0.5" />
      {/* Placeholder text */}
      <rect x="40" y="22" width="60" height="5" rx="2" fill="var(--color-text-muted)" opacity="0.2" />
    </svg>
  );
}
