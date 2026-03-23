import { DEFAULT_ROW_H, DEFAULT_COL_W, LAYOUT_GAP } from '../constants';
import type { CanvasItem, LayoutMode } from '../store/templateStore';
import type { LayoutPreset } from './layoutPresets';

export function resolvePreset(preset: LayoutPreset, mode: LayoutMode, canvasW: number, _canvasH: number): CanvasItem[] {
  const uid = () => Math.random().toString(36).slice(2, 8);
  const cols = preset.cols ?? 3;
  const colW = Math.floor((canvasW - LAYOUT_GAP * (cols - 1)) / cols);

  const resolved = preset.slots.map((s) => {
    const id = `${s.key}-${Date.now()}-${uid()}`;
    const base = { id, key: s.key, title: s.title, config: {} };

    if (mode === 'grid') {
      const c = s.col ?? 0;
      const r = s.row ?? 0;
      const cs = s.colSpan ?? 1;
      const rs = s.rowSpan ?? 1;
      const w = cs * colW + (cs - 1) * LAYOUT_GAP;
      const h = rs * DEFAULT_ROW_H + (rs - 1) * LAYOUT_GAP;
      return { ...base, x: c * (colW + LAYOUT_GAP), y: r * (DEFAULT_ROW_H + LAYOUT_GAP), w, h, col: c, row: r, colSpan: cs, rowSpan: rs };
    }

    if (mode === 'rows') {
      const r = s.row ?? 0;
      return { ...base, x: 0, y: r * (DEFAULT_ROW_H + LAYOUT_GAP), w: canvasW, h: DEFAULT_ROW_H, row: r };
    }

    if (mode === 'mosaic') {
      const c = s.col ?? 0;
      const r = s.row ?? 0;
      return { ...base, x: 0, y: 0, w: DEFAULT_COL_W, h: DEFAULT_ROW_H, col: c, row: r, colSpan: 1, rowSpan: 1 };
    }

    // xy — placeholder position, will be spread below
    return { ...base, x: 0, y: 0, w: DEFAULT_COL_W, h: DEFAULT_ROW_H };
  });

  // For XY mode, spread items in a grid pattern so they don't overlap
  if (mode === 'xy' && resolved.length > 0) {
    const spreadCols = Math.max(1, Math.min(cols, Math.ceil(Math.sqrt(resolved.length))));
    const cellW = DEFAULT_COL_W + LAYOUT_GAP;
    const cellH = DEFAULT_ROW_H + LAYOUT_GAP;
    return resolved.map((item, i) => ({
      ...item,
      x: LAYOUT_GAP + (i % spreadCols) * cellW,
      y: LAYOUT_GAP + Math.floor(i / spreadCols) * cellH,
    }));
  }

  return resolved;
}
