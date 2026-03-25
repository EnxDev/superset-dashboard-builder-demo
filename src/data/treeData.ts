export interface ComponentNode {
  key: string;
  title: string;
  children?: ComponentNode[];
}

// ── Library: Charts, Filters, Tabs, and Widgets ──────────────────────────────

export const libraryData: ComponentNode[] = [
  {
    key: 'charts',
    title: 'Charts',
    children: [
      {
        key: 'charts-category',
        title: 'Chart Types',
        children: [
          {
            key: 'charts-category-pie',
            title: 'Pie',
            children: [
              { key: 'charts-category-pie-echarts', title: 'ECharts' },
              { key: 'charts-category-pie-antv', title: 'AntV' },
              { key: 'charts-category-pie-observable', title: 'Observable' },
              { key: 'charts-category-pie-ascii', title: 'ASCII' },
            ],
          },
          {
            key: 'charts-category-bar',
            title: 'Bar',
            children: [
              { key: 'charts-category-bar-echarts', title: 'ECharts' },
              { key: 'charts-category-bar-antv', title: 'AntV' },
              { key: 'charts-category-bar-d3', title: 'D3' },
              { key: 'charts-category-bar-observable', title: 'Observable' },
            ],
          },
          {
            key: 'charts-category-line',
            title: 'Line',
            children: [
              { key: 'charts-category-line-echarts', title: 'ECharts' },
              { key: 'charts-category-line-antv', title: 'AntV' },
              { key: 'charts-category-line-d3', title: 'D3' },
            ],
          },
          {
            key: 'charts-category-scatter',
            title: 'Scatter',
            children: [
              { key: 'charts-category-scatter-echarts', title: 'ECharts' },
              { key: 'charts-category-scatter-antv', title: 'AntV' },
              { key: 'charts-category-scatter-d3', title: 'D3' },
            ],
          },
          {
            key: 'charts-category-area',
            title: 'Area',
            children: [
              { key: 'charts-category-area-echarts', title: 'ECharts' },
              { key: 'charts-category-area-d3', title: 'D3' },
              { key: 'charts-category-area-antv', title: 'AntV' },
            ],
          },
          {
            key: 'charts-category-table',
            title: 'Table',
            children: [
              { key: 'charts-category-table-simple', title: 'Simple' },
              { key: 'charts-category-table-pivot', title: 'Pivot Table' },
            ],
          },
          {
            key: 'charts-category-bignum',
            title: 'Big Number',
            children: [
              { key: 'charts-category-bignum-total', title: 'Big Number' },
              { key: 'charts-category-bignum-trendline', title: 'Big Number with Trendline' },
            ],
          },
          {
            key: 'charts-category-map',
            title: 'Map',
            children: [
              { key: 'charts-category-map-world', title: 'World Map' },
              { key: 'charts-category-map-deck-scatter', title: 'deck.gl Scatter' },
              { key: 'charts-category-map-deck-arc', title: 'deck.gl Arc' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'filters',
    title: 'Filters',
    children: [
      {
        key: 'filters-native',
        title: 'Native Filters',
        children: [
          { key: 'filters-native-value', title: 'Value Filter' },
          { key: 'filters-native-range', title: 'Range Filter' },
          { key: 'filters-native-time', title: 'Time Filter' },
          { key: 'filters-native-timegrain', title: 'Time Grain Filter' },
          { key: 'filters-native-timecolumn', title: 'Time Column Filter' },
        ],
      },
      {
        key: 'filters-toolbox',
        title: 'Filter Toolbox',
        children: [
          { key: 'filters-toolbox-filtertoolbox-global', title: 'Global Toolbox' },
          { key: 'filters-toolbox-filtertoolbox-scoped', title: 'Scoped Toolbox' },
        ],
      },
      {
        key: 'filters-bar',
        title: 'Filter Bar',
        children: [
          { key: 'filters-bar-filterbar-horizontal', title: 'Horizontal Bar' },
          { key: 'filters-bar-filterbar-vertical', title: 'Vertical Bar' },
        ],
      },
    ],
  },
  {
    key: 'tabs',
    title: 'Tabs',
    children: [
      {
        key: 'tabs-types',
        title: 'Tab Types',
        children: [
          { key: 'tabs-types-tabs-top', title: 'Top Tabs' },
          { key: 'tabs-types-tabs-left', title: 'Left Tabs' },
          { key: 'tabs-types-tabs-nested', title: 'Nested Tabs' },
        ],
      },
    ],
  },
  {
    key: 'lib-controls',
    title: 'Controls',
    children: [
      { key: 'lib-controls-display-control', title: 'Display Control' },
    ],
  },
  {
    key: 'lib-data-analytics',
    title: 'Data & Analytics',
    children: [
      {
        key: 'lib-data-analytics-analytics',
        title: 'Analytics',
        children: [
          { key: 'lib-data-analytics-analytics-embedded-chart', title: 'Embedded Chart' },
          { key: 'lib-data-analytics-analytics-data-quality-alerts', title: 'Data Quality Alerts' },
        ],
      },
    ],
  },
  {
    key: 'lib-content-communication',
    title: 'Content & Communication',
    children: [
      {
        key: 'lib-content-communication-content',
        title: 'Content',
        children: [
          { key: 'lib-content-communication-content-markdown', title: 'Markdown' },
        ],
      },
      {
        key: 'lib-content-communication-comms',
        title: 'Communication',
        children: [
          { key: 'lib-content-communication-comms-announcements', title: 'Announcements' },
          { key: 'lib-content-communication-comms-changelog', title: 'Changelog' },
          { key: 'lib-content-communication-comms-team-activity-feed', title: 'Team Activity Feed' },
        ],
      },
    ],
  },
  {
    key: 'lib-tools-ai',
    title: 'Tools & AI',
    children: [
      {
        key: 'lib-tools-ai-navigation',
        title: 'Navigation',
        children: [
          { key: 'lib-tools-ai-navigation-quick-links', title: 'Quick Links' },
          { key: 'lib-tools-ai-navigation-pinned-dashboards', title: 'Pinned Dashboards' },
          { key: 'lib-tools-ai-navigation-search-box', title: 'Search Box' },
          { key: 'lib-tools-ai-navigation-recent-databases', title: 'Recent Databases' },
        ],
      },
      {
        key: 'lib-tools-ai-organization',
        title: 'Organization',
        children: [
          { key: 'lib-tools-ai-organization-tag-cloud', title: 'Tag Cloud' },
          { key: 'lib-tools-ai-organization-my-reports-schedule', title: 'My Reports Schedule' },
          { key: 'lib-tools-ai-organization-certifications', title: 'Certifications' },
        ],
      },
      {
        key: 'lib-tools-ai-ai-powered',
        title: 'AI-Powered',
        children: [
          { key: 'lib-tools-ai-ai-powered-ai-suggestions', title: 'AI Suggestions' },
        ],
      },
    ],
  },
];

// ── Blocks: Layout elements only ─────────────────────────────────────────────

export const treeData: ComponentNode[] = [
  {
    key: 'layout',
    title: 'Layout',
    children: [
      {
        key: 'layout-structure',
        title: 'Structure',
        children: [
          { key: 'layout-structure-row', title: 'Row' },
          { key: 'layout-structure-column', title: 'Column' },
          { key: 'layout-structure-container', title: 'Container' },
          { key: 'layout-structure-tabs', title: 'Tabs' },
        ],
      },
      {
        key: 'layout-content',
        title: 'Content',
        children: [
          { key: 'layout-content-header', title: 'Header' },
          { key: 'layout-content-divider', title: 'Divider' },
          { key: 'layout-content-markdown', title: 'Markdown' },
          { key: 'layout-content-spacer', title: 'Spacer' },
          { key: 'layout-content-label', title: 'Label' },
          { key: 'layout-content-postit', title: 'Post-it' },
          { key: 'layout-content-filter', title: 'Filter' },
        ],
      },
    ],
  },
  {
    key: 'extensions',
    title: 'Extensions',
    children: [
      {
        key: 'ext-community',
        title: 'Community',
        children: [
          { key: 'ext-community-custom-viz', title: 'Custom Visualization' },
          { key: 'ext-community-iframe', title: 'Iframe' },
          { key: 'ext-community-html', title: 'HTML' },
        ],
      },
      {
        key: 'ext-third-party',
        title: 'Third Party',
        children: [
          { key: 'ext-third-party-powerbi', title: 'Power BI Embed' },
          { key: 'ext-third-party-tableau', title: 'Tableau Embed' },
          { key: 'ext-third-party-looker', title: 'Looker Embed' },
        ],
      },
    ],
  },
];
