export default function CertificationsPreview() {
  return (
    <svg viewBox="0 0 160 80" width="100%" height="100%" className="svg-preview" role="img" aria-label="Certifications preview">
      {/* Badge icon */}
      <circle cx="80" cy="28" r="16" fill="var(--color-primary)" opacity="0.12" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.3" />
      <polygon points="80,18 83,24 90,25 85,29 86,36 80,33 74,36 75,29 70,25 77,24" fill="var(--color-primary)" opacity="0.5" />
      {/* Label */}
      <rect x="50" y="50" width="60" height="5" rx="2" fill="var(--color-primary)" opacity="0.25" />
      <rect x="55" y="60" width="50" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.2" />
      {/* Status dots */}
      <circle cx="45" cy="72" r="3" fill="#5ac189" opacity="0.6" />
      <rect x="52" y="70" width="30" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.2" />
      <circle cx="100" cy="72" r="3" fill="#fcc700" opacity="0.6" />
      <rect x="107" y="70" width="24" height="3" rx="1.5" fill="var(--color-text-muted)" opacity="0.2" />
    </svg>
  );
}
