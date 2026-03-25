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

  const now = new Date().toISOString();
  const uid = () => `seed-${Math.random().toString(36).slice(2, 8)}`;

  /* ── Helpers ─────────────────────────────────────────────────────────────── */

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

  const makeXYItem = (
    key: string, title: string,
    pos: { x: number; y: number; w: number; h: number },
    config: Record<string, unknown> = {},
  ): CanvasItem => ({
    id: uid(), key, title, ...pos, config,
  });


  const makeFilter = (
    filterType: string, name: string, dataset: string, column: string,
    extra: Record<string, unknown> = {},
  ) => ({
    id: uid(),
    filterType, name, dataset, column,
    preFilterValues: false, sortFilterValues: false,
    description: '', matchType: 'in',
    hasDefaultValue: false, defaultValue: '',
    isRequired: false, selectFirstByDefault: false,
    allowNewValues: false, multiSelect: true,
    dynamicSearch: false, inverseSelection: false,
    scope: 'global' as const,
    ...extra,
  });

  /* ── Container with filter toolbar (reusable across seeds) ───────────── */

  const makeFilterSidebar = (
    pos: { x: number; y: number; w: number; h: number },
    filters: ReturnType<typeof makeFilter>[],
  ): CanvasItem => {
    const labelChild: CanvasItem = {
      id: uid(), key: 'layout-content-label', title: 'Filter Toolbar',
      x: 0, y: 0, w: pos.w - 32, h: 28,
      config: { text: 'Filter Toolbar', bold: true, fontSize: 14 },
    };

    const filterChildren: CanvasItem[] = filters.map((f, i) => ({
      id: uid(),
      key: 'filters-native-' + f.filterType,
      title: f.name,
      x: 0, y: 38 + i * 80, w: pos.w - 32, h: 70,
      config: {
        filterType: f.filterType,
        title: f.name,
        dataset: f.dataset,
        column: f.column,
        multiSelect: f.multiSelect,
        searchEnabled: f.dynamicSearch,
        defaultValue: f.defaultValue,
        scope: f.scope,
      },
    }));

    return {
      id: uid(),
      key: 'layout-structure-container',
      title: 'Filter Toolbar',
      ...pos,
      config: {
        layoutMode: 'rows',
        padding: 12,
        borderEnabled: true,
        borderColor: '#222222',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 6,
      },
      children: [labelChild, ...filterChildren],
    };
  };

  /* ── Seeds ───────────────────────────────────────────────────────────────── */

  const seeds: Template[] = [
    // ── 1. Executive Overview (XY with filter sidebar) ─────────────────────
    {
      id: 'seed-exec-overview',
      name: 'Executive Overview',
      savedAt: now,
      layoutMode: 'xy',
      gridCols: 4,
      properties: { name: 'Executive Overview', owners: ['Admin'], colorScheme: 'supersetColors' } as Partial<TemplateProperties>,
      items: [
        // Left: Filter sidebar
        makeFilterSidebar(
          { x: 10, y: 10, w: 240, h: 500 },
          [
            makeFilter('time', 'Time Range', 'revenue', 'date'),
            makeFilter('value', 'Region', 'revenue', 'country', { multiSelect: true }),
            makeFilter('value', 'Product Line', 'revenue', 'product_line'),
            makeFilter('timegrain', 'Time Grain', 'revenue', 'date'),
          ],
        ),
        // Top KPIs
        makeXYItem('charts-category-bignum-total', 'Total Revenue', { x: 270, y: 10, w: 200, h: 110 }, { metric: 'sum', dataset: 'revenue', subheader: 'All time' }),
        makeXYItem('charts-category-bignum-total', 'Active Users', { x: 480, y: 10, w: 200, h: 110 }, { metric: 'count', dataset: 'users', subheader: 'Last 30 days' }),
        makeXYItem('charts-category-bignum-total', 'Avg Session', { x: 690, y: 10, w: 200, h: 110 }, { metric: 'avg', dataset: 'events', subheader: 'Minutes' }),
        makeXYItem('charts-category-bignum-total', 'Conversion Rate', { x: 900, y: 10, w: 200, h: 110 }, { metric: 'avg', dataset: 'sales', subheader: 'This quarter' }),
        // Charts
        makeXYItem('charts-category-line-echarts', 'Revenue Trend', { x: 270, y: 130, w: 560, h: 240 }, { dataset: 'revenue', timeGrain: 'P1M', showArea: true, smooth: true }),
        makeXYItem('charts-category-pie-echarts', 'Revenue by Region', { x: 840, y: 130, w: 260, h: 240 }, { dataset: 'revenue', groupby: ['region'], metric: 'sum' }),
        makeXYItem('charts-category-table-simple', 'Top Products', { x: 270, y: 380, w: 420, h: 230 }, { dataset: 'sales', pageSize: 10 }),
        makeXYItem('charts-category-bar-echarts', 'Monthly Comparison', { x: 700, y: 380, w: 400, h: 230 }, { dataset: 'revenue', orientation: 'vertical' }),
      ],
    },

    // ── 2. Sales Analytics (XY with filter sidebar) ────────────────────────
    {
      id: 'seed-sales-analytics',
      name: 'Sales Analytics',
      savedAt: now,
      layoutMode: 'xy',
      gridCols: 3,
      properties: { name: 'Sales Analytics', owners: ['Sales Team'] } as Partial<TemplateProperties>,
      items: [
        makeFilterSidebar(
          { x: 10, y: 10, w: 220, h: 460 },
          [
            makeFilter('value', 'Category', 'sales', 'category'),
            makeFilter('value', 'Region', 'sales', 'region'),
            makeFilter('value', 'Status', 'sales', 'status'),
            makeFilter('range', 'Amount', 'revenue', 'amount'),
          ],
        ),
        makeXYItem('charts-category-bar-echarts', 'Sales by Category', { x: 250, y: 10, w: 380, h: 220 }, { dataset: 'sales', orientation: 'horizontal' }),
        makeXYItem('charts-category-line-echarts', 'Revenue Over Time', { x: 640, y: 10, w: 460, h: 220 }, { dataset: 'revenue', timeGrain: 'P1W', smooth: true, showArea: true }),
        makeXYItem('charts-category-map-world', 'Sales by Region', { x: 250, y: 240, w: 450, h: 230 }, { dataset: 'sales', mapType: 'world' }),
        makeXYItem('charts-category-pie-echarts', 'Top Products', { x: 710, y: 240, w: 390, h: 230 }, { dataset: 'sales', groupby: ['product'], metric: 'sum' }),
        makeXYItem('charts-category-table-simple', 'Sales Detail', { x: 250, y: 480, w: 850, h: 220 }, { dataset: 'sales', pageSize: 15, showSearch: true }),
      ],
    },

    // ── 3. User Engagement (grid, no sidebar) ──────────────────────────────
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

    // ── 4. Operational Monitoring (XY with filter sidebar) ─────────────────
    {
      id: 'seed-ops-monitor',
      name: 'Operational Monitoring',
      savedAt: now,
      layoutMode: 'xy',
      gridCols: 3,
      properties: { name: 'Operational Monitoring', owners: ['SRE Team'] } as Partial<TemplateProperties>,
      items: [
        makeFilterSidebar(
          { x: 10, y: 10, w: 220, h: 540 },
          [
            makeFilter('time', 'Time Window', 'events', 'date'),
            makeFilter('value', 'Service', 'events', 'source'),
            makeFilter('value', 'Event Type', 'events', 'event_type'),
            makeFilter('timegrain', 'Granularity', 'events', 'date'),
            makeFilter('value', 'Severity', 'events', 'source', { multiSelect: false }),
          ],
        ),
        makeXYItem('charts-category-line-echarts', 'Request Latency (p50/p95/p99)', { x: 250, y: 10, w: 520, h: 250 }, { dataset: 'events', timeGrain: 'PT1H', smooth: true }),
        makeXYItem('charts-category-area-echarts', 'Error Rate by Service', { x: 780, y: 10, w: 320, h: 250 }, { dataset: 'events', stacked: true, timeGrain: 'PT1H' }),
        makeXYItem('charts-category-bar-echarts', 'Throughput by Endpoint', { x: 250, y: 270, w: 420, h: 240 }, { dataset: 'events', orientation: 'horizontal' }),
        makeXYItem('charts-category-pie-echarts', 'Errors by Type', { x: 680, y: 270, w: 420, h: 240 }, { dataset: 'events', groupby: ['event_type'], metric: 'count' }),
        makeXYItem('charts-category-table-simple', 'Recent Incidents', { x: 250, y: 520, w: 850, h: 220 }, { dataset: 'events', pageSize: 10, showSearch: true }),
      ],
    },

    // ── 5. Data Quality Dashboard (grid, no sidebar) ──────────────────────
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

    // ── 6. Revenue Deep Dive (XY with filter sidebar + post-it) ───────────
    {
      id: 'seed-revenue-deep-dive',
      name: 'Revenue Deep Dive',
      savedAt: now,
      layoutMode: 'xy',
      gridCols: 4,
      properties: { name: 'Revenue Deep Dive', owners: ['Finance Team'], colorScheme: 'supersetColors' } as Partial<TemplateProperties>,
      items: [
        makeFilterSidebar(
          { x: 10, y: 10, w: 230, h: 520 },
          [
            makeFilter('time', 'Period', 'revenue', 'date'),
            makeFilter('value', 'Country', 'revenue', 'country'),
            makeFilter('value', 'Product Line', 'revenue', 'product_line'),
            makeFilter('range', 'Revenue Range', 'revenue', 'amount'),
            makeFilter('timegrain', 'Aggregation', 'revenue', 'date'),
          ],
        ),
        makeXYItem('layout-content-postit', 'Notes', { x: 10, y: 540, w: 230, h: 120 }, { content: 'Q4 revenue spike driven by Enterprise tier renewals.\nFollow up with APAC team on expansion.', bgColor: '#fff9c4', textColor: '#5d4037' }),
        // KPIs
        makeXYItem('charts-category-bignum-total', 'ARR', { x: 260, y: 10, w: 200, h: 100 }, { metric: 'sum', dataset: 'revenue', subheader: 'Annual Recurring' }),
        makeXYItem('charts-category-bignum-total', 'MRR', { x: 470, y: 10, w: 200, h: 100 }, { metric: 'avg', dataset: 'revenue', subheader: 'Monthly Recurring' }),
        makeXYItem('charts-category-bignum-trendline', 'Growth', { x: 680, y: 10, w: 200, h: 100 }, { metric: 'avg', dataset: 'revenue', subheader: 'MoM %', showTrendline: true }),
        makeXYItem('charts-category-bignum-total', 'Churn', { x: 890, y: 10, w: 200, h: 100 }, { metric: 'avg', dataset: 'users', subheader: 'Monthly rate' }),
        // Charts
        makeXYItem('charts-category-area-echarts', 'Revenue Over Time', { x: 260, y: 120, w: 560, h: 250 }, { dataset: 'revenue', timeGrain: 'P1M', stacked: true, smooth: true }),
        makeXYItem('charts-category-bar-echarts', 'Revenue by Country', { x: 830, y: 120, w: 260, h: 250 }, { dataset: 'revenue', orientation: 'horizontal' }),
        makeXYItem('charts-category-pie-echarts', 'By Product Line', { x: 260, y: 380, w: 280, h: 240 }, { dataset: 'revenue', groupby: ['product_line'], metric: 'sum' }),
        makeXYItem('charts-category-scatter-echarts', 'Revenue vs Users', { x: 550, y: 380, w: 280, h: 240 }, { dataset: 'revenue', xAxis: 'revenue', yAxis: 'sessions' }),
        makeXYItem('charts-category-table-simple', 'Revenue Breakdown', { x: 840, y: 380, w: 260, h: 240 }, { dataset: 'revenue', pageSize: 8, showSearch: true }),
      ],
    },
  ];

  persistTemplates(seeds);
  localStorage.setItem(SEED_KEY, '1');
}
