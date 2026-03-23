export type FieldType =
  | 'text'
  | 'select'
  | 'multiselect'
  | 'number'
  | 'toggle'
  | 'color'
  | 'daterange';

export interface SettingsField {
  key: string;
  label: string;
  type: FieldType;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export type BlockCategory = 'chart' | 'filter' | 'tab' | 'layout' | 'widget';

export interface BlockSettingsConfig {
  type: string;
  label: string;
  category: BlockCategory;
  fields: SettingsField[];
}

// ── Shared field banks ────────────────────────────────────────────────────────

const commonFields: SettingsField[] = [
  { key: 'title', label: 'Title', type: 'text', placeholder: 'Title' },
  {
    key: 'refreshInterval',
    label: 'Refresh interval (s)',
    type: 'number',
    defaultValue: 0,
    min: 0,
    max: 3600,
  },
  { key: 'visible', label: 'Visible', type: 'toggle', defaultValue: true },
];

const chartCommonFields: SettingsField[] = [
  ...commonFields,
  {
    key: 'colorScheme',
    label: 'Color scheme',
    type: 'select',
    defaultValue: 'supersetColors',
    options: [
      { label: 'Superset Colors', value: 'supersetColors' },
      { label: 'Google Category 10c', value: 'googleCategory10c' },
      { label: 'Lyft Brand Colors', value: 'lyftBrand' },
      { label: 'Airbnb Colors', value: 'airbnb' },
    ],
  },
  { key: 'showLegend', label: 'Show legend', type: 'toggle', defaultValue: true },
  { key: 'showTooltip', label: 'Show tooltip', type: 'toggle', defaultValue: true },
];

const dataSourceFields: SettingsField[] = [
  {
    key: 'dataset',
    label: 'Dataset',
    type: 'select',
    options: [
      { label: 'Sales', value: 'sales' },
      { label: 'Users', value: 'users' },
      { label: 'Events', value: 'events' },
      { label: 'Revenue', value: 'revenue' },
    ],
    placeholder: 'Select dataset',
  },
  {
    key: 'timeGrain',
    label: 'Time grain',
    type: 'select',
    defaultValue: 'P1D',
    options: [
      { label: 'Hour', value: 'PT1H' },
      { label: 'Day', value: 'P1D' },
      { label: 'Week', value: 'P1W' },
      { label: 'Month', value: 'P1M' },
      { label: 'Year', value: 'P1Y' },
    ],
  },
  { key: 'timeRange', label: 'Time range', type: 'daterange' },
];

// ── Per-type settings map ─────────────────────────────────────────────────────

const settingsMap: Record<string, BlockSettingsConfig> = {
  // ── Charts ──
  pie: {
    type: 'pie',
    label: 'Pie Chart',
    category: 'chart',
    fields: [
      ...chartCommonFields,
      ...dataSourceFields,
      {
        key: 'metric',
        label: 'Metric',
        type: 'select',
        options: [
          { label: 'Count', value: 'count' },
          { label: 'Sum', value: 'sum' },
          { label: 'Average', value: 'avg' },
        ],
      },
      { key: 'groupby', label: 'Group by', type: 'multiselect', options: [
        { label: 'Category', value: 'category' },
        { label: 'Region', value: 'region' },
        { label: 'Product', value: 'product' },
      ]},
      { key: 'donut', label: 'Donut style', type: 'toggle', defaultValue: false },
      { key: 'outerRadius', label: 'Outer radius (%)', type: 'number', defaultValue: 70, min: 10, max: 100 },
    ],
  },

  bar: {
    type: 'bar',
    label: 'Bar Chart',
    category: 'chart',
    fields: [
      ...chartCommonFields,
      ...dataSourceFields,
      {
        key: 'orientation',
        label: 'Orientation',
        type: 'select',
        defaultValue: 'vertical',
        options: [
          { label: 'Vertical', value: 'vertical' },
          { label: 'Horizontal', value: 'horizontal' },
        ],
      },
      { key: 'stacked', label: 'Stacked', type: 'toggle', defaultValue: false },
      { key: 'showLabels', label: 'Show bar labels', type: 'toggle', defaultValue: false },
      { key: 'metrics', label: 'Metrics', type: 'multiselect', options: [
        { label: 'Count', value: 'count' },
        { label: 'Sum', value: 'sum' },
        { label: 'Average', value: 'avg' },
        { label: 'Max', value: 'max' },
      ]},
    ],
  },

  line: {
    type: 'line',
    label: 'Line Chart',
    category: 'chart',
    fields: [
      ...chartCommonFields,
      ...dataSourceFields,
      { key: 'smooth', label: 'Smooth curve', type: 'toggle', defaultValue: false },
      { key: 'showArea', label: 'Show area', type: 'toggle', defaultValue: false },
      { key: 'showPoints', label: 'Show data points', type: 'toggle', defaultValue: true },
      {
        key: 'yAxisFormat',
        label: 'Y-axis format',
        type: 'select',
        defaultValue: 'SMART_NUMBER',
        options: [
          { label: 'Smart number', value: 'SMART_NUMBER' },
          { label: 'Integer', value: ',d' },
          { label: 'Float', value: '.2f' },
          { label: 'Percentage', value: '.0%' },
        ],
      },
    ],
  },

  scatter: {
    type: 'scatter',
    label: 'Scatter Plot',
    category: 'chart',
    fields: [
      ...chartCommonFields,
      ...dataSourceFields,
      { key: 'xAxis', label: 'X axis metric', type: 'select', options: [
        { label: 'Revenue', value: 'revenue' },
        { label: 'Sessions', value: 'sessions' },
        { label: 'Duration', value: 'duration' },
      ]},
      { key: 'yAxis', label: 'Y axis metric', type: 'select', options: [
        { label: 'Conversion', value: 'conversion' },
        { label: 'Bounce rate', value: 'bounce' },
        { label: 'Revenue', value: 'revenue' },
      ]},
      { key: 'bubbleSize', label: 'Bubble size metric', type: 'select', options: [
        { label: 'None', value: '' },
        { label: 'Count', value: 'count' },
        { label: 'Revenue', value: 'revenue' },
      ]},
    ],
  },

  area: {
    type: 'area',
    label: 'Area Chart',
    category: 'chart',
    fields: [
      ...chartCommonFields,
      ...dataSourceFields,
      { key: 'stacked', label: 'Stacked', type: 'toggle', defaultValue: false },
      { key: 'smooth', label: 'Smooth curve', type: 'toggle', defaultValue: false },
      { key: 'opacity', label: 'Fill opacity (%)', type: 'number', defaultValue: 30, min: 0, max: 100 },
    ],
  },

  table: {
    type: 'table',
    label: 'Table Chart',
    category: 'chart',
    fields: [
      ...chartCommonFields,
      ...dataSourceFields,
      { key: 'pageSize', label: 'Page size', type: 'number', defaultValue: 25, min: 5, max: 200 },
      { key: 'showSearch', label: 'Show search bar', type: 'toggle', defaultValue: true },
      { key: 'includeSearch', label: 'Include search', type: 'toggle', defaultValue: false },
    ],
  },

  pivot: {
    type: 'pivot',
    label: 'Pivot Table',
    category: 'chart',
    fields: [
      ...chartCommonFields,
      ...dataSourceFields,
      { key: 'groupbyRows', label: 'Row grouping', type: 'multiselect', options: [
        { label: 'Category', value: 'category' },
        { label: 'Region', value: 'region' },
        { label: 'Product', value: 'product' },
      ]},
      { key: 'groupbyCols', label: 'Column grouping', type: 'multiselect', options: [
        { label: 'Year', value: 'year' },
        { label: 'Quarter', value: 'quarter' },
        { label: 'Month', value: 'month' },
      ]},
      { key: 'transposePivot', label: 'Transpose', type: 'toggle', defaultValue: false },
    ],
  },

  bignum: {
    type: 'bignum',
    label: 'Big Number',
    category: 'chart',
    fields: [
      ...chartCommonFields,
      ...dataSourceFields,
      { key: 'metric', label: 'Metric', type: 'select', options: [
        { label: 'Count', value: 'count' },
        { label: 'Sum', value: 'sum' },
        { label: 'Average', value: 'avg' },
      ]},
      { key: 'subheader', label: 'Subheader', type: 'text', placeholder: 'Description text' },
    ],
  },

  trendline: {
    type: 'trendline',
    label: 'Big Number with Trendline',
    category: 'chart',
    fields: [
      ...chartCommonFields,
      ...dataSourceFields,
      { key: 'metric', label: 'Metric', type: 'select', options: [
        { label: 'Count', value: 'count' },
        { label: 'Sum', value: 'sum' },
        { label: 'Average', value: 'avg' },
      ]},
      { key: 'subheader', label: 'Subheader', type: 'text', placeholder: 'Description text' },
      { key: 'showTrendline', label: 'Show trendline', type: 'toggle', defaultValue: true },
    ],
  },

  map: {
    type: 'map',
    label: 'Map',
    category: 'chart',
    fields: [
      ...chartCommonFields,
      ...dataSourceFields,
      { key: 'mapType', label: 'Map type', type: 'select', defaultValue: 'world',
        options: [
          { label: 'World', value: 'world' },
          { label: 'Country', value: 'country' },
        ],
      },
    ],
  },

  // ── Filters ──
  filter: {
    type: 'filter',
    label: 'Filter',
    category: 'filter',
    fields: [
      ...commonFields,
      {
        key: 'filterType',
        label: 'Filter type',
        type: 'select',
        defaultValue: 'value',
        options: [
          { label: 'Value', value: 'value' },
          { label: 'Range', value: 'range' },
          { label: 'Time', value: 'time' },
          { label: 'Time grain', value: 'timegrain' },
          { label: 'Time column', value: 'timecolumn' },
        ],
      },
      { key: 'column', label: 'Column', type: 'select', options: [
        { label: 'Category', value: 'category' },
        { label: 'Region', value: 'region' },
        { label: 'Status', value: 'status' },
        { label: 'Date', value: 'date' },
      ]},
      { key: 'multiSelect', label: 'Multi-select', type: 'toggle', defaultValue: false },
      { key: 'searchEnabled', label: 'Enable search', type: 'toggle', defaultValue: true },
      { key: 'defaultValue', label: 'Default value', type: 'text', placeholder: 'Leave blank for none' },
    ],
  },

  filtertoolbox: {
    type: 'filtertoolbox',
    label: 'Filter Toolbox',
    category: 'filter',
    fields: [
      ...commonFields,
      { key: 'orientation', label: 'Orientation', type: 'select', defaultValue: 'horizontal',
        options: [
          { label: 'Horizontal', value: 'horizontal' },
          { label: 'Vertical', value: 'vertical' },
        ],
      },
      { key: 'showPresets', label: 'Show quick presets', type: 'toggle', defaultValue: true },
      { key: 'showScoping', label: 'Enable scoping', type: 'toggle', defaultValue: true },
      { key: 'collapsible', label: 'Collapsible', type: 'toggle', defaultValue: true },
      { key: 'maxFilters', label: 'Max filters', type: 'number', defaultValue: 10, min: 1, max: 30 },
    ],
  },

  filterbar: {
    type: 'filterbar',
    label: 'Filter Bar',
    category: 'filter',
    fields: [
      ...commonFields,
      { key: 'orientation', label: 'Orientation', type: 'select', defaultValue: 'horizontal',
        options: [
          { label: 'Horizontal', value: 'horizontal' },
          { label: 'Vertical', value: 'vertical' },
        ],
      },
      { key: 'collapsible', label: 'Collapsible', type: 'toggle', defaultValue: false },
      { key: 'filtersCount', label: 'Max visible filters', type: 'number', defaultValue: 5, min: 1, max: 20 },
    ],
  },

  // ── Tabs ──
  tabs: {
    type: 'tabs',
    label: 'Tabs',
    category: 'tab',
    fields: [
      ...commonFields,
      { key: 'tabPosition', label: 'Position', type: 'select', defaultValue: 'top',
        options: [
          { label: 'Top', value: 'top' },
          { label: 'Bottom', value: 'bottom' },
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
        ],
      },
      { key: 'tabCount', label: 'Number of tabs', type: 'number', defaultValue: 2, min: 1, max: 10 },
    ],
  },

  // ── Layout Elements ──
  row: {
    type: 'row',
    label: 'Row',
    category: 'layout',
    fields: [
      ...commonFields,
      { key: 'background', label: 'Background color', type: 'color' },
      { key: 'padding', label: 'Padding (px)', type: 'number', defaultValue: 0, min: 0, max: 64 },
    ],
  },

  column: {
    type: 'column',
    label: 'Column',
    category: 'layout',
    fields: [
      ...commonFields,
      { key: 'span', label: 'Width (out of 12)', type: 'number', defaultValue: 6, min: 1, max: 12 },
    ],
  },

  'grid-container': {
    type: 'grid-container',
    label: 'Grid Container',
    category: 'layout',
    fields: [
      ...commonFields,
      { key: 'columns', label: 'Columns', type: 'number', defaultValue: 12, min: 1, max: 24 },
      { key: 'gutter', label: 'Gutter (px)', type: 'number', defaultValue: 16, min: 0, max: 64 },
      { key: 'responsive', label: 'Responsive', type: 'toggle', defaultValue: true },
    ],
  },

  header: {
    type: 'header',
    label: 'Header',
    category: 'layout',
    fields: [
      ...commonFields,
      { key: 'text', label: 'Header text', type: 'text', placeholder: 'Section title' },
      { key: 'level', label: 'Level', type: 'select', defaultValue: 'h2',
        options: [
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
        ],
      },
    ],
  },

  divider: {
    type: 'divider',
    label: 'Divider',
    category: 'layout',
    fields: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Optional label' },
      { key: 'visible', label: 'Visible', type: 'toggle', defaultValue: true },
      { key: 'dashed', label: 'Dashed', type: 'toggle', defaultValue: false },
    ],
  },

  markdown: {
    type: 'markdown',
    label: 'Markdown',
    category: 'layout',
    fields: [
      ...commonFields,
      { key: 'content', label: 'Markdown content', type: 'text', placeholder: '# Hello world' },
    ],
  },

  spacer: {
    type: 'spacer',
    label: 'Spacer',
    category: 'layout',
    fields: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Spacer' },
      { key: 'height', label: 'Height (px)', type: 'number', defaultValue: 32, min: 8, max: 200 },
      { key: 'visible', label: 'Visible', type: 'toggle', defaultValue: true },
    ],
  },

  // ── Library widgets ──
  'embedded-chart': {
    type: 'embedded-chart',
    label: 'Embedded Chart',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'chartId', label: 'Chart ID', type: 'number', placeholder: 'Superset chart ID' },
      { key: 'height', label: 'Height (px)', type: 'number', defaultValue: 400, min: 100, max: 1200 },
    ],
  },

  'data-quality-alerts': {
    type: 'data-quality-alerts',
    label: 'Data Quality Alerts',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'maxAlerts', label: 'Max alerts shown', type: 'number', defaultValue: 5, min: 1, max: 20 },
      { key: 'severity', label: 'Min severity', type: 'select', defaultValue: 'warning',
        options: [
          { label: 'Info', value: 'info' },
          { label: 'Warning', value: 'warning' },
          { label: 'Critical', value: 'critical' },
        ],
      },
    ],
  },

  announcements: {
    type: 'announcements',
    label: 'Announcements',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'maxItems', label: 'Max items', type: 'number', defaultValue: 5, min: 1, max: 20 },
      { key: 'showDate', label: 'Show date', type: 'toggle', defaultValue: true },
    ],
  },

  changelog: {
    type: 'changelog',
    label: 'Changelog',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'maxItems', label: 'Max entries', type: 'number', defaultValue: 10, min: 1, max: 50 },
    ],
  },

  'team-activity-feed': {
    type: 'team-activity-feed',
    label: 'Team Activity Feed',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'maxItems', label: 'Max items', type: 'number', defaultValue: 10, min: 1, max: 50 },
      { key: 'showAvatar', label: 'Show avatars', type: 'toggle', defaultValue: true },
      { key: 'showTimestamp', label: 'Show timestamps', type: 'toggle', defaultValue: true },
    ],
  },

  'quick-links': {
    type: 'quick-links',
    label: 'Quick Links',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'maxLinks', label: 'Max links', type: 'number', defaultValue: 8, min: 1, max: 20 },
    ],
  },

  'pinned-dashboards': {
    type: 'pinned-dashboards',
    label: 'Pinned Dashboards',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'maxItems', label: 'Max items', type: 'number', defaultValue: 6, min: 1, max: 20 },
      { key: 'showThumbnails', label: 'Show thumbnails', type: 'toggle', defaultValue: true },
    ],
  },

  'search-box': {
    type: 'search-box',
    label: 'Search Box',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Search...' },
      { key: 'searchScope', label: 'Search scope', type: 'multiselect', options: [
        { label: 'Dashboards', value: 'dashboards' },
        { label: 'Charts', value: 'charts' },
        { label: 'Datasets', value: 'datasets' },
        { label: 'SQL', value: 'sql' },
      ]},
    ],
  },

  'recent-databases': {
    type: 'recent-databases',
    label: 'Recent Databases',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'maxItems', label: 'Max items', type: 'number', defaultValue: 5, min: 1, max: 15 },
    ],
  },

  'tag-cloud': {
    type: 'tag-cloud',
    label: 'Tag Cloud',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'maxTags', label: 'Max tags', type: 'number', defaultValue: 20, min: 5, max: 100 },
    ],
  },

  'my-reports-schedule': {
    type: 'my-reports-schedule',
    label: 'My Reports Schedule',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'maxItems', label: 'Max items', type: 'number', defaultValue: 5, min: 1, max: 20 },
      { key: 'showNextRun', label: 'Show next run time', type: 'toggle', defaultValue: true },
    ],
  },

  certifications: {
    type: 'certifications',
    label: 'Certifications',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'showExpiry', label: 'Show expiry date', type: 'toggle', defaultValue: true },
    ],
  },

  'ai-suggestions': {
    type: 'ai-suggestions',
    label: 'AI Suggestions',
    category: 'widget',
    fields: [
      ...commonFields,
      { key: 'maxSuggestions', label: 'Max suggestions', type: 'number', defaultValue: 3, min: 1, max: 10 },
      { key: 'autoRefresh', label: 'Auto-refresh', type: 'toggle', defaultValue: false },
    ],
  },

  // ── Fallback ──
  default: {
    type: 'default',
    label: 'Component',
    category: 'widget',
    fields: commonFields,
  },
};

// ── Category display labels ──────────────────────────────────────────────────

const categoryLabels: Record<BlockCategory, string> = {
  chart: 'chart',
  filter: 'filter',
  tab: 'tab',
  layout: 'layout element',
  widget: 'widget',
};

export function getCategoryLabel(category: BlockCategory): string {
  return categoryLabels[category];
}

// ── Resolve config from a node key ────────────────────────────────────────────

export function resolveSettings(key: string): BlockSettingsConfig {
  const segments = key.split('-');

  // Try progressively longer suffix combinations (most specific first)
  for (let start = segments.length - 1; start >= 0; start--) {
    for (let end = start + 1; end <= segments.length; end++) {
      const candidate = segments.slice(start, end).join('-').toLowerCase();
      if (settingsMap[candidate]) return settingsMap[candidate];
      // Try de-pluralized form (e.g. "filters" → "filter")
      if (candidate.endsWith('s') && settingsMap[candidate.slice(0, -1)]) {
        return settingsMap[candidate.slice(0, -1)];
      }
    }
  }
  return settingsMap.default;
}
