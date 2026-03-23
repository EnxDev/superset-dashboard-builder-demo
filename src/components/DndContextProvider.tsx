import { useState, useCallback, useRef, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  rectIntersection,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import DragOverlayContent from './DragOverlayContent';
import { findNonOverlappingPosition } from '../utils/collision';
import { DEFAULT_CARD_W, DEFAULT_CARD_H } from '../constants';
import type { CanvasItem, LayoutMode } from '../store/templateStore';

// ── Drag data types ─────────────────────────────────────────────────────────

export interface TreeDragData {
  source: 'tree';
  key: string;
  title: string;
}

export interface CanvasDragData {
  source: 'canvas';
  item: CanvasItem;
}

export type DragData = TreeDragData | CanvasDragData;

// ── Active drag state ────────────────────────────────────────────────────────

interface ActiveDrag {
  id: string;
  data: DragData;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  items: CanvasItem[];
  layoutMode: LayoutMode;
  gridCols: number;
  canvasRef: React.RefObject<HTMLElement | null>;
  /** Called when a tree item is dropped on the canvas — triggers the settings modal */
  onTreeDrop: (key: string, title: string, x: number, y: number) => void;
  /** Called when an XY canvas card is moved */
  onMove: (id: string, x: number, y: number) => void;
  /** Called when grid items are swapped */
  onGridMove: (id: string, col: number, row: number) => void;
  /** Called when row items are reordered */
  onRowReorder?: (fromIndex: number, toIndex: number) => void;
}

export default function DndContextProvider({
  children, items, layoutMode, gridCols, canvasRef,
  onTreeDrop, onMove, onGridMove, onRowReorder,
}: Props) {
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);

  // Track the droppable canvas rect for coordinate calculation
  const canvasRectRef = useRef<DOMRect | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragData;
    setActiveDrag({ id: String(event.active.id), data });

    // Capture canvas rect at drag start for accurate drop coordinate calculation
    if (canvasRef.current) {
      canvasRectRef.current = canvasRef.current.getBoundingClientRect();
    }
  }, [canvasRef]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    const data = active.data.current as DragData;

    setActiveDrag(null);

    if (!data) return;

    // ── Tree → Canvas drop ────────────────────────────────────────────────
    if (data.source === 'tree') {
      // Accept drop if over the canvas droppable OR over any existing canvas card
      if (!over) return;
      const isCanvasDrop = over.id === 'canvas-droppable';
      const isOverCanvasCard = items.some((it) => it.id === over.id);
      if (!isCanvasDrop && !isOverCanvasCard) return;

      const rect = canvasRectRef.current;
      if (!rect) return;

      // Calculate drop position relative to canvas
      const activeRect = active.rect.current.translated;
      if (!activeRect) return;

      const dropX = activeRect.left - rect.left + activeRect.width / 2;
      const dropY = activeRect.top - rect.top + activeRect.height / 2;

      onTreeDrop(data.key, data.title, dropX, dropY);
      return;
    }

    // ── Canvas → Canvas repositioning ─────────────────────────────────────
    if (data.source === 'canvas') {
      const item = data.item;

      if (layoutMode === 'xy') {
        // Free positioning — apply delta to original position
        const newX = Math.max(0, item.x + delta.x);
        const newY = Math.max(0, item.y + delta.y);
        const w = item.w ?? DEFAULT_CARD_W;
        const h = item.h ?? DEFAULT_CARD_H;
        const canvasEl = canvasRef.current;
        const canvasW = canvasEl ? canvasEl.clientWidth : 2000;
        const canvasH = canvasEl ? canvasEl.clientHeight : 2000;
        const { x: safeX, y: safeY } = findNonOverlappingPosition(
          item.id, newX, newY, w, h, items, canvasW, canvasH,
        );
        onMove(item.id, safeX, safeY);
        return;
      }

      if (layoutMode === 'grid') {
        // Grid — swap with the item we dropped on
        if (!over || over.id === active.id) return;
        const targetItem = items.find((it) => it.id === over.id);
        if (targetItem) {
          onGridMove(item.id, targetItem.col ?? 0, targetItem.row ?? 0);
        }
        return;
      }

      if (layoutMode === 'rows' || layoutMode === 'mosaic') {
        // Rows / Mosaic — reorder
        if (!over || over.id === active.id || !onRowReorder) return;
        const fromIdx = items.findIndex((it) => it.id === active.id);
        const toIdx = items.findIndex((it) => it.id === over.id);
        if (fromIdx !== -1 && toIdx !== -1) {
          onRowReorder(fromIdx, toIdx);
        }
        return;
      }
    }
  }, [items, layoutMode, gridCols, canvasRef, onTreeDrop, onMove, onGridMove, onRowReorder]);

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}

      <DragOverlay dropAnimation={null}>
        {activeDrag && activeDrag.data.source === 'tree' && (
          <DragOverlayContent
            source="tree"
            title={(activeDrag.data as TreeDragData).title}
            nodeKey={(activeDrag.data as TreeDragData).key}
          />
        )}
        {activeDrag && activeDrag.data.source === 'canvas' && (
          <DragOverlayContent
            source="canvas"
            title={(activeDrag.data as CanvasDragData).item.title}
            item={(activeDrag.data as CanvasDragData).item}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
