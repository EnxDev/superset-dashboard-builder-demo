import { useState, useEffect } from 'react';
import {
  Modal, Form, Input, Select, Button, Checkbox, Tabs, Collapse, Tooltip,
} from 'antd';
import { PlusOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import './FilterToolboxModal.css';

// ── Types ────────────────────────────────────────────────────────────────────

export interface FilterRule {
  id: string;
  filterType: string;
  name: string;
  dataset: string;
  column: string;
  // Filter Configuration
  preFilterValues: boolean;
  sortFilterValues: boolean;
  // Filter Settings
  description: string;
  matchType: string;
  hasDefaultValue: boolean;
  defaultValue: string;
  isRequired: boolean;
  selectFirstByDefault: boolean;
  allowNewValues: boolean;
  multiSelect: boolean;
  dynamicSearch: boolean;
  inverseSelection: boolean;
  // Scoping
  scope: 'global' | string[];
}

export interface FilterToolboxConfig {
  title: string;
  filters: FilterRule[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const FILTER_TYPES = [
  { label: 'Value', value: 'value' },
  { label: 'Range', value: 'range' },
  { label: 'Time', value: 'time' },
  { label: 'Time Grain', value: 'timegrain' },
  { label: 'Time Column', value: 'timecolumn' },
];

const DATASETS = [
  { label: 'wb_health_population', value: 'wb_health_population' },
  { label: 'Sales', value: 'sales' },
  { label: 'Users', value: 'users' },
  { label: 'Events', value: 'events' },
  { label: 'Revenue', value: 'revenue' },
];

const COLUMNS_BY_DATASET: Record<string, { label: string; value: string }[]> = {
  wb_health_population: [
    { label: 'country_name', value: 'country_name' },
    { label: 'region', value: 'region' },
    { label: 'year', value: 'year' },
    { label: 'SP.POP.TOTL', value: 'SP.POP.TOTL' },
    { label: 'SP.RUR.TOTL', value: 'SP.RUR.TOTL' },
  ],
  sales: [
    { label: 'Category', value: 'category' },
    { label: 'Region', value: 'region' },
    { label: 'Status', value: 'status' },
    { label: 'Product', value: 'product' },
  ],
  users: [
    { label: 'Username', value: 'username' },
    { label: 'Role', value: 'role' },
    { label: 'Active', value: 'active' },
  ],
  events: [
    { label: 'Event Type', value: 'event_type' },
    { label: 'Source', value: 'source' },
    { label: 'Date', value: 'date' },
  ],
  revenue: [
    { label: 'Country', value: 'country' },
    { label: 'Product Line', value: 'product_line' },
    { label: 'Amount', value: 'amount' },
    { label: 'Date', value: 'date' },
  ],
};

const MATCH_TYPES = [
  { label: 'Exact match (IN)', value: 'in' },
  { label: 'Like', value: 'like' },
  { label: 'iLike', value: 'ilike' },
  { label: 'Regex', value: 'regex' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function createEmptyFilter(): FilterRule {
  return {
    id: `fr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    filterType: 'value',
    name: '',
    dataset: '',
    column: '',
    preFilterValues: false,
    sortFilterValues: false,
    description: '',
    matchType: 'in',
    hasDefaultValue: false,
    defaultValue: '',
    isRequired: false,
    selectFirstByDefault: false,
    allowNewValues: true,
    multiSelect: true,
    dynamicSearch: false,
    inverseSelection: false,
    scope: 'global',
  };
}

// ── Props ────────────────────────────────────────────────────────────────────

/** Infer the filter type from a tree node key */
function inferFilterType(key: string): string {
  const k = key.toLowerCase();
  if (k.includes('timegrain')) return 'timegrain';
  if (k.includes('timecolumn')) return 'timecolumn';
  if (k.includes('time')) return 'time';
  if (k.includes('range')) return 'range';
  if (k.includes('value')) return 'value';
  return 'value';
}

interface Props {
  open: boolean;
  nodeKey?: string;
  nodeTitle: string;
  isEditing?: boolean;
  initialConfig?: Partial<FilterToolboxConfig>;
  canvasItems?: { id: string; title: string }[];
  onConfirm: (config: Record<string, unknown>) => void;
  onCancel: () => void;
}

// ── Main Modal ───────────────────────────────────────────────────────────────

export default function FilterToolboxModal({
  open, nodeKey, nodeTitle, isEditing, initialConfig, canvasItems = [], onConfirm, onCancel,
}: Props) {
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState('settings');

  useEffect(() => {
    if (open) {
      const init = initialConfig ?? {};
      let initFilters = (init.filters as FilterRule[] | undefined) ?? [];

      // When dropping a specific filter type (not editing, not a toolbox container),
      // pre-create a filter with the inferred type
      if (!isEditing && initFilters.length === 0 && nodeKey) {
        const k = nodeKey.toLowerCase();
        const isToolboxContainer = k.includes('filtertoolbox') || k.includes('filterbar');
        if (!isToolboxContainer) {
          const preFilter: FilterRule = {
            ...createEmptyFilter(),
            filterType: inferFilterType(nodeKey),
            name: nodeTitle,
          };
          initFilters = [preFilter];
        }
      }

      setFilters(initFilters);
      setSelectedId(initFilters.length > 0 ? initFilters[0].id : null);
      setRightTab('settings');
    }
  }, [open, initialConfig, isEditing, nodeKey, nodeTitle]);

  const selected = filters.find((f) => f.id === selectedId) ?? null;

  // ── CRUD ──

  const addFilter = () => {
    const f = createEmptyFilter();
    setFilters((prev) => [...prev, f]);
    setSelectedId(f.id);
    setRightTab('settings');
  };

  const removeFilter = (id: string) => {
    setFilters((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (selectedId === id) {
        setSelectedId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  const updateSelected = (patch: Partial<FilterRule>) => {
    if (!selectedId) return;
    setFilters((prev) => prev.map((f) => f.id === selectedId ? { ...f, ...patch } : f));
  };

  // ── Submit ──

  const handleOk = () => {
    onConfirm({
      title: nodeTitle,
      filters,
    });
    setFilters([]);
    setSelectedId(null);
  };

  const handleCancel = () => {
    setFilters([]);
    setSelectedId(null);
    onCancel();
  };

  return (
    <Modal
      open={open}
      title="Add or edit display controls"
      okText={isEditing ? 'Save' : 'Save'}
      cancelText="Cancel"
      onOk={handleOk}
      onCancel={handleCancel}
      width={860}
      destroyOnClose
      className="ftm-modal"
    >
      <div className="ftm-layout">
        {/* ── Left sidebar ── */}
        <div className="ftm-sidebar">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={addFilter}
            className="ftm-new-btn"
          >
            New
          </Button>

          {/* Filters list */}
          <div className="ftm-sidebar-section">
            <div className="ftm-sidebar-heading">Filters ({filters.length})</div>
            <div className="ftm-sidebar-list">
              {filters.map((f) => (
                <div
                  key={f.id}
                  className={`ftm-sidebar-item ${selectedId === f.id ? 'ftm-sidebar-item--active' : ''}`}
                  onClick={() => { setSelectedId(f.id); setRightTab('settings'); }}
                >
                  <HolderOutlined className="ftm-sidebar-drag" />
                  <Input
                    size="small"
                    value={f.name}
                    placeholder="Unnamed filter"
                    className="ftm-sidebar-input"
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters((prev) => prev.map((x) => x.id === f.id ? { ...x, name: val } : x));
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Tooltip title="Remove filter">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => { e.stopPropagation(); removeFilter(f.id); }}
                      className="ftm-sidebar-delete"
                    />
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>

          {/* Display controls stub */}
          <div className="ftm-sidebar-section">
            <div className="ftm-sidebar-heading">Display controls (0)</div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="ftm-panel">
          {selected ? (
            <Tabs
              activeKey={rightTab}
              onChange={setRightTab}
              size="small"
              className="ftm-panel-tabs"
              items={[
                {
                  key: 'settings',
                  label: 'Settings',
                  children: <SettingsPane filter={selected} onUpdate={updateSelected} />,
                },
                {
                  key: 'scoping',
                  label: 'Scoping',
                  children: <ScopingPane filter={selected} canvasItems={canvasItems} onUpdate={updateSelected} />,
                },
              ]}
            />
          ) : (
            <div className="ftm-panel-empty">
              Select a filter or click <strong>+ New</strong> to configure.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── Settings Pane ────────────────────────────────────────────────────────────

function SettingsPane({ filter, onUpdate }: { filter: FilterRule; onUpdate: (p: Partial<FilterRule>) => void }) {
  const columnOptions = COLUMNS_BY_DATASET[filter.dataset] ?? [];

  return (
    <Form layout="vertical" size="small" className="ftm-form">
      {/* Top row: Filter Type + Filter Name */}
      <div className="ftm-form-row">
        <Form.Item label={<>Filter Type <span className="ftm-required">*</span></>} className="ftm-form-half">
          <Select
            value={filter.filterType}
            onChange={(v) => onUpdate({ filterType: v })}
            options={FILTER_TYPES}
          />
        </Form.Item>
        <Form.Item label={<>Filter name <span className="ftm-required">*</span></>} className="ftm-form-half">
          <Input
            value={filter.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Filter name"
          />
        </Form.Item>
      </div>

      {/* Dataset + Column row */}
      <div className="ftm-form-row">
        <Form.Item label={<>Dataset <span className="ftm-required">*</span></>} className="ftm-form-half">
          <Select
            value={filter.dataset || undefined}
            onChange={(v) => onUpdate({ dataset: v, column: '' })}
            options={DATASETS}
            placeholder="Select dataset"
          />
        </Form.Item>
        <Form.Item label={<>Column <span className="ftm-required">*</span></>} className="ftm-form-half">
          <Select
            value={filter.column || undefined}
            onChange={(v) => onUpdate({ column: v })}
            options={columnOptions}
            placeholder="Select column"
            disabled={!filter.dataset}
          />
        </Form.Item>
      </div>

      {/* Filter Configuration section */}
      <Collapse
        ghost
        defaultActiveKey={['config']}
        className="ftm-section-collapse"
        items={[{
          key: 'config',
          label: <span className="ftm-section-title">Filter Configuration</span>,
          children: (
            <div className="ftm-checkboxes">
              <Checkbox
                checked={filter.preFilterValues}
                onChange={(e) => onUpdate({ preFilterValues: e.target.checked })}
              >
                Pre-filter available values
                <Tooltip title="When enabled, only values relevant to other applied filters will be shown">
                  <span className="ftm-info">&#9432;</span>
                </Tooltip>
              </Checkbox>
              <Checkbox
                checked={filter.sortFilterValues}
                onChange={(e) => onUpdate({ sortFilterValues: e.target.checked })}
              >
                Sort filter values
              </Checkbox>
            </div>
          ),
        }]}
      />

      {/* Filter Settings section */}
      <Collapse
        ghost
        defaultActiveKey={['settings']}
        className="ftm-section-collapse"
        items={[{
          key: 'settings',
          label: <span className="ftm-section-title">Filter Settings</span>,
          children: (
            <div className="ftm-settings-body">
              <Form.Item label="Description">
                <Input.TextArea
                  value={filter.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  rows={3}
                  placeholder=""
                />
              </Form.Item>
              <Form.Item label={<>Match type <Tooltip title="Choose the type of match for the filter"><span className="ftm-info">&#9432;</span></Tooltip></>}>
                <Select
                  value={filter.matchType}
                  onChange={(v) => onUpdate({ matchType: v })}
                  options={MATCH_TYPES}
                />
              </Form.Item>
              <div className="ftm-checkboxes">
                <Checkbox
                  checked={filter.hasDefaultValue}
                  onChange={(e) => onUpdate({ hasDefaultValue: e.target.checked })}
                >
                  Filter has default value
                </Checkbox>
                <Checkbox
                  checked={filter.isRequired}
                  onChange={(e) => onUpdate({ isRequired: e.target.checked })}
                >
                  Filter value is required
                  <Tooltip title="Users must provide a value before applying"><span className="ftm-info">&#9432;</span></Tooltip>
                </Checkbox>
                <Checkbox
                  checked={filter.selectFirstByDefault}
                  onChange={(e) => onUpdate({ selectFirstByDefault: e.target.checked })}
                >
                  Select first filter value by default
                  <Tooltip title="Automatically selects the first available value"><span className="ftm-info">&#9432;</span></Tooltip>
                </Checkbox>
                <Checkbox
                  checked={filter.allowNewValues}
                  onChange={(e) => onUpdate({ allowNewValues: e.target.checked })}
                >
                  Allow creation of new values
                </Checkbox>
                <Checkbox
                  checked={filter.multiSelect}
                  onChange={(e) => onUpdate({ multiSelect: e.target.checked })}
                >
                  Can select multiple values
                </Checkbox>
                <Checkbox
                  checked={filter.dynamicSearch}
                  onChange={(e) => onUpdate({ dynamicSearch: e.target.checked })}
                >
                  Dynamically search all filter values
                  <Tooltip title="When enabled, filter values are fetched live as you type"><span className="ftm-info">&#9432;</span></Tooltip>
                </Checkbox>
                <Checkbox
                  checked={filter.inverseSelection}
                  onChange={(e) => onUpdate({ inverseSelection: e.target.checked })}
                >
                  Inverse selection
                  <Tooltip title="Excludes selected values instead of including them"><span className="ftm-info">&#9432;</span></Tooltip>
                </Checkbox>
              </div>
            </div>
          ),
        }]}
      />
    </Form>
  );
}

// ── Scoping Pane ─────────────────────────────────────────────────────────────

function ScopingPane({
  filter, canvasItems, onUpdate,
}: {
  filter: FilterRule;
  canvasItems: { id: string; title: string }[];
  onUpdate: (p: Partial<FilterRule>) => void;
}) {
  const isGlobal = filter.scope === 'global';

  return (
    <div className="ftm-scoping">
      <p className="ftm-scoping-desc">
        Choose which charts and tabs this filter applies to. By default, filters apply to all charts (cross-scope).
      </p>

      <div className="ftm-scoping-mode">
        <Button
          size="small"
          type={isGlobal ? 'primary' : 'default'}
          onClick={() => onUpdate({ scope: 'global' })}
          block
          className="ftm-scope-mode-btn"
        >
          Apply to all charts &amp; tabs (cross-scope)
        </Button>
        <Button
          size="small"
          type={!isGlobal ? 'primary' : 'default'}
          onClick={() => onUpdate({ scope: [] })}
          block
          className="ftm-scope-mode-btn"
        >
          Apply to specific charts &amp; tabs only
        </Button>
      </div>

      {!isGlobal && (
        <div className="ftm-scoping-targets">
          <div className="ftm-scoping-targets-label">Select charts this filter applies to:</div>
          {canvasItems.length === 0 ? (
            <div className="ftm-scoping-empty">No charts on canvas yet. Add charts first, then configure scoping.</div>
          ) : (
            <div className="ftm-scoping-checkboxes">
              {canvasItems.map((item) => {
                const scopeArr = Array.isArray(filter.scope) ? filter.scope : [];
                const checked = scopeArr.includes(item.id);
                return (
                  <Checkbox
                    key={item.id}
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...scopeArr, item.id]
                        : scopeArr.filter((x) => x !== item.id);
                      onUpdate({ scope: next });
                    }}
                  >
                    {item.title}
                  </Checkbox>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
