import { useDraggable } from '@dnd-kit/core';
import CanvasCard from '../CanvasCard';
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
}

export default function DraggableXYCard({
  item, readOnly, allItems, onRemove, onSettings, onExpandH, onExpandV,
}: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { source: 'canvas', item } as const,
    disabled: readOnly,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: item.w ?? DEFAULT_CARD_W,
        height: item.h ?? DEFAULT_CARD_H,
        opacity: isDragging ? 0.4 : 1,
        cursor: readOnly ? 'default' : 'grab',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'left 0.15s, top 0.15s',
      }}
      {...listeners}
      {...attributes}
    >
      <CanvasCard
        item={item}
        readOnly={readOnly}
        allItems={allItems}
        onRemove={onRemove}
        onSettings={onSettings}
        onExpandH={onExpandH}
        onExpandV={onExpandV}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      />
    </div>
  );
}
