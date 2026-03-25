import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CanvasCard from '../CanvasCard';
import ContainerCard from './ContainerCard';
import { isContainerElement } from '../../data/blockSettings';
import { DEFAULT_CARD_H } from '../../constants';
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

export default function SortableRowCard({ item, readOnly, allItems, onRemove, onSettings, onExpandH, onExpandV, onResize, onContainerDrop }: Props) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: item.id,
    data: { source: 'canvas', item } as const,
    disabled: readOnly || !!item.config?._locked,
  });

  const isContainer = isContainerElement(item.key);

  const style: React.CSSProperties = {
    height: isContainer ? 'auto' : (item.h ?? DEFAULT_CARD_H),
    minHeight: isContainer ? 80 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: readOnly ? 'default' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
