import { Tag, Tooltip } from 'antd';
import { FilterOutlined, LinkOutlined, DisconnectOutlined, ApiOutlined, SettingOutlined } from '@ant-design/icons';
import type { CanvasItem } from '../store/templateStore';
import type { FilterRule } from './FilterToolboxModal';
import { isFilterElement } from './CardPreview';
import { resolveSettings } from '../data/blockSettings';
import './FilterToolboxRenderer.css';

interface Props {
  item: CanvasItem;
  allItems?: CanvasItem[];
}

export default function FilterToolboxRenderer({ item, allItems = [] }: Props) {
  const config = item.config ?? {};
  const filters = (config.filters as FilterRule[] | undefined) ?? [];
  const settings = resolveSettings(item.key);

  // All non-filter canvas items (potential targets)
  const chartItems = allItems.filter((it) => !isFilterElement(it.key) && it.id !== item.id);

  // No filters configured — show summary of what this filter element is + connected charts
  if (filters.length === 0) {
    return (
      <div className="ftr-root">
        <div className="ftr-header">
          <FilterOutlined className="ftr-header-icon" />
          <span className="ftr-header-label">{settings.label}</span>
        </div>

        {/* Show basic config info if available */}
        <div className="ftr-config-summary">
          <SettingOutlined className="ftr-config-summary__icon" />
          <span className="ftr-config-summary__text">
            {config.filterType
              ? `Type: ${config.filterType}${config.column ? ` on ${config.column}` : ''}`
              : 'No filters configured yet'}
          </span>
        </div>

        {/* Connected charts */}
        <ConnectedChartsSection
          chartItems={chartItems}
          scope={config.scope as 'global' | string[] | undefined}
        />
      </div>
    );
  }

  return (
    <div className="ftr-root">
      {/* Header */}
      <div className="ftr-header">
        <FilterOutlined className="ftr-header-icon" />
        <span className="ftr-header-label">Filters</span>
        <Tag color="blue" className="ftr-active-tag">{filters.length}</Tag>
      </div>

      {/* Filter entries with connected charts */}
      <div className="ftr-entries">
        {filters.map((f) => {
          const isGlobal = f.scope === 'global';
          const scopeArr = Array.isArray(f.scope) ? f.scope : [];

          // Resolve connected chart names
          const connectedCharts = isGlobal
            ? chartItems
            : scopeArr
                .map((id) => chartItems.find((it) => it.id === id))
                .filter(Boolean) as CanvasItem[];

          const label = f.name || f.column || 'Unnamed';
          const detail = f.column ? `${f.filterType} on ${f.column}` : f.filterType;

          return (
            <div key={f.id} className="ftr-entry">
              {/* Filter chip row */}
              <div className="ftr-entry__chip">
                <span className="ftr-chip-label">{label}</span>
                <Tag className="ftr-chip-type">{f.filterType}</Tag>
                <span className="ftr-chip-scope">
                  {isGlobal
                    ? <Tooltip title="Applies to all charts"><LinkOutlined /></Tooltip>
                    : <Tooltip title={`Scoped to ${connectedCharts.length} chart${connectedCharts.length !== 1 ? 's' : ''}`}>
                        <span><DisconnectOutlined /> <span className="ftr-chip-scope-count">{scopeArr.length}</span></span>
                      </Tooltip>
                  }
                </span>
              </div>

              {/* Connected charts list */}
              <div className="ftr-connections">
                <ApiOutlined className="ftr-connections__icon" />
                {connectedCharts.length === 0 ? (
                  <span className="ftr-connections__none">No charts connected</span>
                ) : isGlobal ? (
                  <Tooltip title={connectedCharts.map((c) => c.title).join(', ')}>
                    <span className="ftr-connections__global">
                      All charts ({connectedCharts.length})
                    </span>
                  </Tooltip>
                ) : (
                  <div className="ftr-connections__list">
                    {connectedCharts.map((chart) => (
                      <Tooltip key={chart.id} title={detail}>
                        <span className="ftr-connections__tag">{chart.title}</span>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Shared connected charts section */
function ConnectedChartsSection({ chartItems, scope }: {
  chartItems: CanvasItem[];
  scope?: 'global' | string[];
}) {
  const isGlobal = !scope || scope === 'global';
  const scopeArr = Array.isArray(scope) ? scope : [];

  const connectedCharts = isGlobal
    ? chartItems
    : scopeArr
        .map((id) => chartItems.find((it) => it.id === id))
        .filter(Boolean) as CanvasItem[];

  return (
    <div className="ftr-connections">
      <ApiOutlined className="ftr-connections__icon" />
      {chartItems.length === 0 ? (
        <span className="ftr-connections__none">No charts on canvas</span>
      ) : connectedCharts.length === 0 ? (
        <span className="ftr-connections__none">No charts connected</span>
      ) : isGlobal ? (
        <Tooltip title={connectedCharts.map((c) => c.title).join(', ')}>
          <span className="ftr-connections__global">
            All charts ({connectedCharts.length})
          </span>
        </Tooltip>
      ) : (
        <div className="ftr-connections__list">
          {connectedCharts.map((chart) => (
            <span key={chart.id} className="ftr-connections__tag">{chart.title}</span>
          ))}
        </div>
      )}
    </div>
  );
}
