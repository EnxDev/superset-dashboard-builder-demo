import { Tag, Tooltip } from 'antd';
import { FilterOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import type { CanvasItem } from '../store/templateStore';
import type { FilterRule } from './FilterToolboxModal';
import { isFilterElement } from './CardPreview';
import { resolveSettings } from '../data/blockSettings';
import './FilterToolboxRenderer.css';

const FILTER_TYPE_LABELS: Record<string, string> = {
  value: 'Value',
  range: 'Range',
  time: 'Time',
  timegrain: 'Time Grain',
  timecolumn: 'Time Column',
};

// ── Main renderer ────────────────────────────────────────────────────────────

interface Props {
  item: CanvasItem;
  allItems?: CanvasItem[];
}

export default function FilterToolboxRenderer({ item, allItems = [] }: Props) {
  const config = item.config ?? {};
  const filters = (config.filters as FilterRule[] | undefined) ?? [];
  const settings = resolveSettings(item.key);
  const orientation = (config.orientation as string) ?? 'vertical';

  const chartItems = allItems.filter((it) => !isFilterElement(it.key) && it.id !== item.id);

  // No filters configured — show empty state
  if (filters.length === 0) {
    const singleFilterType = config.filterType as string | undefined;
    if (singleFilterType) {
      const pseudoFilter: FilterRule = {
        id: 'single',
        filterType: singleFilterType,
        name: (config.title as string) || '',
        dataset: (config.dataset as string) || 'sales',
        column: (config.column as string) || '',
        multiSelect: (config.multiSelect as boolean) ?? true,
        dynamicSearch: (config.searchEnabled as boolean) ?? false,
        defaultValue: (config.defaultValue as string) || '',
        preFilterValues: false, sortFilterValues: false, description: '',
        matchType: 'in', hasDefaultValue: false, isRequired: false,
        selectFirstByDefault: false, allowNewValues: false,
        inverseSelection: false,
        scope: (config.scope as 'global' | string[]) ?? 'global',
      };
      return (
        <div className="ftr-root">
          <FilterInfo filter={pseudoFilter} label={settings.label} chartItems={chartItems} />
        </div>
      );
    }

    return (
      <div className="ftr-root">
        <div className="ftr-empty-state">
          <FilterOutlined className="ftr-empty-state__icon" />
          <span>No filters configured</span>
          <span className="ftr-empty-state__hint">Click settings to add filters</span>
        </div>
      </div>
    );
  }

  // Multiple filters
  return (
    <div className={`ftr-root ftr-root--${orientation}`}>
      <div className="ftr-header">
        <FilterOutlined className="ftr-header-icon" />
        <span className="ftr-header-label">Filters</span>
        <Tag color="blue" className="ftr-active-tag">{filters.length}</Tag>
      </div>

      <div className={`ftr-controls ftr-controls--${orientation}`}>
        {filters.map((f) => (
          <FilterInfo key={f.id} filter={f} chartItems={chartItems} />
        ))}
      </div>
    </div>
  );
}

// ── Filter info (non-interactive) ────────────────────────────────────────────

function FilterInfo({ filter, label, chartItems }: { filter: FilterRule; label?: string; chartItems: CanvasItem[] }) {
  const typeName = FILTER_TYPE_LABELS[filter.filterType] ?? filter.filterType;
  return (
    <div className="ftr-filter-control">
      <div className="ftr-control-label">
        <span className="ftr-control-name">{filter.name || filter.column || label || 'Unnamed'}</span>
        <ScopeIndicator filter={filter} chartItems={chartItems} />
      </div>
      <div className="ftr-filter-info">
        <Tag color="processing" className="ftr-filter-type-tag">{typeName}</Tag>
        {filter.dataset && <span className="ftr-filter-dataset">{filter.dataset}</span>}
        {filter.column && <span className="ftr-filter-column">{filter.column}</span>}
      </div>
    </div>
  );
}

// ── Scope indicator ──────────────────────────────────────────────────────────

function ScopeIndicator({ filter, chartItems }: { filter: FilterRule; chartItems: CanvasItem[] }) {
  const isGlobal = filter.scope === 'global';
  const scopeCount = Array.isArray(filter.scope) ? filter.scope.length : chartItems.length;

  return (
    <Tooltip title={isGlobal ? 'Applies to all charts' : `Scoped to ${scopeCount} chart${scopeCount !== 1 ? 's' : ''}`}>
      <span className="ftr-scope-indicator">
        {isGlobal ? <LinkOutlined /> : <><DisconnectOutlined /> <span>{scopeCount}</span></>}
      </span>
    </Tooltip>
  );
}
