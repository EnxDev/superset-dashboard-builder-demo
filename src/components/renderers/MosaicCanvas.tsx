import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import SortableMosaicCard from './SortableMosaicCard';
import type { CanvasItem } from '../../store/templateStore';

export interface MosaicCanvasProps {
  items: CanvasItem[];
  gridCols: number;
  readOnly: boolean;
  onRemove?: (id: string) => void;
  onSettings?: (item: CanvasItem) => void;
  onExpandH?: (id: string) => void;
  onExpandV?: (id: string) => void;
  onResize?: (id: string, patch: Record<string, unknown>) => void;
  onContainerDrop?: (parentId: string, key: string, title: string, x?: number, y?: number) => void;
}

export default function MosaicCanvas({ items, gridCols, readOnly, onRemove, onSettings, onExpandH, onExpandV, onResize, onContainerDrop }: MosaicCanvasProps) {
  return (
    <SortableContext items={items.map((it) => it.id)} strategy={rectSortingStrategy}>
      <div
        className="dc-mosaic"
        style={{ '--dc-cols': gridCols } as React.CSSProperties}
      >
        {items.map((item) => (
          <SortableMosaicCard
            key={item.id}
            item={item}
            readOnly={readOnly}
            allItems={items}
            onRemove={onRemove}
            onSettings={onSettings}
            onExpandH={onExpandH}
            onExpandV={onExpandV}
            onResize={onResize}
            onContainerDrop={onContainerDrop}
          />
        ))}
      </div>
    </SortableContext>
  );
}
