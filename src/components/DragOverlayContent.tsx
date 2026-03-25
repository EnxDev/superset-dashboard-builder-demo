import {
  PieChartOutlined, BarChartOutlined, LineChartOutlined, DotChartOutlined,
  TableOutlined, DashboardOutlined, FilterOutlined, UnorderedListOutlined,
  FormOutlined, LoadingOutlined, WarningOutlined, RobotOutlined,
  GlobalOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { DEFAULT_CARD_W, DEFAULT_CARD_H } from '../constants';
import type { CanvasItem } from '../store/templateStore';

// ── Resolve key → icon + label (lightweight, no ECharts) ─────────────────────

function resolveIcon(key: string): { icon: React.ReactNode; label: string } {
  const k = key.toLowerCase();
  if (k.includes('pie'))      return { icon: <PieChartOutlined />, label: 'Pie Chart' };
  if (k.includes('bar'))      return { icon: <BarChartOutlined />, label: 'Bar Chart' };
  if (k.includes('line') || k.includes('area') || k.includes('timeseries'))
                               return { icon: <LineChartOutlined />, label: 'Line Chart' };
  if (k.includes('scatter'))  return { icon: <DotChartOutlined />, label: 'Scatter' };
  if (k.includes('table'))    return { icon: <TableOutlined />, label: 'Table' };
  if (k.includes('kpi') || k.includes('revenue') || k.includes('users') || k.includes('metric'))
                               return { icon: <DashboardOutlined />, label: 'KPI' };
  if (k.includes('filter'))   return { icon: <FilterOutlined />, label: 'Filter' };
  if (k.includes('feed') || k.includes('activity'))
                               return { icon: <UnorderedListOutlined />, label: 'Feed' };
  if (k.includes('input') || k.includes('form'))
                               return { icon: <FormOutlined />, label: 'Form' };
  if (k.includes('progress')) return { icon: <LoadingOutlined />, label: 'Progress' };
  if (k.includes('alert'))    return { icon: <WarningOutlined />, label: 'Alert' };
  if (k.includes('ai'))       return { icon: <RobotOutlined />, label: 'AI' };
  if (k.includes('map') || k.includes('geo'))
                               return { icon: <GlobalOutlined />, label: 'Map' };
  if (k.includes('chart'))    return { icon: <BarChartOutlined />, label: 'Chart' };
  return { icon: <AppstoreOutlined />, label: 'Component' };
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  source: 'tree' | 'canvas';
  title: string;
  nodeKey?: string;
  item?: CanvasItem;
  renderedW?: number;
  renderedH?: number;
}

export default function DragOverlayContent({ source, title, nodeKey, item, renderedW, renderedH }: Props) {
  const key = item?.key ?? nodeKey ?? '';
  const { icon, label } = resolveIcon(key);
  const w = renderedW ?? item?.w ?? DEFAULT_CARD_W;
  const h = renderedH ?? item?.h ?? DEFAULT_CARD_H;

  return (
    <div
      className="drop-card"
      style={{
        width: w,
        height: h,
        position: 'relative',
        boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
        border: '2px solid var(--color-primary)',
        opacity: 0.85,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div className="drop-card__header">
        <span className="drop-card__label">
          {source === 'tree' ? `+ ${title}` : title}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          color: 'var(--color-primary)',
          opacity: 0.5,
        }}
      >
        <span style={{ fontSize: 32 }}>{icon}</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{label}</span>
      </div>
    </div>
  );
}
