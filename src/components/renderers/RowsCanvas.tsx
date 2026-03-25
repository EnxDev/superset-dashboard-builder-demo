import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableRowCard from './SortableRowCard';
import type { CanvasItem } from '../../store/templateStore';

export interface RowsCanvasProps {
  items: CanvasItem[];
  readOnly: boolean;
  onRemove?: (id: string) => void;
  onSettings?: (item: CanvasItem) => void;
  onExpandH?: (id: string) => void;
  onExpandV?: (id: string) => void;
  onResize?: (id: string, patch: Record<string, unknown>) => void;
  onContainerDrop?: (parentId: string, key: string, title: string, x?: number, y?: number) => void;
}

export default function RowsCanvas({ items, readOnly, onRemove, onSettings, onExpandH, onExpandV, onResize, onContainerDrop }: RowsCanvasProps) {
  const sorted = [...items].sort((a, b) => (a.row ?? 0) - (b.row ?? 0));

  return (
    <SortableContext items={sorted.map((it) => it.id)} strategy={verticalListSortingStrategy}>
      <div className="dc-rows">
        {sorted.map((item) => (
          <SortableRowCard
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
