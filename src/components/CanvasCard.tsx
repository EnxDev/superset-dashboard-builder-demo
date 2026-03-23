import { CloseOutlined, SettingOutlined, ColumnWidthOutlined, ColumnHeightOutlined } from '@ant-design/icons';
import CardPreview from './CardPreview';
import { resolveSettings } from '../data/blockSettings';
import type { CanvasItem } from '../store/templateStore';
import type { BlockCategory } from '../data/blockSettings';

const CATEGORY_COLORS: Record<BlockCategory, string> = {
  chart:  '#1677ff',
  filter: '#eb6f0a',
  tab:    '#8b5cf6',
  layout: '#0ea5a0',
  widget: '#e04380',
};

export interface CanvasCardProps {
  item: CanvasItem;
  readOnly: boolean;
  allItems?: CanvasItem[];
  onRemove?: (id: string) => void;
  onSettings?: (item: CanvasItem) => void;
  onExpandH?: (id: string) => void;
  onExpandV?: (id: string) => void;
  style?: React.CSSProperties;
}

function CanvasCard({
  item, readOnly, allItems, onRemove, onSettings, onExpandH, onExpandV, style = {},
}: CanvasCardProps) {
  const config = resolveSettings(item.key);
  const badgeColor = CATEGORY_COLORS[config.category] ?? '#888';

  return (
    <div
      className={`drop-card ${readOnly ? 'drop-card--readonly' : ''}`}
      style={style}
    >
      <div className="drop-card__header">
        <span
          className="drop-card__type-badge"
          style={{ '--badge-color': badgeColor } as React.CSSProperties}
        >
          {config.label}
        </span>
        <span className="drop-card__label">{item.title}</span>
        {!readOnly && (
          <div className="drop-card__actions">
            {onExpandH && (
              <button className="drop-card__expand" onClick={(e) => { e.stopPropagation(); onExpandH(item.id); }} title="Expand to fill row">
                <ColumnWidthOutlined />
              </button>
            )}
            {onExpandV && (
              <button className="drop-card__expand" onClick={(e) => { e.stopPropagation(); onExpandV(item.id); }} title="Expand to fill column">
                <ColumnHeightOutlined />
              </button>
            )}
            <button className="drop-card__settings" onClick={() => onSettings?.(item)} title="Settings">
              <SettingOutlined />
            </button>
            <button className="drop-card__remove" onClick={() => onRemove?.(item.id)} title="Remove">
              <CloseOutlined />
            </button>
          </div>
        )}
      </div>
      <div className="drop-card__body">
        <CardPreview item={item} allItems={allItems} />
      </div>
    </div>
  );
}

export default CanvasCard;
