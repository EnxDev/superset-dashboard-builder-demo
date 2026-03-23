import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import SortableGridCard from './SortableGridCard';
import type { CanvasItem } from '../../store/templateStore';

export interface GridCanvasProps {
  items: CanvasItem[];
  gridCols: number;
  readOnly: boolean;
  onRemove?: (id: string) => void;
  onSettings?: (item: CanvasItem) => void;
  onExpandH?: (id: string) => void;
  onExpandV?: (id: string) => void;
}

export default function GridCanvas({ items, gridCols, readOnly, onRemove, onSettings, onExpandH, onExpandV }: GridCanvasProps) {
  const sorted = [...items].sort((a, b) => {
    const rowDiff = (a.row ?? 0) - (b.row ?? 0);
    if (rowDiff !== 0) return rowDiff;
    return (a.col ?? 0) - (b.col ?? 0);
  });

  return (
    <SortableContext items={sorted.map((it) => it.id)} strategy={rectSortingStrategy}>
      <div className="dc-grid" style={{ '--dc-cols': gridCols } as React.CSSProperties}>
        {sorted.map((item) => (
          <SortableGridCard
            key={item.id}
            item={item}
            readOnly={readOnly}
            allItems={items}
            onRemove={onRemove}
            onSettings={onSettings}
            onExpandH={onExpandH}
            onExpandV={onExpandV}
            style={{
              gridColumn: `${(item.col ?? 0) + 1} / span ${item.colSpan ?? 1}`,
              gridRow: `${(item.row ?? 0) + 1} / span ${item.rowSpan ?? 1}`,
            }}
          />
        ))}
      </div>
    </SortableContext>
  );
}
