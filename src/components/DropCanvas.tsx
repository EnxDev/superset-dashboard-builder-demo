import { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import BlockSettingsModal from './BlockSettingsModal';
import FilterToolboxModal from './FilterToolboxModal';
import { isFilterElement } from './CardPreview';
import { XYCanvas, GridCanvas, RowsCanvas, MosaicCanvas } from './renderers';
import { DEFAULT_CARD_W, DEFAULT_CARD_H, CANVAS_FALLBACK_W, CANVAS_FALLBACK_H } from '../constants';
import { findNonOverlappingPosition, expandHorizontal, expandVertical } from '../utils/collision';
import type { CanvasItem, LayoutMode } from '../store/templateStore';
import './DropCanvas.css';

export interface DropCanvasHandle {
  getSize: () => { w: number; h: number };
  triggerDrop: (key: string, title: string, x: number, y: number) => void;
}

interface Props {
  items: CanvasItem[];
  layoutMode?: LayoutMode;
  gridCols?: number;
  readOnly?: boolean;
  onAdd?: (item: CanvasItem) => void;
  onRemove?: (id: string) => void;
  onUpdateItem?: (id: string, config: Record<string, unknown>) => void;
  onResize?: (id: string, patch: Record<string, unknown>) => void;
}

interface PendingDrop { key: string; title: string; x: number; y: number; }

// ── Main DropCanvas ───────────────────────────────────────────────────────────

const DropCanvas = forwardRef<DropCanvasHandle, Props>(
  ({ items, layoutMode = 'xy', gridCols = 3, readOnly = false, onAdd, onRemove, onUpdateItem, onResize }, ref) => {
    const containerEl = useRef<HTMLDivElement | null>(null);
    const [pending, setPending] = useState<PendingDrop | null>(null);
    const [editing, setEditing] = useState<CanvasItem | null>(null);

    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: 'canvas-droppable' });

    // Track active tree drag — show "ready" state + ghost preview on canvas
    const [treeDragging, setTreeDragging] = useState(false);
    const [ghostInfo, setGhostInfo] = useState<{ key: string; title: string; x: number; y: number } | null>(null);

    // Store the initial pointer position at drag start (screen coords)
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);

    useDndMonitor({
      onDragStart(event) {
        const data = event.active.data.current as { source?: string; key?: string; title?: string } | undefined;
        if (data?.source === 'tree') {
          setTreeDragging(true);
          // Capture initial pointer position from the activator event
          const e = event.activatorEvent as PointerEvent | MouseEvent;
          if (e) dragStartPos.current = { x: e.clientX, y: e.clientY };
        }
      },
      onDragMove(event) {
        const data = event.active.data.current as { source?: string; key?: string; title?: string } | undefined;
        if (data?.source !== 'tree' || !containerEl.current || !dragStartPos.current) {
          setGhostInfo(null);
          return;
        }

        // Current pointer = start position + delta
        const pointerX = dragStartPos.current.x + event.delta.x;
        const pointerY = dragStartPos.current.y + event.delta.y;

        const canvasRect = containerEl.current.getBoundingClientRect();
        const cx = pointerX - canvasRect.left;
        const cy = pointerY - canvasRect.top;

        // Only show ghost when pointer is within canvas bounds
        if (cx < 0 || cy < 0 || cx > canvasRect.width || cy > canvasRect.height) {
          setGhostInfo(null);
          return;
        }

        setGhostInfo({
          key: data.key ?? '',
          title: data.title ?? '',
          x: cx - DEFAULT_CARD_W / 2,
          y: cy - DEFAULT_CARD_H / 2,
        });
      },
      onDragEnd() { setTreeDragging(false); setGhostInfo(null); dragStartPos.current = null; },
      onDragCancel() { setTreeDragging(false); setGhostInfo(null); dragStartPos.current = null; },
    });

    const combinedRef = useCallback((el: HTMLDivElement | null) => {
      containerEl.current = el;
      setDropRef(el);
    }, [setDropRef]);

    useImperativeHandle(ref, () => ({
      getSize: () => {
        const el = containerEl.current;
        return el ? { w: el.clientWidth, h: el.clientHeight } : { w: CANVAS_FALLBACK_W, h: CANVAS_FALLBACK_H };
      },
      triggerDrop: (key: string, title: string, x: number, y: number) => {
        setPending({ key, title, x, y });
      },
    }));

    const handleConfirm = (config: Record<string, unknown>) => {
      if (!pending) return;
      const title = (config.title as string) || pending.title;

      let newItem: CanvasItem;

      if (layoutMode === 'grid') {
        // Snap to next available grid cell
        const cols = gridCols;
        const usedCells = new Set(items.map((it) => `${it.col ?? 0},${it.row ?? 0}`));
        let col = 0, row = 0;
        while (usedCells.has(`${col},${row}`)) {
          col++;
          if (col >= cols) { col = 0; row++; }
        }
        newItem = { id: `${pending.key}-${Date.now()}`, key: pending.key, title, x: 0, y: 0, w: DEFAULT_CARD_W, h: DEFAULT_CARD_H, col, row, colSpan: 1, rowSpan: 1, config };
      } else if (layoutMode === 'rows') {
        const maxRow = items.reduce((max, it) => Math.max(max, (it.row ?? 0)), -1);
        newItem = { id: `${pending.key}-${Date.now()}`, key: pending.key, title, x: 0, y: 0, w: DEFAULT_CARD_W, h: DEFAULT_CARD_H, row: maxRow + 1, config };
      } else {
        // xy / mosaic: use drop coordinates, avoiding overlaps
        const rawX = pending.x - DEFAULT_CARD_W / 2;
        const rawY = pending.y - DEFAULT_CARD_H / 2;
        const newId = `${pending.key}-${Date.now()}`;
        const el = containerEl.current;
        const canvasW = el ? el.clientWidth : CANVAS_FALLBACK_W;
        const canvasH = el ? el.clientHeight : CANVAS_FALLBACK_H;
        const { x: safeX, y: safeY } = findNonOverlappingPosition(
          newId, Math.max(0, rawX), Math.max(0, rawY), DEFAULT_CARD_W, DEFAULT_CARD_H, items, canvasW, canvasH,
        );
        newItem = { id: newId, key: pending.key, title, x: safeX, y: safeY, w: DEFAULT_CARD_W, h: DEFAULT_CARD_H, config };
      }

      onAdd?.(newItem);
      setPending(null);
    };

    const handleEditConfirm = (config: Record<string, unknown>) => {
      if (!editing) return;
      onUpdateItem?.(editing.id, config);
      setEditing(null);
    };

    const handleExpandH = useCallback((id: string) => {
      const item = items.find((it) => it.id === id);
      if (!item || !containerEl.current) return;

      const isExpanded = !!item.config?._preExpandH;

      if (isExpanded) {
        // Restore previous state
        const pre = item.config._preExpandH as Record<string, unknown>;
        const cleanConfig = { ...item.config };
        delete cleanConfig._preExpandH;
        delete cleanConfig._mosaicSpan;
        onResize?.(id, { ...pre, _config: cleanConfig });
      } else if (layoutMode === 'grid') {
        const saved = { col: item.col ?? 0, colSpan: item.colSpan ?? 1 };
        const newConfig = { ...item.config, _preExpandH: saved };
        onResize?.(id, { col: 0, colSpan: gridCols, _config: newConfig });
      } else if (layoutMode === 'mosaic') {
        // Mosaic: toggle column-span via config flag (no position data to save)
        const newConfig = { ...item.config, _preExpandH: { _mosaic: true }, _mosaicSpan: true };
        onResize?.(id, { _config: newConfig });
      } else {
        // XY
        const canvasW = containerEl.current.clientWidth;
        const result = expandHorizontal(item, items, canvasW);
        const newConfig = { ...item.config, _preExpandH: { x: item.x, w: item.w } };
        onResize?.(id, { ...result, _config: newConfig });
      }
    }, [items, layoutMode, gridCols, onResize]);

    const handleExpandV = useCallback((id: string) => {
      const item = items.find((it) => it.id === id);
      if (!item || !containerEl.current) return;

      const pre = item.config?._preExpandV as Record<string, number> | undefined;

      if (pre) {
        // Restore previous state
        const cleanConfig = { ...item.config };
        delete cleanConfig._preExpandV;
        onResize?.(id, { ...pre, _config: cleanConfig } as Record<string, unknown>);
      } else if (layoutMode === 'grid') {
        // Grid: expand rowSpan to cover all occupied rows + 1
        const maxRow = items.reduce((m, it) => Math.max(m, (it.row ?? 0) + (it.rowSpan ?? 1)), 1);
        const saved = { row: item.row ?? 0, rowSpan: item.rowSpan ?? 1 };
        const newConfig = { ...item.config, _preExpandV: saved };
        onResize?.(id, { row: 0, rowSpan: maxRow, _config: newConfig } as Record<string, unknown>);
      } else if (layoutMode === 'rows') {
        // Rows: double the height (toggle)
        const saved = { h: item.h ?? DEFAULT_CARD_H };
        const newConfig = { ...item.config, _preExpandV: saved };
        onResize?.(id, { h: (item.h ?? DEFAULT_CARD_H) * 2, _config: newConfig } as Record<string, unknown>);
      } else if (layoutMode === 'mosaic') {
        // Mosaic: double height
        const saved = { h: item.h ?? DEFAULT_CARD_H };
        const newConfig = { ...item.config, _preExpandV: saved };
        onResize?.(id, { h: (item.h ?? DEFAULT_CARD_H) * 2, _config: newConfig } as Record<string, unknown>);
      } else {
        // XY: expand y/h
        const canvasH = containerEl.current.clientHeight;
        const result = expandVertical(item, items, canvasH);
        const newConfig = { ...item.config, _preExpandV: { y: item.y, h: item.h } };
        onResize?.(id, { ...result, _config: newConfig } as Record<string, unknown>);
      }
    }, [items, layoutMode, onResize]);

    const isEmpty = items.length === 0;
    const isXY = layoutMode === 'xy';

    // Determine if pending / editing item is a filter element (opens Superset-style modal)
    const pendingIsFilter = pending ? isFilterElement(pending.key) : false;
    const editingIsFilter = editing ? isFilterElement(editing.key) : false;

    // Canvas items for cross-scope targeting (exclude filter elements and the editing item)
    const scopeTargets = items
      .filter((it) => !isFilterElement(it.key) && it.id !== editing?.id)
      .map((it) => ({ id: it.id, title: it.title }));

    return (
      <>
        <div
          ref={combinedRef}
          className={[
            'drop-canvas',
            `drop-canvas--${layoutMode}`,
            isOver && !readOnly ? 'drop-canvas--over' : '',
            treeDragging && !isOver && !readOnly ? 'drop-canvas--drop-ready' : '',
            isEmpty && !readOnly ? 'drop-canvas--empty' : '',
            readOnly ? 'drop-canvas--readonly' : '',
          ].filter(Boolean).join(' ')}
        >
          {isEmpty && !readOnly && (
            <div className="drop-canvas__hint">
              <span className="drop-canvas__hint-icon">⊕</span>
              <span>Drag charts here</span>
            </div>
          )}
          {isEmpty && readOnly && (
            <div className="drop-canvas__hint">
              <span className="readonly-hint">
                This dashboard has no charts.
              </span>
            </div>
          )}

          {!isEmpty && isXY && (
            <XYCanvas items={items} readOnly={readOnly} onRemove={onRemove} onSettings={setEditing} onExpandH={handleExpandH} onExpandV={handleExpandV} />
          )}
          {!isEmpty && layoutMode === 'grid' && (
            <GridCanvas items={items} gridCols={gridCols} readOnly={readOnly} onRemove={onRemove} onSettings={setEditing} onExpandH={handleExpandH} onExpandV={handleExpandV} />
          )}
          {!isEmpty && layoutMode === 'rows' && (
            <RowsCanvas items={items} readOnly={readOnly} onRemove={onRemove} onSettings={setEditing} onExpandV={handleExpandV} />
          )}
          {!isEmpty && layoutMode === 'mosaic' && (
            <MosaicCanvas items={items} gridCols={gridCols} readOnly={readOnly} onRemove={onRemove} onSettings={setEditing} onExpandH={handleExpandH} onExpandV={handleExpandV} />
          )}

          {/* Ghost preview at the drop position */}
          {ghostInfo && (
            <div
              className="drop-canvas__ghost"
              style={{
                position: 'absolute',
                left: ghostInfo.x,
                top: ghostInfo.y,
                width: DEFAULT_CARD_W,
                height: DEFAULT_CARD_H,
              }}
            >
              <div className="drop-card__header">
                <span className="drop-card__label">{ghostInfo.title}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── New item: Filter modal (any filter element) ── */}
        {pending && pendingIsFilter && (
          <FilterToolboxModal
            open
            nodeKey={pending.key}
            nodeTitle={pending.title}
            canvasItems={scopeTargets}
            onConfirm={handleConfirm}
            onCancel={() => setPending(null)}
          />
        )}

        {/* ── New item: Generic settings modal ── */}
        {pending && !pendingIsFilter && (
          <BlockSettingsModal
            open
            nodeKey={pending.key}
            nodeTitle={pending.title}
            onConfirm={handleConfirm}
            onCancel={() => setPending(null)}
          />
        )}

        {/* ── Edit: Filter modal ── */}
        {editing && editingIsFilter && (
          <FilterToolboxModal
            open
            isEditing
            nodeKey={editing.key}
            nodeTitle={editing.title}
            initialConfig={editing.config as Record<string, unknown>}
            canvasItems={scopeTargets}
            onConfirm={handleEditConfirm}
            onCancel={() => setEditing(null)}
          />
        )}

        {/* ── Edit: Generic settings modal ── */}
        {editing && !editingIsFilter && (
          <BlockSettingsModal
            open
            isEditing
            nodeKey={editing.key}
            nodeTitle={editing.title}
            onConfirm={() => {
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </>
    );
  }
);

DropCanvas.displayName = 'DropCanvas';
export default DropCanvas;
