import type { CanvasItem, LayoutMode } from '../store/templateStore';

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  category: StarterCategory;
  layoutMode: LayoutMode;
  gridCols: number;
  items: CanvasItem[];
}

export type StarterCategory =
  | 'executive'
  | 'sales'
  | 'product'
  | 'operations'
  | 'data-quality';

export const STARTER_CATEGORY_LABELS: Record<StarterCategory, string> = {
  executive: 'Executive & Overview',
  sales: 'Sales & Revenue',
  product: 'Product & Engagement',
  operations: 'Operations & Monitoring',
  'data-quality': 'Data Quality & Governance',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

let seq = 0;
const uid = () => `starter-${++seq}-${Math.random().toString(36).slice(2, 6)}`;

function item(
  key: string,
  title: string,
  grid: { col: number; row: number; colSpan?: number; rowSpan?: number },
  config: Record<string, unknown> = {},
): CanvasItem {
  return {
    id: uid(),
    key,
    title,
    x: 0, y: 0, w: 220, h: 180,
    col: grid.col,
    row: grid.row,
    colSpan: grid.colSpan ?? 1,
    rowSpan: grid.rowSpan ?? 1,
    config,
  };
}

function rowItem(
  key: string,
  title: string,
  row: number,
  config: Record<string, unknown> = {},
): CanvasItem {
  return {
    id: uid(),
    key,
    title,
    x: 0, y: 0, w: 900, h: 200,
    row,
    config,
  };
}

// ── Templates ────────────────────────────────────────────────────────────────

export const STARTER_TEMPLATES: StarterTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTIVE & OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'starter-exec-overview',
    name: 'Executive Overview',
    description: 'KPI cards, trend line, pie breakdown, and summary table for C-suite reporting.',
    category: 'executive',
    layoutMode: 'grid',
    gridCols: 4,
    items: [
      item('charts-category-bignum-total', 'Total Revenue', { col: 0, row: 0 }, { metric: 'sum', dataset: 'revenue', subheader: 'All time', colorScheme: 'supersetColors' }),
      item('charts-category-bignum-total', 'Active Users', { col: 1, row: 0 }, { metric: 'count', dataset: 'users', subheader: 'Last 30 days' }),
      item('charts-category-bignum-total', 'Avg Session', { col: 2, row: 0 }, { metric: 'avg', dataset: 'events', subheader: 'Minutes' }),
      item('charts-category-bignum-total', 'Conversion Rate', { col: 3, row: 0 }, { metric: 'avg', dataset: 'sales', subheader: 'This quarter' }),
      item('charts-category-line-echarts', 'Revenue Trend', { col: 0, row: 1, colSpan: 3 }, { dataset: 'revenue', timeGrain: 'P1M', showArea: true, smooth: true }),
      item('charts-category-pie-echarts', 'Revenue by Region', { col: 3, row: 1 }, { dataset: 'revenue', groupby: ['region'], metric: 'sum' }),
      item('charts-category-table-simple', 'Top 10 Products', { col: 0, row: 2, colSpan: 2 }, { dataset: 'sales', pageSize: 10 }),
      item('charts-category-bar-echarts', 'Monthly Comparison', { col: 2, row: 2, colSpan: 2 }, { dataset: 'revenue', orientation: 'vertical', stacked: false }),
    ],
  },

  {
    id: 'starter-kpi-wall',
    name: 'KPI Wall',
    description: 'Big numbers with trendlines for at-a-glance monitoring of key metrics.',
    category: 'executive',
    layoutMode: 'grid',
    gridCols: 3,
    items: [
      item('charts-category-bignum-trendline', 'Revenue', { col: 0, row: 0 }, { metric: 'sum', dataset: 'revenue', showTrendline: true }),
      item('charts-category-bignum-trendline', 'Orders', { col: 1, row: 0 }, { metric: 'count', dataset: 'sales', showTrendline: true }),
      item('charts-category-bignum-trendline', 'Avg Order Value', { col: 2, row: 0 }, { metric: 'avg', dataset: 'sales', showTrendline: true }),
      item('charts-category-bignum-trendline', 'New Users', { col: 0, row: 1 }, { metric: 'count', dataset: 'users', showTrendline: true }),
      item('charts-category-bignum-trendline', 'Active Sessions', { col: 1, row: 1 }, { metric: 'count', dataset: 'events', showTrendline: true }),
      item('charts-category-bignum-trendline', 'Churn Rate', { col: 2, row: 1 }, { metric: 'avg', dataset: 'users', showTrendline: true, subheader: 'Last 30d' }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SALES & REVENUE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'starter-sales-analytics',
    name: 'Sales Analytics',
    description: 'Pipeline funnel, revenue breakdown, and geographic sales distribution.',
    category: 'sales',
    layoutMode: 'grid',
    gridCols: 3,
    items: [
      item('filters-toolbox-filtertoolbox-global', 'Filters', { col: 0, row: 0, colSpan: 3 }, { orientation: 'horizontal', showPresets: true }),
      item('charts-category-bar-echarts', 'Sales by Category', { col: 0, row: 1 }, { dataset: 'sales', orientation: 'horizontal', stacked: false }),
      item('charts-category-line-echarts', 'Revenue Over Time', { col: 1, row: 1, colSpan: 2 }, { dataset: 'revenue', timeGrain: 'P1W', smooth: true, showArea: true }),
      item('charts-category-map-world', 'Sales by Region', { col: 0, row: 2, colSpan: 2 }, { dataset: 'sales', mapType: 'world' }),
      item('charts-category-pie-echarts', 'Top Products', { col: 2, row: 2 }, { dataset: 'sales', groupby: ['product'], metric: 'sum' }),
      item('charts-category-table-simple', 'Sales Detail', { col: 0, row: 3, colSpan: 3 }, { dataset: 'sales', pageSize: 15, showSearch: true }),
    ],
  },

  {
    id: 'starter-revenue-breakdown',
    name: 'Revenue Breakdown',
    description: 'Multi-dimensional revenue analysis with time trends and segment comparisons.',
    category: 'sales',
    layoutMode: 'grid',
    gridCols: 2,
    items: [
      item('charts-category-bignum-total', 'Total Revenue', { col: 0, row: 0 }, { metric: 'sum', dataset: 'revenue', subheader: 'Year to date' }),
      item('charts-category-bignum-trendline', 'MoM Growth', { col: 1, row: 0 }, { metric: 'avg', dataset: 'revenue', showTrendline: true, subheader: 'Monthly' }),
      item('charts-category-area-echarts', 'Revenue by Channel', { col: 0, row: 1, colSpan: 2 }, { dataset: 'revenue', stacked: true, smooth: true }),
      item('charts-category-bar-echarts', 'Segment Comparison', { col: 0, row: 2 }, { dataset: 'revenue', orientation: 'vertical', stacked: true }),
      item('charts-category-pie-echarts', 'Revenue Split', { col: 1, row: 2 }, { dataset: 'revenue', groupby: ['category'], donut: true }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCT & ENGAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'starter-user-engagement',
    name: 'User Engagement',
    description: 'Track user activity, session patterns, and engagement funnels.',
    category: 'product',
    layoutMode: 'grid',
    gridCols: 3,
    items: [
      item('charts-category-bignum-trendline', 'DAU', { col: 0, row: 0 }, { metric: 'count', dataset: 'users', showTrendline: true, subheader: 'Daily Active Users' }),
      item('charts-category-bignum-trendline', 'WAU', { col: 1, row: 0 }, { metric: 'count', dataset: 'users', showTrendline: true, subheader: 'Weekly Active Users' }),
      item('charts-category-bignum-trendline', 'MAU', { col: 2, row: 0 }, { metric: 'count', dataset: 'users', showTrendline: true, subheader: 'Monthly Active Users' }),
      item('charts-category-line-echarts', 'Session Duration Trend', { col: 0, row: 1, colSpan: 2 }, { dataset: 'events', timeGrain: 'P1D', smooth: true }),
      item('charts-category-bar-echarts', 'Actions per Session', { col: 2, row: 1 }, { dataset: 'events', orientation: 'vertical' }),
      item('charts-category-scatter-echarts', 'Engagement vs Retention', { col: 0, row: 2, colSpan: 2 }, { dataset: 'users', xAxis: 'sessions', yAxis: 'conversion', bubbleSize: 'count' }),
      item('charts-category-table-simple', 'Top Active Users', { col: 2, row: 2 }, { dataset: 'users', pageSize: 10 }),
    ],
  },

  {
    id: 'starter-product-analytics',
    name: 'Product Analytics',
    description: 'Feature usage, adoption curves, and product health metrics.',
    category: 'product',
    layoutMode: 'grid',
    gridCols: 3,
    items: [
      item('layout-content-header', 'Product Health', { col: 0, row: 0, colSpan: 3 }, { text: 'Product Health Dashboard', level: 'h2' }),
      item('charts-category-bignum-total', 'Feature Adoption', { col: 0, row: 1 }, { metric: 'count', dataset: 'events', subheader: 'Unique users' }),
      item('charts-category-bignum-total', 'Retention Rate', { col: 1, row: 1 }, { metric: 'avg', dataset: 'users', subheader: '7-day' }),
      item('charts-category-bignum-total', 'NPS Score', { col: 2, row: 1 }, { metric: 'avg', dataset: 'users', subheader: 'Last survey' }),
      item('charts-category-area-echarts', 'Weekly Active Features', { col: 0, row: 2, colSpan: 2 }, { dataset: 'events', stacked: true, smooth: true, timeGrain: 'P1W' }),
      item('charts-category-bar-echarts', 'Top Features', { col: 2, row: 2 }, { dataset: 'events', orientation: 'horizontal' }),
      item('charts-category-line-echarts', 'Error Rate', { col: 0, row: 3, colSpan: 3 }, { dataset: 'events', timeGrain: 'P1D', showArea: false }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATIONS & MONITORING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'starter-ops-monitor',
    name: 'Operational Monitoring',
    description: 'System health, latency metrics, error rates, and infrastructure overview.',
    category: 'operations',
    layoutMode: 'rows',
    gridCols: 3,
    items: [
      rowItem('filters-toolbox-filtertoolbox-global', 'Time & Environment Filters', 0, { orientation: 'horizontal', showPresets: true }),
      rowItem('charts-category-line-echarts', 'Request Latency (p50/p95/p99)', 1, { dataset: 'events', timeGrain: 'PT1H', smooth: true }),
      rowItem('charts-category-area-echarts', 'Error Rate by Service', 2, { dataset: 'events', stacked: true, timeGrain: 'PT1H' }),
      rowItem('charts-category-bar-echarts', 'Throughput by Endpoint', 3, { dataset: 'events', orientation: 'horizontal' }),
      rowItem('lib-data-analytics-analytics-data-quality-alerts', 'Active Alerts', 4, { maxAlerts: 10, severity: 'warning' }),
    ],
  },

  {
    id: 'starter-infra-dashboard',
    name: 'Infrastructure Overview',
    description: 'CPU, memory, disk utilization with alerting and capacity planning.',
    category: 'operations',
    layoutMode: 'grid',
    gridCols: 4,
    items: [
      item('charts-category-bignum-trendline', 'CPU Usage', { col: 0, row: 0 }, { metric: 'avg', dataset: 'events', showTrendline: true, subheader: 'Avg %' }),
      item('charts-category-bignum-trendline', 'Memory', { col: 1, row: 0 }, { metric: 'avg', dataset: 'events', showTrendline: true, subheader: 'Avg %' }),
      item('charts-category-bignum-trendline', 'Disk I/O', { col: 2, row: 0 }, { metric: 'avg', dataset: 'events', showTrendline: true, subheader: 'MB/s' }),
      item('charts-category-bignum-trendline', 'Network', { col: 3, row: 0 }, { metric: 'avg', dataset: 'events', showTrendline: true, subheader: 'Gbps' }),
      item('charts-category-line-echarts', 'Resource Utilization Over Time', { col: 0, row: 1, colSpan: 3 }, { dataset: 'events', timeGrain: 'PT1H', smooth: true }),
      item('charts-category-pie-echarts', 'By Service', { col: 3, row: 1 }, { dataset: 'events', groupby: ['category'] }),
      item('charts-category-table-simple', 'Top Consumers', { col: 0, row: 2, colSpan: 2 }, { dataset: 'events', pageSize: 10 }),
      item('lib-data-analytics-analytics-data-quality-alerts', 'Capacity Alerts', { col: 2, row: 2, colSpan: 2 }, { maxAlerts: 5, severity: 'warning' }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA QUALITY & GOVERNANCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'starter-data-quality',
    name: 'Data Quality Dashboard',
    description: 'Freshness checks, schema drift alerts, and data quality scores.',
    category: 'data-quality',
    layoutMode: 'grid',
    gridCols: 3,
    items: [
      item('charts-category-bignum-total', 'Quality Score', { col: 0, row: 0 }, { metric: 'avg', dataset: 'events', subheader: 'Overall %' }),
      item('charts-category-bignum-total', 'Tables Monitored', { col: 1, row: 0 }, { metric: 'count', dataset: 'events', subheader: 'Active checks' }),
      item('charts-category-bignum-total', 'Open Issues', { col: 2, row: 0 }, { metric: 'count', dataset: 'events', subheader: 'Needs attention' }),
      item('charts-category-line-echarts', 'Quality Score Trend', { col: 0, row: 1, colSpan: 2 }, { dataset: 'events', timeGrain: 'P1D', smooth: true }),
      item('charts-category-bar-echarts', 'Issues by Type', { col: 2, row: 1 }, { dataset: 'events', orientation: 'horizontal' }),
      item('lib-data-analytics-analytics-data-quality-alerts', 'Active Alerts', { col: 0, row: 2, colSpan: 2 }, { maxAlerts: 10, severity: 'info' }),
      item('lib-tools-ai-organization-certifications', 'Certified Datasets', { col: 2, row: 2 }, { showExpiry: true }),
    ],
  },

  {
    id: 'starter-data-catalog',
    name: 'Data Catalog Home',
    description: 'Search, browse, and discover datasets with recent activity and popular tags.',
    category: 'data-quality',
    layoutMode: 'grid',
    gridCols: 3,
    items: [
      item('lib-tools-ai-navigation-search-box', 'Search Datasets', { col: 0, row: 0, colSpan: 3 }, { placeholder: 'Search datasets, charts, dashboards...', searchScope: ['dashboards', 'charts', 'datasets'] }),
      item('lib-tools-ai-organization-tag-cloud', 'Popular Tags', { col: 0, row: 1 }, { maxTags: 30 }),
      item('lib-tools-ai-navigation-pinned-dashboards', 'Featured Dashboards', { col: 1, row: 1, colSpan: 2 }, { maxItems: 6, showThumbnails: true }),
      item('lib-tools-ai-navigation-recent-databases', 'Recent Databases', { col: 0, row: 2 }, { maxItems: 8 }),
      item('lib-content-communication-comms-team-activity-feed', 'Recent Activity', { col: 1, row: 2 }, { maxItems: 10, showAvatar: true, showTimestamp: true }),
      item('lib-content-communication-comms-announcements', 'Announcements', { col: 2, row: 2 }, { maxItems: 5, showDate: true }),
    ],
  },
];
