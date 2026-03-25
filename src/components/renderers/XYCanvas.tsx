import DraggableXYCard from './DraggableXYCard';
import type { CanvasItem } from '../../store/templateStore';

export interface XYCanvasProps {
  items: CanvasItem[];
  readOnly: boolean;
  onRemove?: (id: string) => void;
  onSettings?: (item: CanvasItem) => void;
  onExpandH?: (id: string) => void;
  onExpandV?: (id: string) => void;
  onResize?: (id: string, patch: Record<string, unknown>) => void;
  onContainerDrop?: (parentId: string, key: string, title: string, x?: number, y?: number) => void;
}

export default function XYCanvas({
  items, readOnly, onRemove, onSettings, onExpandH, onExpandV, onResize, onContainerDrop,
}: XYCanvasProps) {
  return (
    <div className="xy-overlay">
      {items.map((item) => (
        <DraggableXYCard
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
  );
}
