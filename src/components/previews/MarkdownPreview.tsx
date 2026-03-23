export default function MarkdownPreview() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" className="svg-preview" role="img" aria-label="Markdown preview">
      {/* Heading */}
      <text x="10" y="16" fontSize="10" fontWeight="700" fill="var(--color-text)" opacity="0.8"># Heading</text>
      {/* Paragraph lines */}
      <rect x="10" y="24" width="130" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.25" />
      <rect x="10" y="32" width="110" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.2" />
      <rect x="10" y="40" width="120" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.2" />
      {/* Bold keyword */}
      <rect x="10" y="52" width="30" height="5" rx="2" fill="var(--color-primary)" opacity="0.3" />
      <rect x="44" y="52" width="90" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.2" />
      {/* Bullet list */}
      <circle cx="16" cy="66" r="2" fill="var(--color-primary)" opacity="0.5" />
      <rect x="22" y="64" width="70" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.2" />
      <circle cx="16" cy="76" r="2" fill="var(--color-primary)" opacity="0.5" />
      <rect x="22" y="74" width="55" height="4" rx="2" fill="var(--color-text-muted)" opacity="0.2" />
    </svg>
  );
}
