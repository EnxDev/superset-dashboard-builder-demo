import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import { useRef, useCallback } from 'react';
import { CloseOutlined, SettingOutlined, ColumnWidthOutlined, ColumnHeightOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import CanvasCard from '../CanvasCard';
import { resolveSettings, canAcceptChild } from '../../data/blockSettings';
import { DEFAULT_CARD_W, DEFAULT_CARD_H } from '../../constants';
import { hasCollision } from '../../utils/collision';
import type { CanvasItem } from '../../store/templateStore';

export interface ContainerCardProps {
  item: CanvasItem;
  readOnly: boolean;
  allItems?: CanvasItem[];
  onRemove?: (id: string) => void;
  onSettings?: (item: CanvasItem) => void;
  onExpandH?: (id: string) => void;
  onExpandV?: (id: string) => void;
  onResize?: (id: string, patch: Record<string, unknown>) => void;
  onContainerDrop?: (parentId: string, key: string, title: string, x?: number, y?: number) => void;
  style?: React.CSSProperties;
}

export default function ContainerCard({
  item, readOnly, allItems, onRemove, onSettings, onExpandH, onExpandV, onResize, onContainerDrop, style = {},
}: ContainerCardProps) {
  const children = item.children ?? [];
  const config = resolveSettings(item.key);
  const containerType = config.type;
  const bg = (item.config?.background as string) || undefined;
  const padding = (item.config?.padding as number) ?? 0;

  // Border config
  const borderEnabled = !!item.config?.borderEnabled;
  const borderColor = (item.config?.borderColor as string) || undefined;
  const borderWidth = (item.config?.borderWidth as number) ?? 1;
  const borderRadius = (item.config?.borderRadius as number) ?? 6;
  const borderStyle = (item.config?.borderStyle as string) ?? 'solid';

  const userBorderStyle: React.CSSProperties = borderEnabled ? {
    border: `${borderWidth}px ${borderStyle} ${borderColor || 'var(--color-border)'}`,
    borderRadius,
  } : {};

  const rootRef = useRef<HTMLDivElement>(null);

  // ── Drag-to-resize ──────────────────────────────────────────────────────────
  type ResizeEdge = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  const cursorMap: Record<ResizeEdge, string> = {
    top: 'ns-resize', bottom: 'ns-resize',
    left: 'ew-resize', right: 'ew-resize',
    'top-left': 'nwse-resize', 'bottom-right': 'nwse-resize',
    'top-right': 'nesw-resize', 'bottom-left': 'nesw-resize',
  };

  const startResize = useCallback((edge: ResizeEdge) => (e: React.MouseEvent) => {
    if (readOnly || !onResize || !rootRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = rootRef.current.offsetWidth;
    const startH = rootRef.current.offsetHeight;
    const parentW = rootRef.current.parentElement?.clientWidth ?? Infinity;

    const resizesRight = edge === 'right' || edge === 'top-right' || edge === 'bottom-right';
    const resizesLeft = edge === 'left' || edge === 'top-left' || edge === 'bottom-left';
    const resizesBottom = edge === 'bottom' || edge === 'bottom-left' || edge === 'bottom-right';
    const resizesTop = edge === 'top' || edge === 'top-left' || edge === 'top-right';

    const clampW = (w: number) => Math.min(Math.max(120, w), parentW);

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const el = rootRef.current;
      if (!el) return;

      if (resizesRight) el.style.width = `${clampW(startW + dx)}px`;
      if (resizesLeft) el.style.width = `${clampW(startW - dx)}px`;
      if (resizesBottom) el.style.height = `${Math.max(80, startH + dy)}px`;
      if (resizesTop) el.style.height = `${Math.max(80, startH - dy)}px`;
    };

    const onMouseUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const patch: Record<string, unknown> = {};

      let newW = startW;
      let newH = startH;
      if (resizesRight) { newW = clampW(startW + dx); patch.w = newW; }
      if (resizesLeft) { newW = clampW(startW - dx); patch.w = newW; }
      if (resizesBottom) { newH = Math.max(80, startH + dy); patch.h = newH; }
      if (resizesTop) { newH = Math.max(80, startH - dy); patch.h = newH; }

      // Proportionally scale children when the container is resized,
      // then resolve any overlaps so no element sits on top of another.
      if (Object.keys(patch).length > 0 && children.length > 0) {
        const scaleX = newW / startW;
        const scaleY = newH / startH;

        // First pass: proportional scale
        const scaled = children.map((child) => {
          const s = { ...child };
          if (scaleX !== 1) {
            s.x = Math.round((child.x ?? 0) * scaleX);
            s.w = Math.max(60, Math.round((child.w ?? DEFAULT_CARD_W) * scaleX));
          }
          if (scaleY !== 1) {
            s.y = Math.round((child.y ?? 0) * scaleY);
            s.h = Math.max(40, Math.round((child.h ?? DEFAULT_CARD_H) * scaleY));
          }
          // Clamp within new container bounds
          s.x = Math.max(0, Math.min(s.x, newW - s.w));
          s.y = Math.max(0, s.y);
          return s;
        });

        // Second pass: resolve overlaps — place each item so it doesn't collide with previously placed items
        const placed: CanvasItem[] = [];
        for (const child of scaled) {
          const cw = child.w ?? DEFAULT_CARD_W;
          const ch = child.h ?? DEFAULT_CARD_H;
          if (!hasCollision(child.id, child.x, child.y, cw, ch, placed)) {
            placed.push(child);
          } else {
            // Push down until no collision
            let y = child.y;
            while (hasCollision(child.id, child.x, y, cw, ch, placed)) {
              y += 8;
            }
            placed.push({ ...child, y });
          }
        }

        patch.children = placed;
      }

      if (Object.keys(patch).length > 0) {
        onResize(item.id, patch);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = cursorMap[edge];
    document.body.style.userSelect = 'none';
  }, [readOnly, onResize, item.id]);

  // ── Drop zone ───────────────────────────────────────────────────────────────
  const droppableId = `container-${item.id}`;
  const bodyRef = useRef<HTMLDivElement>(null);
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: droppableId,
    data: { source: 'container', parentId: item.id },
    disabled: readOnly,
  });

  // Combined ref for drop zone + body element
  const setBodyRef = useCallback((el: HTMLDivElement | null) => {
    (bodyRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    setDropRef(el);
  }, [setDropRef]);

  useDndMonitor({
    onDragEnd(event) {
      if (!onContainerDrop) return;
      const { over, active } = event;
      if (!over || over.id !== droppableId) return;

      const data = active.data.current as { source?: string; key?: string; title?: string } | undefined;
      if (data?.source !== 'tree' || !data.key) return;
      if (!canAcceptChild(item.key, data.key)) return;

      // Calculate drop position relative to the container body, clamped within bounds
      let dropX = 0;
      let dropY = 0;
      if (bodyRef.current) {
        const rect = bodyRef.current.getBoundingClientRect();
        const activeRect = active.rect.current.translated;
        if (activeRect) {
          dropX = Math.max(0, Math.min(
            activeRect.left - rect.left + activeRect.width / 2 - DEFAULT_CARD_W / 2,
            rect.width - DEFAULT_CARD_W,
          ));
          dropY = Math.max(0, Math.min(
            activeRect.top - rect.top + activeRect.height / 2 - DEFAULT_CARD_H / 2,
            rect.height - DEFAULT_CARD_H,
          ));
        }
      }

      onContainerDrop(item.id, data.key, data.title ?? data.key, dropX, dropY);
    },
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  const isRow = containerType === 'row';
  const isColumn = containerType === 'column' || containerType === 'container';
  const isLocked = !!item.config?._locked;

  const toggleLock = () => {
    if (onResize) {
      onResize(item.id, { _config: { ...item.config, _locked: !isLocked } });
    }
  };

  const acceptsLabel = isRow ? 'columns' : isColumn ? 'charts & content' : 'rows';
  const emptyText = isOver ? 'Release to drop' : `Drop ${acceptsLabel} here`;

  const rootClass = isRow ? 'container-row' : isColumn ? 'container-col' : 'container-row';
  const badgeColor = isColumn ? '#6366f1' : '#0ea5a0';

  // Row and Column auto-size to content — only generic Container is manually resizable
  const isResizable = containerType === 'container';

  // Container-level layout mode from config (default: xy)
  const innerLayout = (item.config?.layoutMode as string) ?? 'xy';
  const innerGridCols = (item.config?.gridCols as number) ?? 3;

  const LAYOUT_CYCLE = ['xy', 'rows', 'grid', 'mosaic'] as const;
  const cycleLayout = () => {
    if (readOnly || !onResize) return;
    const idx = LAYOUT_CYCLE.indexOf(innerLayout as typeof LAYOUT_CYCLE[number]);
    const next = LAYOUT_CYCLE[(idx + 1) % LAYOUT_CYCLE.length];

    const patch: Record<string, unknown> = {
      _config: { ...item.config, layoutMode: next },
    };

    // Distribute children positions for the target layout so nothing overlaps.
    // Preserve each child's existing w/h.
    if (children.length > 0) {
      const containerW = rootRef.current?.offsetWidth ?? 600;
      const gap = 12;

      if (next === 'xy') {
        // Lay out in a grid pattern using each child's own size
        const defaultW = 200;
        const defaultH = 160;
        let curX = gap;
        let curY = gap;
        let rowMaxH = 0;

        patch.children = children.map((child) => {
          const cw = child.w || defaultW;
          const ch = child.h || defaultH;

          // Wrap to next row if this child exceeds container width
          if (curX + cw + gap > containerW && curX > gap) {
            curX = gap;
            curY += rowMaxH + gap;
            rowMaxH = 0;
          }

          const placed = { ...child, x: curX, y: curY, w: cw, h: ch };
          curX += cw + gap;
          rowMaxH = Math.max(rowMaxH, ch);
          return placed;
        });
      } else if (next === 'grid') {
        const cols = innerGridCols;
        patch.children = children.map((child, i) => ({
          ...child,
          col: i % cols,
          row: Math.floor(i / cols),
          colSpan: child.colSpan ?? 1,
          rowSpan: child.rowSpan ?? 1,
        }));
      } else if (next === 'rows') {
        patch.children = children.map((child, i) => ({
          ...child,
          row: i,
        }));
      }
      // mosaic: no position data needed — CSS columns handles layout
    }

    onResize(item.id, patch);
  };

  /** Native mouse-drag for children inside XY-layout containers */
  const startChildDrag = useCallback((childId: string, e: React.MouseEvent) => {
    if (readOnly || !onResize) return;
    const child = children.find((c) => c.id === childId);
    if (!child || child.config?._locked) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = child.x ?? 0;
    const origY = child.y ?? 0;
    const childW = child.w ?? DEFAULT_CARD_W;
    const childH = child.h ?? DEFAULT_CARD_H;
    const el = (e.currentTarget as HTMLElement);

    // Get container body bounds for clamping
    const containerW = bodyRef.current?.clientWidth ?? Infinity;
    const containerH = bodyRef.current?.clientHeight ?? Infinity;

    const clampX = (x: number) => Math.max(0, Math.min(x, containerW - childW));
    const clampY = (y: number) => Math.max(0, Math.min(y, containerH - childH));

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      el.style.left = `${clampX(origX + dx)}px`;
      el.style.top = `${clampY(origY + dy)}px`;
    };

    const onMouseUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        onResize(childId, { x: clampX(origX + dx), y: clampY(origY + dy) });
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [readOnly, onResize, children]);

  const renderChild = (child: CanvasItem) => {
    const isChildContainer = resolveSettings(child.key).isContainer;
    if (isChildContainer) {
      return (
        <ContainerCard
          item={child}
          readOnly={readOnly}
          allItems={allItems}
          onRemove={onRemove}
          onSettings={onSettings}
          onExpandH={onExpandH}
          onExpandV={onExpandV}
          onResize={onResize}
          onContainerDrop={onContainerDrop}
          style={{ width: '100%', height: '100%' }}
        />
      );
    }
    return (
      <CanvasCard
        item={child}
        readOnly={readOnly}
        allItems={allItems}
        onRemove={onRemove}
        onSettings={onSettings}
        onExpandH={onExpandH}
        onExpandV={onExpandV}
        onResize={onResize}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      />
    );
  };

  // Layout mode label for the header badge
  const layoutLabel = innerLayout === 'grid' ? 'Grid' : innerLayout === 'xy' ? 'XY' : innerLayout === 'mosaic' ? 'Mosaic' : 'Rows';

  return (
    <div
      ref={rootRef}
      className={[
        rootClass,
        readOnly ? `${rootClass}--readonly` : '',
        isOver && !readOnly ? `${rootClass}--over` : '',
      ].filter(Boolean).join(' ')}
      style={{ ...style, background: bg, ...userBorderStyle }}
    >
      <div className={`${rootClass}__header`}>
        <span
          className="drop-card__type-badge"
          style={{ '--badge-color': badgeColor } as React.CSSProperties}
        >
          {config.label}
        </span>
        {!readOnly ? (
          <button
            className="container-layout-badge container-layout-badge--clickable"
            onClick={(e) => { e.stopPropagation(); cycleLayout(); }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Click to switch layout mode"
          >
            {layoutLabel}
          </button>
        ) : (
          <span className="container-layout-badge">{layoutLabel}</span>
        )}
        <span className={`${rootClass}__label`}>{item.title}</span>
        {isLocked && <LockOutlined className="drop-card__lock-icon" />}
        {!readOnly && (
          <div className="drop-card__actions">
            {!isLocked && isResizable && onExpandH && (
              <button className="drop-card__expand" onClick={(e) => { e.stopPropagation(); onExpandH(item.id); }} title="Expand to fill row">
                <ColumnWidthOutlined />
              </button>
            )}
            {!isLocked && isResizable && onExpandV && (
              <button className="drop-card__expand" onClick={(e) => { e.stopPropagation(); onExpandV(item.id); }} title="Expand to fill column">
                <ColumnHeightOutlined />
              </button>
            )}
            <button
              className={`drop-card__lock ${isLocked ? 'drop-card__lock--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); toggleLock(); }}
              onPointerDown={(e) => e.stopPropagation()}
              title={isLocked ? 'Unlock element' : 'Lock element'}
            >
              {isLocked ? <LockOutlined /> : <UnlockOutlined />}
            </button>
            <button className="drop-card__settings" onClick={(e) => { e.stopPropagation(); onSettings?.(item); }} title="Settings">
              <SettingOutlined />
            </button>
            {!isLocked && (
              <button className="drop-card__remove" onClick={(e) => { e.stopPropagation(); onRemove?.(item.id); }} title="Remove">
                <CloseOutlined />
              </button>
            )}
          </div>
        )}
      </div>
      <div
        ref={setBodyRef}
        data-container-id={item.id}
        className={[
          `${rootClass}__body`,
          `container-layout--${innerLayout}`,
        ].join(' ')}
        style={{
          padding,
          ...(innerLayout === 'grid' ? { '--container-cols': innerGridCols } as React.CSSProperties : {}),
        }}
      >
        {children.length === 0 && (
          <div className={`${rootClass}__empty`}>
            {emptyText}
          </div>
        )}
        {children.length > 0 && children.map((child) => {
          const expandedH = !!child.config?._expandedH;
          const expandedV = !!child.config?._expandedV;
          return (
          <div
            key={child.id}
            className={[
              'container-layout__item',
              expandedH ? 'container-layout__item--expanded-h' : '',
              expandedV ? 'container-layout__item--expanded-v' : '',
              innerLayout === 'xy' ? 'container-layout__item--xy' : '',
            ].filter(Boolean).join(' ')}
            style={
              innerLayout === 'grid' ? {
                gridColumn: expandedH ? '1 / -1' : `span ${(child.config?.span as number) ?? 1}`,
              } : innerLayout === 'xy' ? {
                position: 'absolute',
                left: child.x,
                top: child.y,
                width: child.w ?? 200,
                height: child.h ?? 160,
                cursor: (!readOnly && !child.config?._locked) ? 'grab' : 'default',
              } : undefined
            }
            onMouseDown={innerLayout === 'xy' ? (e) => startChildDrag(child.id, e) : undefined}
            onPointerDown={innerLayout === 'xy' ? (e) => e.stopPropagation() : undefined}
          >
            {renderChild(child)}
          </div>
          );
        })}
      </div>

      {/* Resize handles — only for generic Container, not Row/Column */}
      {!readOnly && !isLocked && isResizable && (
        <>
          <div className="container-resize container-resize--top" onMouseDown={startResize('top')} onPointerDown={(e) => e.stopPropagation()} />
          <div className="container-resize container-resize--right" onMouseDown={startResize('right')} onPointerDown={(e) => e.stopPropagation()} />
          <div className="container-resize container-resize--bottom" onMouseDown={startResize('bottom')} onPointerDown={(e) => e.stopPropagation()} />
          <div className="container-resize container-resize--left" onMouseDown={startResize('left')} onPointerDown={(e) => e.stopPropagation()} />
          <div className="container-resize container-resize--top-left" onMouseDown={startResize('top-left')} onPointerDown={(e) => e.stopPropagation()} />
          <div className="container-resize container-resize--top-right" onMouseDown={startResize('top-right')} onPointerDown={(e) => e.stopPropagation()} />
          <div className="container-resize container-resize--bottom-left" onMouseDown={startResize('bottom-left')} onPointerDown={(e) => e.stopPropagation()} />
          <div className="container-resize container-resize--bottom-right" onMouseDown={startResize('bottom-right')} onPointerDown={(e) => e.stopPropagation()} />
        </>
      )}
    </div>
  );
}
