export default function AiPreview() {
  return (
    <svg viewBox="0 0 120 80" width="100%" height="100%" className="svg-preview" role="img" aria-label="AI suggestion preview">
      {/* brain icon suggestion */}
      <circle cx="60" cy="28" r="16" fill="var(--color-primary)" opacity="0.15" />
      <text x="60" y="33" textAnchor="middle" fontSize="18">🤖</text>
      <rect x="12" y="52" width="96" height="7" rx="3" fill="var(--color-border)" />
      <rect x="20" y="63" width="80" height="7" rx="3" fill="var(--color-border)" opacity="0.6" />
      <rect x="30" y="74" width="60" height="7" rx="3" fill="var(--color-border)" opacity="0.3" />
    </svg>
  );
}
