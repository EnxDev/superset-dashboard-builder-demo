import { useDraggable } from '@dnd-kit/core';
import CanvasCard from '../CanvasCard';
import ContainerCard from './ContainerCard';
import { isContainerElement } from '../../data/blockSettings';
import { DEFAULT_CARD_W, DEFAULT_CARD_H } from '../../constants';
import type { CanvasItem } from '../../store/templateStore';

interface Props {
  item: CanvasItem;
  readOnly: boolean;
  allItems: CanvasItem[];
  onRemove?: (id: string) => void;
  onSettings?: (item: CanvasItem) => void;
  onExpandH?: (id: string) => void;
  onExpandV?: (id: string) => void;
  onResize?: (id: string, patch: Record<string, unknown>) => void;
  onContainerDrop?: (parentId: string, key: string, title: string, x?: number, y?: number) => void;
}

export default function DraggableXYCard({
  item, readOnly, allItems, onRemove, onSettings, onExpandH, onExpandV, onResize, onContainerDrop,
}: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { source: 'canvas', item } as const,
    disabled: readOnly || !!item.config?._locked,
  });

  const isContainer = isContainerElement(item.key);

  return (
    <div
      ref={setNodeRef}
      data-item-id={item.id}
      style={{
        position: 'absolute',
        left: isContainer ? (item.x || 0) : item.x,
        top: item.y,
        width: isContainer ? (item.w || '100%') : (item.w ?? DEFAULT_CARD_W),
        maxWidth: '100%',
        height: isContainer ? (item.h || 'auto') : (item.h ?? DEFAULT_CARD_H),
        minHeight: isContainer ? 80 : undefined,
        boxSizing: 'border-box',
        opacity: isDragging ? 0.4 : 1,
        cursor: readOnly ? 'default' : 'grab',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'left 0.15s, top 0.15s',
      }}
      {...listeners}
      {...attributes}
    >
      {isContainer ? (
        <ContainerCard
          item={item}
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
      ) : (
        <CanvasCard
          item={item}
          readOnly={readOnly}
          allItems={allItems}
          onRemove={onRemove}
          onSettings={onSettings}
          onExpandH={onExpandH}
          onExpandV={onExpandV}
          onResize={onResize}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        />
      )}
    </div>
  );
}
