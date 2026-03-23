import type { LayoutMode } from '../store/templateStore';

export interface LayoutModeOption {
  id: LayoutMode;
  label: string;
  description: string;
  preview: React.ReactNode;
}

export const LAYOUT_MODES: LayoutModeOption[] = [
  {
    id: 'grid',
    label: 'Grid',
    description: 'N-column responsive grid. Charts align to columns, rows have uniform height.',
    preview: (
      <svg viewBox="0 0 200 120" width="100%" height="100%">
        {[0,1,2].map((c) => [0,1].map((r) => (
          <rect key={`${c}-${r}`}
            x={8 + c * 62} y={8 + r * 52}
            width={56} height={46} rx="3"
            fill="currentColor" opacity="0.18" />
        )))}
        {/* grid lines */}
        <line x1="72" y1="4" x2="72" y2="116" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3"/>
        <line x1="134" y1="4" x2="134" y2="116" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3"/>
        <line x1="4" y1="60" x2="196" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3"/>
        {['A','B','C','D','E','F'].map((l, i) => {
          const c = i % 3; const r = Math.floor(i / 3);
          return <text key={l} x={8 + c*62 + 28} y={8 + r*52 + 28} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">{l}</text>;
        })}
      </svg>
    ),
  },
  {
    id: 'rows',
    label: 'Rows',
    description: 'Full-width horizontal rows stacked vertically.',
    preview: (
      <svg viewBox="0 0 200 120" width="100%" height="100%">
        {[0,1,2].map((r) => (
          <g key={r}>
            <rect x="8" y={8 + r * 34} width="184" height="28" rx="3" fill="currentColor" opacity="0.18" />
            <text x="100" y={8 + r*34 + 18} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">
              {String.fromCharCode(65 + r)}
            </text>
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: 'xy',
    label: 'Free (XY)',
    description: 'Free positioning anywhere. Charts can overlap and be placed freely.',
    preview: (
      <svg viewBox="0 0 200 120" width="100%" height="100%">
        <rect x="10"  y="10"  width="80" height="40" rx="3" fill="currentColor" opacity="0.18" />
        <text x="50"  y="34"  textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.5">A</text>
        <rect x="110" y="20"  width="75" height="50" rx="3" fill="currentColor" opacity="0.18" />
        <text x="148" y="49"  textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.5">B</text>
        <rect x="40"  y="65"  width="90" height="45" rx="3" fill="currentColor" opacity="0.18" />
        <text x="85"  y="91"  textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.5">C</text>
        {/* dot grid */}
        {[20,40,60,80,100,120,140,160,180].map((x) =>
          [20,40,60,80,100].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.8" fill="currentColor" opacity="0.12" />
          ))
        )}
      </svg>
    ),
  },
  {
    id: 'mosaic',
    label: 'Mosaic',
    description: 'Masonry-style. Charts fill vertical gaps, variable heights allowed.',
    preview: (
      <svg viewBox="0 0 200 120" width="100%" height="100%">
        <rect x="8"  y="8"  width="56" height="50" rx="3" fill="currentColor" opacity="0.18" />
        <rect x="72" y="8"  width="56" height="30" rx="3" fill="currentColor" opacity="0.18" />
        <rect x="136" y="8" width="56" height="70" rx="3" fill="currentColor" opacity="0.18" />
        <rect x="8"  y="64" width="56" height="48" rx="3" fill="currentColor" opacity="0.18" />
        <rect x="72" y="44" width="56" height="68" rx="3" fill="currentColor" opacity="0.18" />
        {['A','B','C','D','E','F','G'].map((l, i) => {
          const positions = [[36,37],[100,27],[164,47],[36,92],[100,82],[164,52]];
          if (!positions[i]) return null;
          const [x,y] = positions[i];
          return <text key={l} x={x} y={y} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">{l}</text>;
        })}
      </svg>
    ),
  },
];
