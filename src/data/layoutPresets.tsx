import type { LayoutMode } from '../store/templateStore';

export interface Slot { key: string; title: string; col?: number; row?: number; colSpan?: number; rowSpan?: number; fy?: number; fh?: number; }

export interface LayoutPreset {
  id: string;
  label: string;
  description: string;
  preview: React.ReactNode;
  slots: Slot[];
  cols?: number; // for grid mode
}

const GRID_PRESETS: LayoutPreset[] = [
  {
    id: 'blank', label: 'Blank', description: 'Empty canvas',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%"><rect x="6" y="6" width="168" height="88" rx="3" fill="none" stroke="currentColor" strokeDasharray="5 4" strokeWidth="1.2" opacity="0.3"/><text x="90" y="55" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.3">Empty</text></svg>,
    slots: [], cols: 3,
  },
  {
    id: 'single', label: 'Single', description: '1 full-width chart',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%"><rect x="6" y="6" width="168" height="88" rx="3" fill="currentColor" opacity="0.18"/><text x="90" y="55" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">A</text></svg>,
    slots: [{ key:'chart', title:'Chart', col:0, row:0, colSpan:3, rowSpan:1 }], cols: 3,
  },
  {
    id: '2col', label: '2 columns', description: '2 equal columns',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%">{[0,1].map((i)=><g key={i}><rect x={6+i*90} y="6" width="84" height="88" rx="3" fill="currentColor" opacity="0.18"/><text x={48+i*90} y="55" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">{String.fromCharCode(65+i)}</text></g>)}</svg>,
    slots: [{ key:'chart', title:'Chart A', col:0, row:0, colSpan:1, rowSpan:1 },{ key:'chart', title:'Chart B', col:1, row:0, colSpan:1, rowSpan:1 }], cols: 2,
  },
  {
    id: '3col', label: '3 columns', description: '3 equal columns',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%">{[0,1,2].map((i)=><g key={i}><rect x={6+i*60} y="6" width="54" height="88" rx="3" fill="currentColor" opacity="0.18"/><text x={33+i*60} y="55" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">{String.fromCharCode(65+i)}</text></g>)}</svg>,
    slots: [0,1,2].map((i)=>({ key:'chart', title:`Chart ${String.fromCharCode(65+i)}`, col:i, row:0, colSpan:1, rowSpan:1 })), cols: 3,
  },
  {
    id: '2x2', label: '2×2 grid', description: '4 equal panels',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%">{[0,1,2,3].map((i)=>{const c=i%2,r=Math.floor(i/2);return<g key={i}><rect x={6+c*90} y={6+r*46} width="84" height="40" rx="3" fill="currentColor" opacity="0.18"/><text x={48+c*90} y={6+r*46+24} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">{String.fromCharCode(65+i)}</text></g>})}</svg>,
    slots: [0,1,2,3].map((i)=>({ key:'chart', title:`Chart ${String.fromCharCode(65+i)}`, col:i%2, row:Math.floor(i/2), colSpan:1, rowSpan:1 })), cols: 2,
  },
  {
    id: 'header-2col', label: 'Header + 2 col', description: 'KPI row + 2 charts',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%"><rect x="6" y="6" width="168" height="24" rx="3" fill="currentColor" opacity="0.22"/><text x="90" y="22" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">KPI</text>{[0,1].map((i)=><g key={i}><rect x={6+i*87} y="36" width="81" height="58" rx="3" fill="currentColor" opacity="0.15"/><text x={47+i*87} y="69" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">{String.fromCharCode(65+i)}</text></g>)}</svg>,
    slots: [{ key:'filter', title:'KPI Row', col:0, row:0, colSpan:2, rowSpan:1 },{ key:'chart', title:'Chart A', col:0, row:1, colSpan:1, rowSpan:1 },{ key:'chart', title:'Chart B', col:1, row:1, colSpan:1, rowSpan:1 }], cols: 2,
  },
];

const ROWS_PRESETS: LayoutPreset[] = [
  {
    id: 'blank', label: 'Blank', description: 'Empty canvas',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%"><rect x="6" y="6" width="168" height="88" rx="3" fill="none" stroke="currentColor" strokeDasharray="5 4" strokeWidth="1.2" opacity="0.3"/></svg>,
    slots: [],
  },
  {
    id: '1row', label: '1 row', description: 'Single full-width row',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%"><rect x="6" y="36" width="168" height="28" rx="3" fill="currentColor" opacity="0.18"/><text x="90" y="55" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">A</text></svg>,
    slots: [{ key:'chart', title:'Chart', row:0, fy:0, fh:1 }],
  },
  {
    id: '2rows', label: '2 rows', description: '2 stacked rows',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%">{[0,1].map((r)=><g key={r}><rect x="6" y={6+r*47} width="168" height="41" rx="3" fill="currentColor" opacity="0.18"/><text x="90" y={6+r*47+25} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">{String.fromCharCode(65+r)}</text></g>)}</svg>,
    slots: [{ key:'chart', title:'Chart A', row:0 },{ key:'chart', title:'Chart B', row:1 }],
  },
  {
    id: '3rows', label: '3 rows', description: '3 stacked rows',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%">{[0,1,2].map((r)=><g key={r}><rect x="6" y={6+r*30} width="168" height="24" rx="3" fill="currentColor" opacity="0.18"/><text x="90" y={6+r*30+16} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">{String.fromCharCode(65+r)}</text></g>)}</svg>,
    slots: [{ key:'chart', title:'Chart A', row:0 },{ key:'chart', title:'Chart B', row:1 },{ key:'chart', title:'Chart C', row:2 }],
  },
  {
    id: 'kpi-chart', label: 'KPI + chart', description: 'Small KPI row + large chart',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%"><rect x="6" y="6" width="168" height="22" rx="3" fill="currentColor" opacity="0.25"/><text x="90" y="21" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">KPI</text><rect x="6" y="34" width="168" height="60" rx="3" fill="currentColor" opacity="0.14"/><text x="90" y="67" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">Chart</text></svg>,
    slots: [{ key:'filter', title:'KPI Row', row:0 },{ key:'chart', title:'Main Chart', row:1 }],
  },
];

const XY_PRESETS: LayoutPreset[] = [
  {
    id: 'blank', label: 'Blank', description: 'Empty canvas — place freely',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%"><rect x="6" y="6" width="168" height="88" rx="3" fill="none" stroke="currentColor" strokeDasharray="5 4" strokeWidth="1.2" opacity="0.3"/><text x="90" y="55" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.3">Free canvas</text></svg>,
    slots: [],
  },
];

const MOSAIC_PRESETS: LayoutPreset[] = [
  {
    id: 'blank', label: 'Blank', description: 'Empty mosaic canvas',
    preview: <svg viewBox="0 0 180 100" width="100%" height="100%"><rect x="6" y="6" width="168" height="88" rx="3" fill="none" stroke="currentColor" strokeDasharray="5 4" strokeWidth="1.2" opacity="0.3"/></svg>,
    slots: [],
  },
];

export const PRESETS_BY_MODE: Record<LayoutMode, LayoutPreset[]> = {
  grid: GRID_PRESETS,
  rows: ROWS_PRESETS,
  xy: XY_PRESETS,
  mosaic: MOSAIC_PRESETS,
};
