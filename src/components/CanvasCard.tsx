import { useRef, useCallback } from 'react';
import { CloseOutlined, SettingOutlined, ColumnWidthOutlined, ColumnHeightOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import CardPreview from './CardPreview';
import { resolveSettings } from '../data/blockSettings';
import type { CanvasItem } from '../store/templateStore';
import type { BlockCategory } from '../data/blockSettings';

const CATEGORY_COLORS: Record<BlockCategory, string> = {
  chart:     '#1677ff',
  filter:    '#eb6f0a',
  tab:       '#8b5cf6',
  layout:    '#0ea5a0',
  widget:    '#e04380',
};

export interface CanvasCardProps {
  item: CanvasItem;
  readOnly: boolean;
  allItems?: CanvasItem[];
  onRemove?: (id: string) => void;
  onSettings?: (item: CanvasItem) => void;
  onExpandH?: (id: string) => void;
  onExpandV?: (id: string) => void;
  onResize?: (id: string, patch: Record<string, unknown>) => void;
  onUpdateConfig?: (id: string, config: Record<string, unknown>) => void;
  style?: React.CSSProperties;
}

type ResizeEdge = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const cursorMap: Record<ResizeEdge, string> = {
  top: 'ns-resize', bottom: 'ns-resize',
  left: 'ew-resize', right: 'ew-resize',
  'top-left': 'nwse-resize', 'bottom-right': 'nwse-resize',
  'top-right': 'nesw-resize', 'bottom-left': 'nesw-resize',
};

function CanvasCard({
  item, readOnly, allItems, onRemove, onSettings, onExpandH, onExpandV, onResize, onUpdateConfig, style = {},
}: CanvasCardProps) {
  const config = resolveSettings(item.key);
  const badgeColor = CATEGORY_COLORS[config.category] ?? '#888';
  const rootRef = useRef<HTMLDivElement>(null);
  const isLocked = !!item.config?._locked;

  const toggleLock = () => {
    if (onResize) {
      onResize(item.id, { _config: { ...item.config, _locked: !isLocked } });
    }
  };

  const startResize = useCallback((edge: ResizeEdge) => (e: React.MouseEvent) => {
    if (readOnly || !onResize || !rootRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    // Target the wrapper (parent) for visual feedback — the card itself may have
    // CSS overrides (width: 100% !important in flow layouts) that prevent direct resizing.
    const wrapper = rootRef.current.parentElement ?? rootRef.current;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = wrapper.offsetWidth;
    const startH = wrapper.offsetHeight;
    const grandParentW = wrapper.parentElement?.clientWidth ?? Infinity;

    const resizesRight = edge === 'right' || edge === 'top-right' || edge === 'bottom-right';
    const resizesLeft = edge === 'left' || edge === 'top-left' || edge === 'bottom-left';
    const resizesBottom = edge === 'bottom' || edge === 'bottom-left' || edge === 'bottom-right';
    const resizesTop = edge === 'top' || edge === 'top-left' || edge === 'top-right';

    const clampW = (w: number) => Math.min(Math.max(80, w), grandParentW);

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (resizesRight) wrapper.style.width = `${clampW(startW + dx)}px`;
      if (resizesLeft) wrapper.style.width = `${clampW(startW - dx)}px`;
      if (resizesBottom) wrapper.style.height = `${Math.max(60, startH + dy)}px`;
      if (resizesTop) wrapper.style.height = `${Math.max(60, startH - dy)}px`;
    };

    const onMouseUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Clear inline styles so React state takes over
      wrapper.style.width = '';
      wrapper.style.height = '';

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const patch: Record<string, unknown> = {};

      if (resizesRight) patch.w = clampW(startW + dx);
      if (resizesLeft) patch.w = clampW(startW - dx);
      if (resizesBottom) patch.h = Math.max(60, startH + dy);
      if (resizesTop) patch.h = Math.max(60, startH - dy);

      if (Object.keys(patch).length > 0) {
        onResize(item.id, patch);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = cursorMap[edge];
    document.body.style.userSelect = 'none';
  }, [readOnly, onResize, item.id]);

  const stopPointer = (e: React.PointerEvent) => e.stopPropagation();

  return (
    <div
      ref={rootRef}
      className={[
        'drop-card',
        readOnly ? 'drop-card--readonly' : '',
        isLocked ? 'drop-card--locked' : '',
      ].filter(Boolean).join(' ')}
      style={style}
    >
      <div className="drop-card__header">
        <span
          className="drop-card__type-badge"
          style={{ '--badge-color': badgeColor } as React.CSSProperties}
        >
          {config.label}
        </span>
        {isLocked && <LockOutlined className="drop-card__lock-icon" />}
        <span className="drop-card__label">{item.title}</span>
        {!readOnly && (
          <div className="drop-card__actions">
            {!isLocked && onExpandH && (
              <button className="drop-card__expand" onClick={(e) => { e.stopPropagation(); onExpandH(item.id); }} title="Expand to fill row">
                <ColumnWidthOutlined />
              </button>
            )}
            {!isLocked && onExpandV && (
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
            <button className="drop-card__settings" onClick={() => onSettings?.(item)} title="Settings">
              <SettingOutlined />
            </button>
            {!isLocked && (
              <button className="drop-card__remove" onClick={() => onRemove?.(item.id)} title="Remove">
                <CloseOutlined />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="drop-card__body">
        <CardPreview
          item={item}
          allItems={allItems}
          readOnly={readOnly}
          onUpdateConfig={onUpdateConfig ?? (onResize ? (id, cfg) => onResize(id, { _config: cfg }) : undefined)}
        />
      </div>

      {/* Resize handles — hidden when locked */}
      {!readOnly && !isLocked && onResize && (
        <>
          <div className="card-resize card-resize--top" onMouseDown={startResize('top')} onPointerDown={stopPointer} />
          <div className="card-resize card-resize--right" onMouseDown={startResize('right')} onPointerDown={stopPointer} />
          <div className="card-resize card-resize--bottom" onMouseDown={startResize('bottom')} onPointerDown={stopPointer} />
          <div className="card-resize card-resize--left" onMouseDown={startResize('left')} onPointerDown={stopPointer} />
          <div className="card-resize card-resize--top-left" onMouseDown={startResize('top-left')} onPointerDown={stopPointer} />
          <div className="card-resize card-resize--top-right" onMouseDown={startResize('top-right')} onPointerDown={stopPointer} />
          <div className="card-resize card-resize--bottom-left" onMouseDown={startResize('bottom-left')} onPointerDown={stopPointer} />
          <div className="card-resize card-resize--bottom-right" onMouseDown={startResize('bottom-right')} onPointerDown={stopPointer} />
        </>
      )}
    </div>
  );
}

export default CanvasCard;
