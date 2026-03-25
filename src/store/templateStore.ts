export type LayoutMode = 'grid' | 'rows' | 'xy' | 'mosaic';

export interface CanvasItem {
  id: string;
  key: string;
  title: string;
  // XY mode
  x: number;
  y: number;
  w: number;
  h: number;
  // Grid mode: column index + row index + column span
  col?: number;
  row?: number;
  colSpan?: number;
  rowSpan?: number;
  config: Record<string, unknown>;
  // Container elements (Row, Column, Grid Container, etc.) can hold children
  children?: CanvasItem[];
}

export interface TemplateProperties {
  name: string;
  urlSlug: string;
  owners: string[];
  colorScheme: string;
  refreshFrequency: number;
  certifiedBy: string;
  certificationDetails: string;
  jsonMetadata: string;
}

export interface Template {
  id: string;
  name: string;
  savedAt: string;
  items: CanvasItem[];
  layoutMode?: LayoutMode;
  gridCols?: number;
  properties?: Partial<TemplateProperties>;
}

const LIST_KEY    = 'superset_pb_templates';
const DEFAULT_KEY = 'superset_pb_default';

// ── List helpers ──────────────────────────────────────────────────────────────

export function loadTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    return raw ? (JSON.parse(raw) as Template[]) : [];
  } catch {
    return [];
  }
}

function persistTemplates(list: Template[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list));
}

export function saveTemplate(
  items: CanvasItem[],
  name: string,
  existingId?: string,
  properties?: Partial<TemplateProperties>,
  layoutMode?: LayoutMode,
  gridCols?: number,
): Template {
  const list = loadTemplates();
  const existing = existingId ? list.find((t) => t.id === existingId) : undefined;
  const tpl: Template = {
    id: existingId ?? `tpl-${Date.now()}`,
    name,
    savedAt: new Date().toISOString(),
    items,
    properties,
    layoutMode: layoutMode ?? existing?.layoutMode,
    gridCols: gridCols ?? existing?.gridCols,
  };
  const idx = list.findIndex((t) => t.id === tpl.id);
  if (idx >= 0) list[idx] = tpl;
  else list.unshift(tpl);
  persistTemplates(list);
  return tpl;
}

export function deleteTemplate(id: string): void {
  persistTemplates(loadTemplates().filter((t) => t.id !== id));
}

// ── Default helpers ───────────────────────────────────────────────────────────

export function saveAsDefault(items: CanvasItem[]): void {
  localStorage.setItem(DEFAULT_KEY, JSON.stringify(items));
}

export function loadDefault(): CanvasItem[] {
  try {
    const raw = localStorage.getItem(DEFAULT_KEY);
    return raw ? (JSON.parse(raw) as CanvasItem[]) : [];
  } catch {
    return [];
  }
}

// ── Seed default dashboards ──────────────────────────────────────────────────

const SEED_KEY = 'superset_pb_seeded';

export function seedDefaultTemplates(): void {
  // Only seed once — skip if already seeded or if user has saved templates
  if (localStorage.getItem(SEED_KEY)) return;
  const existing = loadTemplates();
  if (existing.length > 0) {
    localStorage.setItem(SEED_KEY, '1');
    return;
  }

  // Lazy-import to avoid circular deps — the actual data is inlined below
  const now = new Date().toISOString();
  const uid = () => `seed-${Math.random().toString(36).slice(2, 8)}`;

  const makeItem = (
    key: string, title: string,
    grid: { col: number; row: number; colSpan?: number; rowSpan?: number },
    config: Record<string, unknown> = {},
  ): CanvasItem => ({
    id: uid(), key, title,
    x: 0, y: 0, w: 220, h: 180,
    col: grid.col, row: grid.row,
    colSpan: grid.colSpan ?? 1, rowSpan: grid.rowSpan ?? 1,
    config,
  });

  const makeRowItem = (
    key: string, title: string, row: number,
    config: Record<string, unknown> = {},
  ): CanvasItem => ({
    id: uid(), key, title,
    x: 0, y: 0, w: 900, h: 200,
    row, config,
  });

  const seeds: Template[] = [
    {
      id: 'seed-exec-overview',
      name: 'Executive Overview',
      savedAt: now,
      layoutMode: 'grid',
      gridCols: 4,
      properties: { name: 'Executive Overview', owners: ['Admin'], colorScheme: 'supersetColors' } as Partial<TemplateProperties>,
      items: [
        makeItem('charts-category-bignum-total', 'Total Revenue', { col: 0, row: 0 }, { metric: 'sum', dataset: 'revenue', subheader: 'All time' }),
        makeItem('charts-category-bignum-total', 'Active Users', { col: 1, row: 0 }, { metric: 'count', dataset: 'users', subheader: 'Last 30 days' }),
        makeItem('charts-category-bignum-total', 'Avg Session', { col: 2, row: 0 }, { metric: 'avg', dataset: 'events', subheader: 'Minutes' }),
        makeItem('charts-category-bignum-total', 'Conversion Rate', { col: 3, row: 0 }, { metric: 'avg', dataset: 'sales', subheader: 'This quarter' }),
        makeItem('charts-category-line-echarts', 'Revenue Trend', { col: 0, row: 1, colSpan: 3 }, { dataset: 'revenue', timeGrain: 'P1M', showArea: true, smooth: true }),
        makeItem('charts-category-pie-echarts', 'Revenue by Region', { col: 3, row: 1 }, { dataset: 'revenue', groupby: ['region'], metric: 'sum' }),
        makeItem('charts-category-table-simple', 'Top Products', { col: 0, row: 2, colSpan: 2 }, { dataset: 'sales', pageSize: 10 }),
        makeItem('charts-category-bar-echarts', 'Monthly Comparison', { col: 2, row: 2, colSpan: 2 }, { dataset: 'revenue', orientation: 'vertical' }),
      ],
    },
    {
      id: 'seed-sales-analytics',
      name: 'Sales Analytics',
      savedAt: now,
      layoutMode: 'grid',
      gridCols: 3,
      properties: { name: 'Sales Analytics', owners: ['Sales Team'] } as Partial<TemplateProperties>,
      items: [
        makeItem('charts-category-bar-echarts', 'Sales by Category', { col: 0, row: 0 }, { dataset: 'sales', orientation: 'horizontal' }),
        makeItem('charts-category-line-echarts', 'Revenue Over Time', { col: 1, row: 0, colSpan: 2 }, { dataset: 'revenue', timeGrain: 'P1W', smooth: true, showArea: true }),
        makeItem('charts-category-map-world', 'Sales by Region', { col: 0, row: 1, colSpan: 2 }, { dataset: 'sales', mapType: 'world' }),
        makeItem('charts-category-pie-echarts', 'Top Products', { col: 2, row: 1 }, { dataset: 'sales', groupby: ['product'], metric: 'sum' }),
        makeItem('charts-category-table-simple', 'Sales Detail', { col: 0, row: 2, colSpan: 3 }, { dataset: 'sales', pageSize: 15, showSearch: true }),
      ],
    },
    {
      id: 'seed-user-engagement',
      name: 'User Engagement',
      savedAt: now,
      layoutMode: 'grid',
      gridCols: 3,
      properties: { name: 'User Engagement', owners: ['Product Team'] } as Partial<TemplateProperties>,
      items: [
        makeItem('charts-category-bignum-trendline', 'DAU', { col: 0, row: 0 }, { metric: 'count', dataset: 'users', showTrendline: true, subheader: 'Daily Active Users' }),
        makeItem('charts-category-bignum-trendline', 'WAU', { col: 1, row: 0 }, { metric: 'count', dataset: 'users', showTrendline: true, subheader: 'Weekly Active Users' }),
        makeItem('charts-category-bignum-trendline', 'MAU', { col: 2, row: 0 }, { metric: 'count', dataset: 'users', showTrendline: true, subheader: 'Monthly Active Users' }),
        makeItem('charts-category-line-echarts', 'Session Duration', { col: 0, row: 1, colSpan: 2 }, { dataset: 'events', timeGrain: 'P1D', smooth: true }),
        makeItem('charts-category-bar-echarts', 'Actions per Session', { col: 2, row: 1 }, { dataset: 'events', orientation: 'vertical' }),
        makeItem('charts-category-scatter-echarts', 'Engagement vs Retention', { col: 0, row: 2, colSpan: 3 }, { dataset: 'users', xAxis: 'sessions', yAxis: 'conversion' }),
      ],
    },
    {
      id: 'seed-ops-monitor',
      name: 'Operational Monitoring',
      savedAt: now,
      layoutMode: 'rows',
      gridCols: 3,
      properties: { name: 'Operational Monitoring', owners: ['SRE Team'] } as Partial<TemplateProperties>,
      items: [
        makeRowItem('charts-category-line-echarts', 'Request Latency (p50/p95/p99)', 0, { dataset: 'events', timeGrain: 'PT1H', smooth: true }),
        makeRowItem('charts-category-area-echarts', 'Error Rate by Service', 1, { dataset: 'events', stacked: true, timeGrain: 'PT1H' }),
        makeRowItem('charts-category-bar-echarts', 'Throughput by Endpoint', 2, { dataset: 'events', orientation: 'horizontal' }),
        makeRowItem('charts-category-table-simple', 'Recent Incidents', 3, { dataset: 'events', pageSize: 10, showSearch: true }),
      ],
    },
    {
      id: 'seed-data-quality',
      name: 'Data Quality Dashboard',
      savedAt: now,
      layoutMode: 'grid',
      gridCols: 3,
      properties: { name: 'Data Quality Dashboard', owners: ['Data Team'] } as Partial<TemplateProperties>,
      items: [
        makeItem('charts-category-bignum-total', 'Quality Score', { col: 0, row: 0 }, { metric: 'avg', dataset: 'events', subheader: 'Overall %' }),
        makeItem('charts-category-bignum-total', 'Tables Monitored', { col: 1, row: 0 }, { metric: 'count', dataset: 'events', subheader: 'Active checks' }),
        makeItem('charts-category-bignum-total', 'Open Issues', { col: 2, row: 0 }, { metric: 'count', dataset: 'events', subheader: 'Needs attention' }),
        makeItem('charts-category-line-echarts', 'Quality Score Trend', { col: 0, row: 1, colSpan: 2 }, { dataset: 'events', timeGrain: 'P1D', smooth: true }),
        makeItem('charts-category-bar-echarts', 'Issues by Type', { col: 2, row: 1 }, { dataset: 'events', orientation: 'horizontal' }),
        makeItem('charts-category-table-simple', 'Alert History', { col: 0, row: 2, colSpan: 3 }, { dataset: 'events', pageSize: 10, showSearch: true }),
      ],
    },
  ];

  persistTemplates(seeds);
  localStorage.setItem(SEED_KEY, '1');
}
