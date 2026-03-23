export default function TagCloudPreview() {
  const tags = [
    { x: 20, y: 22, w: 36, h: 12, op: 0.7, size: 7 },
    { x: 60, y: 16, w: 48, h: 14, op: 0.9, size: 8 },
    { x: 114, y: 20, w: 32, h: 11, op: 0.5, size: 6 },
    { x: 10, y: 42, w: 44, h: 13, op: 0.8, size: 7 },
    { x: 58, y: 38, w: 30, h: 11, op: 0.4, size: 6 },
    { x: 92, y: 40, w: 52, h: 14, op: 0.6, size: 8 },
    { x: 24, y: 62, w: 40, h: 12, op: 0.5, size: 7 },
    { x: 70, y: 60, w: 36, h: 11, op: 0.7, size: 6 },
    { x: 112, y: 58, w: 28, h: 12, op: 0.3, size: 6 },
  ];

  return (
    <svg viewBox="0 0 160 84" width="100%" height="100%" className="svg-preview" role="img" aria-label="Tag cloud preview">
      {tags.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={t.h / 2} fill="var(--color-primary)" opacity={t.op * 0.15} stroke="var(--color-primary)" strokeWidth="0.5" opacity2={t.op * 0.4} />
          <rect x={t.x + 6} y={t.y + (t.h - 3) / 2} width={t.w - 12} height="3" rx="1.5" fill="var(--color-primary)" opacity={t.op * 0.5} />
        </g>
      ))}
    </svg>
  );
}
