import { useState } from 'react';
import { Input, Empty, Modal, Tag, Tooltip } from 'antd';
import {
  SearchOutlined, DeleteOutlined,
  AppstoreOutlined, EyeOutlined,
  BarsOutlined, RocketOutlined,
  DownOutlined, RightOutlined,
} from '@ant-design/icons';
import { loadTemplates, deleteTemplate, type Template, type CanvasItem, type LayoutMode } from '../store/templateStore';
import { STARTER_TEMPLATES, STARTER_CATEGORY_LABELS, type StarterCategory } from '../data/starterTemplates';
import './DashboardList.css';

interface Props {
  onOpen: (tpl: Template) => void;
  onNew: () => void;
  onStartFromStarter?: (items: CanvasItem[], mode: LayoutMode, cols: number, name: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardList({ onOpen, onNew, onStartFromStarter }: Props) {
  const [templates, setTemplates] = useState<Template[]>(loadTemplates);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [starterFilter, setStarterFilter] = useState<StarterCategory | 'all'>('all');
  const [startersVisible, setStartersVisible] = useState(
    () => localStorage.getItem('superset_pb_starters_hidden') !== '1',
  );

  const toggleStarters = () => {
    setStartersVisible((prev) => {
      const next = !prev;
      if (next) localStorage.removeItem('superset_pb_starters_hidden');
      else localStorage.setItem('superset_pb_starters_hidden', '1');
      return next;
    });
  };

  const filteredStarters = starterFilter === 'all'
    ? STARTER_TEMPLATES
    : STARTER_TEMPLATES.filter((s) => s.category === starterFilter);

  const handleUseStarter = (st: typeof STARTER_TEMPLATES[number]) => {
    if (!onStartFromStarter) return;
    const freshItems = st.items.map((it) => ({
      ...it,
      id: `${it.key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }));
    onStartFromStarter(freshItems, st.layoutMode, st.gridCols, st.name);
  };

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (tpl: Template) => {
    Modal.confirm({
      title: `Delete "${tpl.name}"?`,
      content: 'This cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        deleteTemplate(tpl.id);
        setTemplates(loadTemplates());
      },
    });
  };

  return (
    <div className="db-list">
      {/* Page header */}
      <div className="db-list__header">
        <div className="db-list__title">
          <AppstoreOutlined className="db-list__title-icon" />
          Dashboards
        </div>
        <div className="db-list__actions">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search dashboards…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="db-list__search"
            allowClear
          />
          <div className="db-list__view-toggle">
            <Tooltip title="List view">
              <button
                className={`db-list__view-btn${viewMode === 'list' ? ' db-list__view-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <BarsOutlined />
              </button>
            </Tooltip>
            <Tooltip title="Card view">
              <button
                className={`db-list__view-btn${viewMode === 'card' ? ' db-list__view-btn--active' : ''}`}
                onClick={() => setViewMode('card')}
              >
                <AppstoreOutlined />
              </button>
            </Tooltip>
          </div>
          <button className="toolbar-btn toolbar-btn--primary" onClick={onNew}>
            + New dashboard
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="db-list__empty">
          <Empty
            description={
              templates.length === 0
                ? 'No saved dashboards yet. Create your first one!'
                : 'No dashboards match your search.'
            }
          />
          {templates.length === 0 && (
            <button
              className="toolbar-btn toolbar-btn--primary"
              style={{ marginTop: 16 }}
              onClick={onNew}
            >
              + New dashboard
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Charts</th>
                <th>Last modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tpl) => (
                <tr key={tpl.id} className="db-table__row" onClick={() => onOpen(tpl)}>
                  <td className="db-table__name">{tpl.name}</td>
                  <td className="db-table__charts">
                    {tpl.items.length} chart{tpl.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="db-table__time">{timeAgo(tpl.savedAt)}</td>
                  <td className="db-table__actions" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Preview">
                      <button className="db-card__btn" onClick={() => onOpen(tpl)}>
                        <EyeOutlined />
                      </button>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <button className="db-card__btn db-card__btn--danger" onClick={() => handleDelete(tpl)}>
                        <DeleteOutlined />
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="db-grid">
          {filtered.map((tpl) => (
            <div key={tpl.id} className="db-card" onClick={() => onOpen(tpl)}>
              {/* Preview area */}
              <div className="db-card__preview">
                <div className="db-card__preview-dots">
                  {tpl.items.slice(0, 6).map((item) => (
                    <div key={item.id} className="db-card__dot" title={item.title} />
                  ))}
                </div>
                <span className="db-card__count">
                  {tpl.items.length} chart{tpl.items.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Footer */}
              <div className="db-card__footer">
                <div className="db-card__info">
                  <span className="db-card__name">{tpl.name}</span>
                  <span className="db-card__time">{timeAgo(tpl.savedAt)}</span>
                </div>
                <div className="db-card__btns" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Preview">
                    <button className="db-card__btn" onClick={() => onOpen(tpl)}>
                      <EyeOutlined />
                    </button>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <button className="db-card__btn db-card__btn--danger" onClick={() => handleDelete(tpl)}>
                      <DeleteOutlined />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Starter templates gallery ── */}
      {onStartFromStarter && (
        <div className="db-starters">
          <div className="db-starters__header" onClick={toggleStarters} role="button" tabIndex={0}>
            <span className="db-starters__toggle">
              {startersVisible ? <DownOutlined /> : <RightOutlined />}
            </span>
            <RocketOutlined className="db-starters__icon" />
            <span className="db-starters__title">Starter Templates</span>
            <span className="db-starters__subtitle">Pre-built dashboards for common analytics use cases</span>
          </div>
          {startersVisible && (
            <>
              <div className="db-starters__filters">
                <Tag.CheckableTag checked={starterFilter === 'all'} onChange={() => setStarterFilter('all')}>
                  All
                </Tag.CheckableTag>
                {(Object.entries(STARTER_CATEGORY_LABELS) as [StarterCategory, string][]).map(([cat, label]) => (
                  <Tag.CheckableTag key={cat} checked={starterFilter === cat} onChange={() => setStarterFilter(cat)}>
                    {label}
                  </Tag.CheckableTag>
                ))}
              </div>
              <div className="db-starters__grid">
                {filteredStarters.map((st) => (
                  <Tooltip key={st.id} title={st.description}>
                    <div className="db-starter-card" onClick={() => handleUseStarter(st)}>
                      <div className="db-starter-card__preview">
                        {st.items.slice(0, 6).map((it) => (
                          <div key={it.id} className="db-starter-card__dot" title={it.title} />
                        ))}
                      </div>
                      <div className="db-starter-card__body">
                        <div className="db-starter-card__name">{st.name}</div>
                        <div className="db-starter-card__meta">
                          {st.items.length} items · {st.layoutMode}
                        </div>
                        <div className="db-starter-card__desc">{st.description}</div>
                      </div>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
