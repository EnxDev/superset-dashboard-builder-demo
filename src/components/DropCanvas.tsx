import { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import BlockSettingsModal from './BlockSettingsModal';
import FilterToolboxModal from './FilterToolboxModal';
import { isFilterElement } from './CardPreview';
import { isContainerElement } from '../data/blockSettings';
import { XYCanvas, GridCanvas, RowsCanvas, MosaicCanvas } from './renderers';
import { DEFAULT_CARD_W, DEFAULT_CARD_H, CANVAS_FALLBACK_W, CANVAS_FALLBACK_H } from '../constants';
import { findNonOverlappingPosition } from '../utils/collision';
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
  onAddChild?: (parentId: string, child: CanvasItem) => void;
  onRemove?: (id: string) => void;
  onUpdateItem?: (id: string, config: Record<string, unknown>) => void;
  onResize?: (id: string, patch: Record<string, unknown>) => void;
}

interface PendingDrop { key: string; title: string; x: number; y: number; parentId?: string; }

// ── Main DropCanvas ───────────────────────────────────────────────────────────

const DropCanvas = forwardRef<DropCanvasHandle, Props>(
  ({ items, layoutMode = 'xy', gridCols = 3, readOnly = false, onAdd, onAddChild, onRemove, onUpdateItem, onResize }, ref) => {
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

    /** Recursively find an item by id in the items tree */
    const findItem = useCallback((id: string, list: CanvasItem[] = items): CanvasItem | undefined => {
      for (const it of list) {
        if (it.id === id) return it;
        if (it.children) {
          const found = findItem(id, it.children);
          if (found) return found;
        }
      }
      return undefined;
    }, [items]);

    /** Find the parent container that holds the given item id, or null if top-level */
    const findParent = useCallback((id: string, list: CanvasItem[] = items): CanvasItem | null => {
      for (const it of list) {
        if (it.children?.some((c) => c.id === id)) return it;
        if (it.children) {
          const found = findParent(id, it.children);
          if (found) return found;
        }
      }
      return null;
    }, [items]);

    /** Called by ContainerCard when an element is dropped into a container */
    const handleContainerDrop = useCallback((parentId: string, key: string, title: string, x?: number, y?: number) => {
      setPending({ key, title, x: x ?? 0, y: y ?? 0, parentId });
    }, []);

    const handleConfirm = (config: Record<string, unknown>) => {
      if (!pending) return;
      const title = (config.title as string) || pending.title;

      const isContainer = isContainerElement(pending.key);
      const canvasW = containerEl.current?.clientWidth ?? CANVAS_FALLBACK_W;

      const newItem: CanvasItem = {
        id: `${pending.key}-${Date.now()}`,
        key: pending.key,
        title,
        x: pending.x, y: pending.y,
        w: isContainer ? canvasW : DEFAULT_CARD_W,
        h: isContainer ? 0 : DEFAULT_CARD_H,  // 0 = auto height for containers
        config,
      };

      // Dropping into a container element — use the drop position
      if (pending.parentId) {
        onAddChild?.(pending.parentId, newItem);
        setPending(null);
        return;
      }

      if (layoutMode === 'grid') {
        // Snap to next available grid cell
        const cols = gridCols;
        const usedCells = new Set(items.map((it) => `${it.col ?? 0},${it.row ?? 0}`));
        let col = 0, row = 0;
        while (usedCells.has(`${col},${row}`)) {
          col++;
          if (col >= cols) { col = 0; row++; }
        }
        Object.assign(newItem, { col: isContainer ? 0 : col, row, colSpan: isContainer ? gridCols : 1, rowSpan: 1 });
      } else if (layoutMode === 'rows') {
        const maxRow = items.reduce((max, it) => Math.max(max, (it.row ?? 0)), -1);
        newItem.row = maxRow + 1;
      } else {
        // xy / mosaic: use drop coordinates, avoiding overlaps
        if (isContainer) {
          // Containers span full width, only set vertical position
          const rawY = pending.y - DEFAULT_CARD_H / 2;
          newItem.x = 0;
          newItem.y = Math.max(0, rawY);
        } else {
          const rawX = pending.x - DEFAULT_CARD_W / 2;
          const rawY = pending.y - DEFAULT_CARD_H / 2;
          const cW = containerEl.current?.clientWidth ?? CANVAS_FALLBACK_W;
          const cH = containerEl.current?.clientHeight ?? CANVAS_FALLBACK_H;
          const { x: safeX, y: safeY } = findNonOverlappingPosition(
            newItem.id, Math.max(0, rawX), Math.max(0, rawY), DEFAULT_CARD_W, DEFAULT_CARD_H, items, cW, cH,
          );
          newItem.x = safeX;
          newItem.y = safeY;
        }
      }

      onAdd?.(newItem);
      setPending(null);
    };

    const handleEditConfirm = (config: Record<string, unknown>) => {
      if (!editing) return;
      onUpdateItem?.(editing.id, config);
      setEditing(null);
    };

    /**
     * Universal expand toggle — works for any item at any nesting level.
     * Stores previous value in config and toggles to expanded state.
     */
    /** Get the available width/height for an item — uses parent container or canvas */
    const getAvailableSize = useCallback((id: string): { w: number; h: number } => {
      const parent = findParent(id);
      if (parent) {
        // Use the parent container's DOM element for actual rendered size
        const parentEl = document.querySelector(`[data-container-id="${parent.id}"]`);
        if (parentEl) {
          return { w: parentEl.clientWidth, h: parentEl.clientHeight };
        }
        // Fallback to parent's stored dimensions
        return { w: parent.w ?? 600, h: parent.h || 400 };
      }
      // Top-level: use canvas
      const el = containerEl.current;
      return { w: el?.clientWidth ?? 900, h: el?.clientHeight ?? 600 };
    }, [findParent]);

    const handleExpandH = useCallback((id: string) => {
      const item = findItem(id);
      if (!item) return;

      const pre = item.config?._preExpandH as Record<string, unknown> | undefined;

      if (pre) {
        const cleanConfig = { ...item.config };
        delete cleanConfig._preExpandH;
        delete cleanConfig._expandedH;
        delete cleanConfig._mosaicSpan;
        onResize?.(id, { ...pre, _config: cleanConfig });
      } else {
        const saved: Record<string, unknown> = {
          w: item.w ?? DEFAULT_CARD_W,
          x: item.x ?? 0,
          col: item.col ?? 0,
          colSpan: item.colSpan ?? 1,
        };
        const { w: availW } = getAvailableSize(id);
        const newConfig = { ...item.config, _preExpandH: saved, _expandedH: true, _mosaicSpan: true };
        onResize?.(id, {
          x: 0, w: availW,
          col: 0, colSpan: gridCols,
          _config: newConfig,
        });
      }
    }, [findItem, getAvailableSize, gridCols, onResize]);

    const handleExpandV = useCallback((id: string) => {
      const item = findItem(id);
      if (!item) return;

      const pre = item.config?._preExpandV as Record<string, unknown> | undefined;

      if (pre) {
        const cleanConfig = { ...item.config };
        delete cleanConfig._preExpandV;
        delete cleanConfig._expandedV;
        onResize?.(id, { ...pre, _config: cleanConfig } as Record<string, unknown>);
      } else {
        const { h: availH } = getAvailableSize(id);
        const curH = item.h ?? DEFAULT_CARD_H;
        const saved: Record<string, unknown> = {
          h: curH,
          y: item.y ?? 0,
          row: item.row ?? 0,
          rowSpan: item.rowSpan ?? 1,
        };
        const newConfig = { ...item.config, _preExpandV: saved, _expandedV: true };
        // Use the larger of double-height or available container height
        const expandedH = Math.max(curH * 2, availH);
        onResize?.(id, {
          y: 0, h: expandedH,
          _config: newConfig,
        } as Record<string, unknown>);
      }
    }, [findItem, onResize]);

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
            <XYCanvas items={items} readOnly={readOnly} onRemove={onRemove} onSettings={setEditing} onExpandH={handleExpandH} onExpandV={handleExpandV} onResize={onResize} onContainerDrop={handleContainerDrop} />
          )}
          {!isEmpty && layoutMode === 'grid' && (
            <GridCanvas items={items} gridCols={gridCols} readOnly={readOnly} onRemove={onRemove} onSettings={setEditing} onExpandH={handleExpandH} onExpandV={handleExpandV} onResize={onResize} onContainerDrop={handleContainerDrop} />
          )}
          {!isEmpty && layoutMode === 'rows' && (
            <RowsCanvas items={items} readOnly={readOnly} onRemove={onRemove} onSettings={setEditing} onExpandH={handleExpandH} onExpandV={handleExpandV} onResize={onResize} onContainerDrop={handleContainerDrop} />
          )}
          {!isEmpty && layoutMode === 'mosaic' && (
            <MosaicCanvas items={items} gridCols={gridCols} readOnly={readOnly} onRemove={onRemove} onSettings={setEditing} onExpandH={handleExpandH} onExpandV={handleExpandV} onResize={onResize} onContainerDrop={handleContainerDrop} />
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
            initialConfig={editing.config}
            onConfirm={handleEditConfirm}
            onCancel={() => setEditing(null)}
          />
        )}
      </>
    );
  }
);

DropCanvas.displayName = 'DropCanvas';
export default DropCanvas;
