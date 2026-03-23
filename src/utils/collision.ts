import { DEFAULT_CARD_W, DEFAULT_CARD_H, LAYOUT_GAP } from '../constants';
import type { CanvasItem, LayoutMode } from '../store/templateStore';

interface Rect { x: number; y: number; w: number; h: number; }

function toRect(item: CanvasItem): Rect {
  return { x: item.x, y: item.y, w: item.w ?? DEFAULT_CARD_W, h: item.h ?? DEFAULT_CARD_H };
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function hasCollision(
  excludeId: string, x: number, y: number, w: number, h: number, items: CanvasItem[],
): boolean {
  const candidate: Rect = { x, y, w, h };
  return items.some((it) => it.id !== excludeId && rectsOverlap(candidate, toRect(it)));
}

/**
 * Find a position near (x, y) that doesn't overlap any existing item.
 * Spirals outward in 10px increments at 15° angles.
 */
export function findNonOverlappingPosition(
  excludeId: string, x: number, y: number, w: number, h: number,
  items: CanvasItem[], canvasW = 2000, canvasH = 2000,
): { x: number; y: number } {
  if (!hasCollision(excludeId, x, y, w, h, items)) return { x, y };

  const step = 10;
  for (let radius = step; radius < 800; radius += step) {
    for (let angle = 0; angle < 360; angle += 15) {
      const nx = Math.round(x + radius * Math.cos((angle * Math.PI) / 180));
      const ny = Math.round(y + radius * Math.sin((angle * Math.PI) / 180));
      if (nx < 0 || ny < 0) continue;
      if (canvasW > 0 && nx + w > canvasW) continue;
      if (canvasH > 0 && ny + h > canvasH) continue;
      if (!hasCollision(excludeId, nx, ny, w, h, items)) return { x: nx, y: ny };
    }
  }
  // Fallback: place below everything
  const maxBottom = items.reduce((m, it) => Math.max(m, it.y + (it.h ?? DEFAULT_CARD_H)), 0);
  return { x: 0, y: maxBottom + 8 };
}

// ── Expand helpers ────────────────────────────────────────────────────────────

/**
 * Expand a card horizontally to fill the full canvas row.
 * Keeps y/h, sets x=0 and w=canvasW, pushing/shrinking nothing — just claims
 * all horizontal space that isn't occupied by other items on the same row band.
 */
export function expandHorizontal(
  item: CanvasItem, items: CanvasItem[], canvasW: number,
): { x: number; w: number } {
  const h = item.h ?? DEFAULT_CARD_H;
  const top = item.y;
  const bottom = top + h;
  const gap = LAYOUT_GAP;

  // Find items that vertically overlap with this card's row band
  const sameRow = items.filter((it) => {
    if (it.id === item.id) return false;
    const itTop = it.y;
    const itBot = it.y + (it.h ?? DEFAULT_CARD_H);
    return itTop < bottom && itBot > top;
  });

  if (sameRow.length === 0) {
    return { x: 0, w: canvasW };
  }

  // Find the largest contiguous span that includes the item's center
  const cx = item.x + (item.w ?? DEFAULT_CARD_W) / 2;
  let left = 0;
  let right = canvasW;

  for (const other of sameRow) {
    const oLeft = other.x;
    const oRight = other.x + (other.w ?? DEFAULT_CARD_W);
    if (oRight + gap <= cx) {
      left = Math.max(left, oRight + gap);
    }
    if (oLeft - gap >= cx) {
      right = Math.min(right, oLeft - gap);
    }
  }

  return { x: left, w: Math.max(DEFAULT_CARD_W, right - left) };
}

/**
 * Expand a card vertically to fill the full canvas column.
 * Keeps x/w, sets y=0 and h=canvasH, claiming all vertical space not
 * occupied by other items on the same column band.
 */
export function expandVertical(
  item: CanvasItem, items: CanvasItem[], canvasH: number,
): { y: number; h: number } {
  const w = item.w ?? DEFAULT_CARD_W;
  const left = item.x;
  const right = left + w;
  const gap = LAYOUT_GAP;

  const sameCol = items.filter((it) => {
    if (it.id === item.id) return false;
    const itLeft = it.x;
    const itRight = it.x + (it.w ?? DEFAULT_CARD_W);
    return itLeft < right && itRight > left;
  });

  if (sameCol.length === 0) {
    return { y: 0, h: canvasH };
  }

  const cy = item.y + (item.h ?? DEFAULT_CARD_H) / 2;
  let top = 0;
  let bottom = canvasH;

  for (const other of sameCol) {
    const oTop = other.y;
    const oBot = other.y + (other.h ?? DEFAULT_CARD_H);
    if (oBot + gap <= cy) {
      top = Math.max(top, oBot + gap);
    }
    if (oTop - gap >= cy) {
      bottom = Math.min(bottom, oTop - gap);
    }
  }

  return { y: top, h: Math.max(DEFAULT_CARD_H, bottom - top) };
}

// ── Layout rearrangement ─────────────────────────────────────────────────────

/**
 * Rearrange items when switching from one layout mode to another.
 * Produces new position/grid properties for each item based on the target layout.
 */
export function rearrangeForLayout(
  items: CanvasItem[],
  targetMode: LayoutMode,
  gridCols: number,
  canvasW: number,
  _canvasH?: number,
): CanvasItem[] {
  if (items.length === 0) return items;

  // Sort items by their current visual position (top-to-bottom, left-to-right)
  const sorted = [...items].sort((a, b) => {
    const ay = a.row != null ? a.row * (DEFAULT_CARD_H + LAYOUT_GAP) : a.y;
    const by = b.row != null ? b.row * (DEFAULT_CARD_H + LAYOUT_GAP) : b.y;
    if (Math.abs(ay - by) > DEFAULT_CARD_H / 2) return ay - by;
    const ax = a.col != null ? a.col * (DEFAULT_CARD_W + LAYOUT_GAP) : a.x;
    const bx = b.col != null ? b.col * (DEFAULT_CARD_W + LAYOUT_GAP) : b.x;
    return ax - bx;
  });

  switch (targetMode) {
    case 'grid':
      return sorted.map((item, i) => ({
        ...item,
        col: i % gridCols,
        row: Math.floor(i / gridCols),
        colSpan: 1,
        rowSpan: 1,
      }));

    case 'rows':
      return sorted.map((item, i) => ({
        ...item,
        row: i,
        col: 0,
      }));

    case 'xy': {
      const cols = Math.max(1, gridCols);
      const effectiveW = Math.max(canvasW, cols * (DEFAULT_CARD_W + LAYOUT_GAP));
      const cellW = Math.max(DEFAULT_CARD_W, Math.floor((effectiveW - LAYOUT_GAP * (cols + 1)) / cols));
      const cellH = DEFAULT_CARD_H;
      return sorted.map((item, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const x = Math.max(0, LAYOUT_GAP + c * (cellW + LAYOUT_GAP));
        const y = Math.max(0, LAYOUT_GAP + r * (cellH + LAYOUT_GAP));
        return {
          ...item,
          x,
          y,
          w: Math.min(cellW, effectiveW - x),
          h: cellH,
        };
      });
    }

    case 'mosaic': {
      // Place items in columns, filling the shortest column first (masonry)
      const colHeights = new Array(gridCols).fill(0);
      return sorted.map((item) => {
        const shortestCol = colHeights.indexOf(Math.min(...colHeights));
        const col = shortestCol;
        const row = colHeights[shortestCol];
        colHeights[shortestCol] += 1;
        return {
          ...item,
          col,
          row,
          colSpan: 1,
          rowSpan: 1,
        };
      });
    }

    default:
      return items;
  }
}
