import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CanvasCard from '../CanvasCard';
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
}

export default function SortableMosaicCard({ item, readOnly, allItems, onRemove, onSettings, onExpandH, onExpandV }: Props) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: item.id,
    data: { source: 'canvas', item } as const,
    disabled: readOnly,
  });

  const isSpanning = !!item.config?._mosaicSpan;

  const style: React.CSSProperties = {
    height: item.h ?? DEFAULT_CARD_H,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: readOnly ? 'default' : 'grab',
    columnSpan: isSpanning ? 'all' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
