export default function GenericPreview({ title }: { title: string }) {
  return (
    <svg viewBox="0 0 120 80" width="100%" height="100%" className="svg-preview" role="img" aria-label="Component preview">
      <rect x="8" y="8" width="104" height="64" rx="4" fill="var(--color-primary)" opacity="0.06"
        stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 3" />
      <text x="60" y="42" textAnchor="middle" fontSize="10" fill="var(--color-text-muted)" opacity="0.6">{title}</text>
    </svg>
  );
}
