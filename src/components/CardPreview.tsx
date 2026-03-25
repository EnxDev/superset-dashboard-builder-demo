import type { CanvasItem } from '../store/templateStore';
import {
  PiePreview, BarPreview, LinePreview, ScatterPreview, TablePreview,
  KpiPreview, FilterPreview, FeedPreview, InputPreview, ProgressPreview,
  AlertPreview, AiPreview, MapPreview, GenericPreview, FilterToolboxPreview,
  // Layout
  TabsPreview, RowPreview, ColumnPreview, HeaderPreview, DividerPreview,
  MarkdownPreview, SpacerPreview, GridContainerPreview,
  // Chart sub-types
  BigNumberPreview, TrendlinePreview, PivotPreview,
  // Library widgets
  AnnouncementsPreview, ChangelogPreview, QuickLinksPreview,
  SearchBoxPreview, TagCloudPreview, CertificationsPreview,
  SchedulePreview, PinnedDashboardsPreview, RecentDatabasesPreview,
  EmbeddedChartPreview, DataQualityPreview,
} from './previews';
import FilterToolboxRenderer from './FilterToolboxRenderer';

/** Map a node key to a visual category */
function resolveType(key: string): string {
  const k = key.toLowerCase();

  // ── Filter toolbox (must come before generic filter check) ──
  if (k.includes('filtertoolbox'))  return 'filtertoolbox';
  if (k.includes('filterbar'))      return 'filterbar';

  // ── Layout elements ──
  if (k.includes('layout-structure-row') || k.endsWith('-row'))           return 'row';
  if (k.includes('layout-structure-column') || k.endsWith('-column'))     return 'column';
  if (k.includes('grid-container'))                                       return 'grid-container';
  if (k.includes('layout-content-header') || k.endsWith('-header'))       return 'header';
  if (k.includes('layout-content-divider') || k.endsWith('-divider'))     return 'divider';
  if (k.includes('layout-content-spacer') || k.endsWith('-spacer'))       return 'spacer';

  // ── Tabs ──
  if (k.includes('tabs'))           return 'tabs';

  // ── Charts ──
  if (k.includes('pie'))            return 'pie';
  if (k.includes('bar'))            return 'bar';
  if (k.includes('line') || k.includes('area') || k.includes('timeseries')) return 'line';
  if (k.includes('scatter'))        return 'scatter';
  if (k.includes('pivot'))          return 'pivot';
  if (k.includes('bignum-trendline') || k.includes('trendline')) return 'trendline';
  if (k.includes('bignum'))         return 'bignum';
  if (k.includes('table'))          return 'table';
  if (k.includes('map') || k.includes('deck'))  return 'map';
  if (k.includes('kpi') || k.includes('revenue') || k.includes('churn') || k.includes('metric')) return 'kpi';

  // ── Library widgets ──
  if (k.includes('embedded-chart'))        return 'embedded-chart';
  if (k.includes('data-quality'))          return 'data-quality';
  if (k.includes('announcements'))         return 'announcements';
  if (k.includes('changelog'))             return 'changelog';
  if (k.includes('team-activity-feed'))    return 'feed';
  if (k.includes('quick-links'))           return 'quick-links';
  if (k.includes('pinned-dashboards'))     return 'pinned-dashboards';
  if (k.includes('search-box'))            return 'search-box';
  if (k.includes('recent-databases'))      return 'recent-databases';
  if (k.includes('tag-cloud'))             return 'tag-cloud';
  if (k.includes('my-reports-schedule'))   return 'schedule';
  if (k.includes('certifications'))        return 'certifications';
  if (k.includes('ai-suggestions') || k.includes('ai'))  return 'ai';

  // ── Markdown (check after layout-content-markdown and lib markdown) ──
  if (k.includes('markdown'))       return 'markdown';

  // ── Filters (generic — after all specific filter checks) ──
  if (k.includes('filter') || k.includes('date') || k.includes('range') || k.includes('picker')) return 'filter';

  // ── Other ──
  if (k.includes('feed') || k.includes('activity') || k.includes('notification')) return 'feed';
  if (k.includes('text') || k.includes('input') || k.includes('textarea') || k.includes('password')) return 'input';
  if (k.includes('progress'))   return 'progress';
  if (k.includes('alert'))      return 'alert';
  if (k.includes('chart'))      return 'bar';

  return 'generic';
}

export function isFilterToolbox(key: string): boolean {
  return resolveType(key) === 'filtertoolbox';
}

/** Returns true for any filter-family key (native filters, filter bar, filter toolbox) */
export function isFilterElement(key: string): boolean {
  const k = key.toLowerCase();
  return k.includes('filter');
}

const PREVIEW_MAP: Record<string, React.ComponentType> = {
  // Charts
  pie: PiePreview,
  bar: BarPreview,
  line: LinePreview,
  scatter: ScatterPreview,
  table: TablePreview,
  pivot: PivotPreview,
  bignum: BigNumberPreview,
  trendline: TrendlinePreview,
  map: MapPreview,
  kpi: KpiPreview,

  // Filters
  filter: FilterPreview,
  filtertoolbox: FilterToolboxPreview,
  filterbar: FilterPreview,

  // Layout (tabs handled separately with config)
  row: RowPreview,
  column: ColumnPreview,
  'grid-container': GridContainerPreview,
  header: HeaderPreview,
  divider: DividerPreview,
  // markdown handled separately above with editable content
  spacer: SpacerPreview,

  // Library widgets
  'embedded-chart': EmbeddedChartPreview,
  'data-quality': DataQualityPreview,
  announcements: AnnouncementsPreview,
  changelog: ChangelogPreview,
  'quick-links': QuickLinksPreview,
  'pinned-dashboards': PinnedDashboardsPreview,
  'search-box': SearchBoxPreview,
  'recent-databases': RecentDatabasesPreview,
  'tag-cloud': TagCloudPreview,
  schedule: SchedulePreview,
  certifications: CertificationsPreview,
  ai: AiPreview,

  // Other
  feed: FeedPreview,
  input: InputPreview,
  progress: ProgressPreview,
  alert: AlertPreview,
};

interface CardPreviewProps {
  item: CanvasItem;
  allItems?: CanvasItem[];
  readOnly?: boolean;
  onUpdateConfig?: (id: string, config: Record<string, unknown>) => void;
}

export default function CardPreview({ item, allItems, readOnly, onUpdateConfig }: CardPreviewProps) {
  const type = resolveType(item.key);

  // All filter elements always render through FilterToolboxRenderer
  // so users can see configuration state and connected charts
  if (type === 'filtertoolbox' || type === 'filter' || type === 'filterbar') {
    return <FilterToolboxRenderer item={item} allItems={allItems} />;
  }

  // Tabs render as real Ant Design Tabs with config-driven position & count
  if (type === 'tabs') {
    return <TabsPreview config={item.config} />;
  }

  // Markdown renders as an editable text area
  if (type === 'markdown') {
    return (
      <MarkdownPreview
        content={item.config?.content as string | undefined}
        readOnly={readOnly}
        onContentChange={(content) => {
          onUpdateConfig?.(item.id, { ...item.config, content });
        }}
      />
    );
  }

  const Preview = PREVIEW_MAP[type];
  if (Preview) return <Preview />;
  return <GenericPreview title={item.title} />;
}
