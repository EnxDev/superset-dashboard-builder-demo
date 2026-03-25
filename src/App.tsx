import { useState, useEffect, useRef } from 'react';
import { ConfigProvider, theme as antdTheme, Modal, Input, message, Tooltip, Tag, Dropdown, Select } from 'antd';
import type { MenuProps } from 'antd';
import {
  MoonOutlined, SunOutlined, SaveOutlined, UndoOutlined, ClearOutlined,
  ArrowLeftOutlined, MoreOutlined, EditOutlined, FullscreenOutlined,
  ReloadOutlined, DownloadOutlined, ShareAltOutlined, LayoutOutlined,
  ExperimentOutlined, CloseOutlined,
} from '@ant-design/icons';
import LeftPanel from './components/LeftPanel';
import DropCanvas, { type DropCanvasHandle } from './components/DropCanvas';
import DndContextProvider from './components/DndContextProvider';
import DashboardList from './components/DashboardList';
import DashboardDetail from './components/DashboardDetail';
import DashboardPropertiesModal from './components/DashboardPropertiesModal';
import NewDashboardWizard from './components/NewDashboardWizard';
import {
  saveTemplate, seedDefaultTemplates, type CanvasItem, type LayoutMode, type Template, type TemplateProperties,
} from './store/templateStore';
import { rearrangeForLayout } from './utils/collision';
import supersetLogo from './assets/superset-logo-horiz.png';
import './App.css';

type Mode = 'light' | 'dark';
type View = 'list' | 'detail' | 'editor';

const lightTokens = {
  colorPrimary: '#20A7C9', colorLink: '#20A7C9',
  colorError: '#EF4444', colorWarning: '#FFA94D',
  colorSuccess: '#59B578', colorInfo: '#20A7C9',
  colorText: '#1F1F1F', colorBorder: '#E0E0E0',
  colorBgContainer: '#FFFFFF', colorBgLayout: '#F7F7F7',
  fontFamily: 'Inter, Helvetica, Arial, sans-serif',
  fontWeightStrong: 500, borderRadius: 4,
};

const darkTokens = {
  colorPrimary: '#20A7C9', colorLink: '#20A7C9',
  colorError: '#EF4444', colorWarning: '#FFA94D',
  colorSuccess: '#59B578', colorInfo: '#20A7C9',
  colorText: '#E8E9EA', colorBorder: '#3D444D',
  colorBgContainer: '#2D3339', colorBgLayout: '#1B1F23',
  fontFamily: 'Inter, Helvetica, Arial, sans-serif',
  fontWeightStrong: 500, borderRadius: 4,
};

export default function App() {
  // Seed default dashboards on first visit
  useState(() => { seedDefaultTemplates(); });

  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem('theme') as Mode) ?? 'dark',
  );

  const [view, setView]             = useState<View>('list');
  const [activeTemplate, setActive] = useState<Template | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 600 });
  const mainRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<DropCanvasHandle>(null);

  // Editor state
  const [items, setItems]           = useState<CanvasItem[]>([]);
  const [history, setHistory]       = useState<CanvasItem[][]>([]);
  const [isDirty, setIsDirty]       = useState(false);
  const [savedAt, setSavedAt]       = useState<string | null>(null);
  const [saveModalOpen, setSaveMod] = useState(false);
  const [templateName, setTplName]  = useState('My Dashboard');
  const [isSaveAs, setIsSaveAs]     = useState(false);

  const canUndo = history.length > 0;

  // Layout mode
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [gridCols, setGridCols]     = useState(3);

  // Properties modal
  const [propsOpen, setPropsOpen]   = useState(false);
  const [tplProps, setTplProps]     = useState<Partial<TemplateProperties>>({});

  // Fullscreen
  const [fullscreen, setFullscreen] = useState(false);

  // Panel position
  type PanelPosition = 'left' | 'right' | 'top' | 'bottom';
  const [panelPosition, setPanelPosition] = useState<PanelPosition>('left');

  // Demo banner
  const [demoDismissed, setDemoDismissed] = useState(
    () => sessionStorage.getItem('demo_dismissed') === '1',
  );

  const [msgApi, msgCtxHolder] = message.useMessage();
  const [modalApi, modalCtxHolder] = Modal.useModal();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  useEffect(() => { setIsDirty(true); }, [items]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const openList = () => { setView('list'); setActive(null); setFullscreen(false); };

  const openDetail = (tpl: Template) => { setActive(tpl); setView('detail'); setFullscreen(false); };

  const openEditor = (tpl?: Template, preloadItems?: CanvasItem[], mode?: LayoutMode, cols?: number, name?: string) => {
    setActive(tpl ?? null);
    setItems(preloadItems ?? tpl?.items ?? []);
    setHistory([]);
    setTplName(name ?? tpl?.name ?? 'My Dashboard');
    setTplProps(tpl?.properties ?? {});
    setSavedAt(tpl?.savedAt ?? null);
    setLayoutMode(mode ?? tpl?.layoutMode ?? 'grid');
    setGridCols(cols ?? tpl?.gridCols ?? 3);
    setIsDirty(preloadItems != null && preloadItems.length > 0);
    setView('editor');
    setFullscreen(false);
  };

  // ── Canvas ops ────────────────────────────────────────────────────────────

  const pushHistory = (current: CanvasItem[]) =>
    setHistory((h) => [...h.slice(-49), current]);

  const addItem = (item: CanvasItem) => {
    setItems((prev) => { pushHistory(prev); return [...prev, item]; });
  };

  /** Recursively add a child to the container matching parentId */
  const addChildToTree = (items: CanvasItem[], parentId: string, child: CanvasItem): CanvasItem[] =>
    items.map((it) => {
      if (it.id === parentId) return { ...it, children: [...(it.children ?? []), child] };
      if (it.children) return { ...it, children: addChildToTree(it.children, parentId, child) };
      return it;
    });

  const addChildItem = (parentId: string, child: CanvasItem) => {
    setItems((prev) => { pushHistory(prev); return addChildToTree(prev, parentId, child); });
  };

  /** Recursively remove an item by id from the tree */
  const removeFromTree = (items: CanvasItem[], id: string): CanvasItem[] =>
    items
      .filter((it) => it.id !== id)
      .map((it) => it.children ? { ...it, children: removeFromTree(it.children, id) } : it);

  const removeItem = (id: string) => {
    setItems((prev) => { pushHistory(prev); return removeFromTree(prev, id); });
  };

  const moveItem = (id: string, x: number, y: number) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, x, y } : it));
  };

  /** Recursively apply a resize patch to any item in the tree */
  const applyResizePatch = (items: CanvasItem[], id: string, patch: Record<string, unknown>): CanvasItem[] =>
    items.map((it) => {
      if (it.id === id) {
        const { _config, ...rest } = patch;
        const updated = { ...it, ...rest } as CanvasItem;
        if (_config) updated.config = _config as Record<string, unknown>;
        return updated;
      }
      if (it.children) return { ...it, children: applyResizePatch(it.children, id, patch) };
      return it;
    });

  const resizeItem = (id: string, patch: Record<string, unknown>) => {
    setItems((prev) => { pushHistory(prev); return applyResizePatch(prev, id, patch); });
  };

  const moveGridItem = (id: string, col: number, row: number) => {
    setItems((prev) => {
      pushHistory(prev);
      // If another item occupies the target cell, swap positions
      const draggedItem = prev.find((it) => it.id === id);
      if (!draggedItem) return prev;
      const occupant = prev.find(
        (it) => it.id !== id && (it.col ?? 0) === col && (it.row ?? 0) === row,
      );
      return prev.map((it) => {
        if (it.id === id) return { ...it, col, row };
        if (occupant && it.id === occupant.id) {
          return { ...it, col: draggedItem.col ?? 0, row: draggedItem.row ?? 0 };
        }
        return it;
      });
    });
  };

  const handleTreeDrop = (key: string, title: string, x: number, y: number) => {
    canvasRef.current?.triggerDrop(key, title, x, y);
  };

  const handleRowReorder = (fromIdx: number, toIdx: number) => {
    setItems((prev) => {
      pushHistory(prev);
      const sorted = [...prev].sort((a, b) => (a.row ?? 0) - (b.row ?? 0));
      const [moved] = sorted.splice(fromIdx, 1);
      sorted.splice(toIdx, 0, moved);
      return sorted.map((it, i) => ({ ...it, row: i }));
    });
  };

  const updateConfigInTree = (items: CanvasItem[], id: string, config: Record<string, unknown>): CanvasItem[] =>
    items.map((it) => {
      if (it.id === id) return { ...it, title: (config.title as string) || it.title, config };
      if (it.children) return { ...it, children: updateConfigInTree(it.children, id, config) };
      return it;
    });

  const updateItemConfig = (id: string, config: Record<string, unknown>) => {
    setItems((prev) => { pushHistory(prev); return updateConfigInTree(prev, id, config); });
  };

  const handleUndo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setItems(prev);
      return h.slice(0, -1);
    });
  };

  // ── Save ─────────────────────────────────────────────────────────────────

  const openSave = (saveAs = false) => {
    if (items.length === 0 && !saveAs) { msgApi.warning('Canvas is empty.'); return; }
    setIsSaveAs(saveAs);
    setTplName(saveAs ? `${activeTemplate?.name ?? 'My Dashboard'} (copy)` : (activeTemplate?.name ?? 'My Dashboard'));
    setSaveMod(true);
  };

  const confirmSave = () => {
    const id = isSaveAs ? undefined : activeTemplate?.id;
    const tpl = saveTemplate(items, templateName, id, tplProps, layoutMode, gridCols);
    if (!isSaveAs) { setActive(tpl); setSavedAt(tpl.savedAt); setIsDirty(false); }
    setSaveMod(false);
    msgApi.success(`"${templateName}" saved.`);
    if (isSaveAs) openList();
  };

  // ── Reset ────────────────────────────────────────────────────────────────

  const handleReset = () => {
    modalApi.confirm({
      title: activeTemplate ? 'Reset to last saved version?' : 'Clear canvas?',
      content: 'Unsaved changes will be lost.',
      okText: 'Reset', okButtonProps: { danger: true },
      onOk: () => {
        if (activeTemplate) {
          setItems(activeTemplate.items);
          setLayoutMode(activeTemplate.layoutMode ?? 'grid');
          setGridCols(activeTemplate.gridCols ?? 3);
          setTplProps(activeTemplate.properties ?? {});
          setTplName(activeTemplate.name);
        } else {
          setItems([]);
        }
        setIsDirty(false);
      },
    });
  };

  const handleClear = () => {
    if (items.length === 0) return;
    modalApi.confirm({
      title: 'Clear dashboard?', content: 'All charts will be removed.',
      okText: 'Clear', okButtonProps: { danger: true },
      onOk: () => { setItems([]); setSavedAt(null); setIsDirty(false); },
    });
  };

  // ── Layout switch ───────────────────────────────────────────────────────

  const handleLayoutSwitch = (newMode: LayoutMode) => {
    if (newMode === layoutMode) return;
    if (items.length > 0) {
      pushHistory(items);
      const size = canvasRef.current?.getSize();
      const canvasW = size?.w ?? 900;
      const canvasH = size?.h ?? 600;
      const rearranged = rearrangeForLayout(items, newMode, gridCols, canvasW, canvasH);
      setItems(rearranged);
    }
    setLayoutMode(newMode);
  };

  // ── Properties ───────────────────────────────────────────────────────────

  const handleApplyProps = (values: TemplateProperties) => {
    setTplProps(values);
    setTplName(values.name);
    setPropsOpen(false);
    // Persist immediately if template already exists
    if (activeTemplate) {
      const tpl = saveTemplate(items, values.name, activeTemplate.id, values, layoutMode, gridCols);
      setActive(tpl);
      setSavedAt(tpl.savedAt);
      setIsDirty(false);
    }
    msgApi.success('Properties updated.');
  };

  // ── Dropdown menus ────────────────────────────────────────────────────────

  const viewMoreMenu: MenuProps = {
    items: [
      { key: 'refresh',   label: 'Refresh dashboard', icon: <ReloadOutlined />,      onClick: () => msgApi.info('Dashboard refreshed.') },
      { key: 'autoref',   label: 'Set auto-refresh',  icon: <ReloadOutlined />,      disabled: true },
      { type: 'divider' },
      { key: 'fullscreen',label: 'Enter fullscreen',  icon: <FullscreenOutlined />,  onClick: () => setFullscreen(true) },
      { type: 'divider' },
      { key: 'saveas',    label: 'Save as',            icon: <SaveOutlined />,        onClick: () => openSave(true) },
      { key: 'download',  label: 'Download',           icon: <DownloadOutlined />,    children: [
        { key: 'dl-json', label: 'Export (JSON)' },
        { key: 'dl-img',  label: 'Export as image' },
      ]},
      { key: 'share',     label: 'Share',              icon: <ShareAltOutlined />,    children: [
        { key: 'share-link',  label: 'Copy link' },
        { key: 'share-embed', label: 'Embed dashboard' },
      ]},
      { type: 'divider' },
      { key: 'email',     label: 'Manage email report', onClick: () => msgApi.info('Email report settings coming soon.') },
    ],
  };

  const editMoreMenu: MenuProps = {
    items: [
      { key: 'props',    label: 'Edit properties', icon: <EditOutlined />,       onClick: () => setPropsOpen(true) },
      { type: 'divider' },
      { key: 'saveas',   label: 'Save as',          icon: <SaveOutlined />,       onClick: () => openSave(true) },
      { key: 'download', label: 'Download',          icon: <DownloadOutlined />,   children: [
        { key: 'dl-json', label: 'Export (JSON)' },
        { key: 'dl-img',  label: 'Export as image' },
      ]},
      { key: 'share',    label: 'Share',             icon: <ShareAltOutlined />,   children: [
        { key: 'share-link',  label: 'Copy link' },
        { key: 'share-embed', label: 'Embed dashboard' },
      ]},
    ],
  };

  const savedLabel = savedAt
    ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : null;

  return (
    <ConfigProvider theme={{
      algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: mode === 'dark' ? darkTokens : lightTokens,
    }}>
      {msgCtxHolder}
      {modalCtxHolder}

      <div className={`app-layout ${fullscreen ? 'app-fullscreen' : ''}`}>

        {/* ── Demo banner ── */}
        {!demoDismissed && !fullscreen && (
          <div className="demo-banner">
            <ExperimentOutlined className="demo-banner__icon" />
            <span className="demo-banner__text">
              <strong>Mad science in progress!</strong> You've stumbled into a demo app that's trying to
              revolutionize how dashboards are built inside Apache Superset. Nothing here is real — except
              the ambition. Your browser is the database, your clicks are the API, and that save button?
              Pure localStorage vibes. Proceed with enthusiasm.
            </span>
            <button
              className="demo-banner__close"
              onClick={() => { setDemoDismissed(true); sessionStorage.setItem('demo_dismissed', '1'); }}
              aria-label="Dismiss banner"
            >
              <CloseOutlined />
            </button>
          </div>
        )}

        {/* ── Top nav (hidden in fullscreen) ── */}
        {!fullscreen && (
          <header className="app-header">
            <img src={supersetLogo} alt="Superset" className="brand-logo" />
            <nav className="nav-links">
              <a className={view !== 'editor' ? 'nav-active' : ''} onClick={openList}>Dashboards</a>
              <a>Charts</a>
              <a>Datasets</a>
              <a>SQL</a>
            </nav>
            <button className="theme-toggle" onClick={() => setMode((m) => m === 'light' ? 'dark' : 'light')} title="Toggle theme" aria-label="Toggle theme">
              {mode === 'light' ? <MoonOutlined /> : <SunOutlined />}
            </button>
          </header>
        )}

        <DndContextProvider
          items={items}
          layoutMode={layoutMode}
          gridCols={gridCols}
          canvasRef={mainRef}
          onTreeDrop={handleTreeDrop}
          onMove={moveItem}
          onGridMove={moveGridItem}
          onRowReorder={handleRowReorder}
        >
        <div className={`app-body app-body--panel-${panelPosition}`}>
          {view === 'editor' && <LeftPanel position={panelPosition} onPositionChange={setPanelPosition} />}

          <main className="canvas-area" ref={(el) => {
            if (el && el !== mainRef.current) {
              mainRef.current = el;
              setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
            }
          }}>

            {/* ── List ── */}
            {view === 'list' && (
              <DashboardList onOpen={openDetail} onNew={() => {
                if (mainRef.current) setCanvasSize({ w: mainRef.current.clientWidth, h: mainRef.current.clientHeight });
                setWizardOpen(true);
              }} onStartFromStarter={(starterItems, mode, cols, name) => {
                openEditor(undefined, starterItems, mode, cols, name);
              }} />
            )}

            {/* ── Detail (view mode) ── */}
            {view === 'detail' && activeTemplate && (
              <>
                {/* View-mode toolbar */}
                <div className="canvas-toolbar">
                  <button className="db-detail__back toolbar-btn" onClick={openList}>
                    <ArrowLeftOutlined /> Dashboards
                  </button>
                  <div className="toolbar-divider" />
                  <span className="toolbar-title">{activeTemplate.name}</span>
                  <div className="toolbar-status" />

                  {fullscreen && (
                    <Tooltip title="Exit fullscreen">
                      <button className="toolbar-btn" onClick={() => setFullscreen(false)}>
                        <FullscreenOutlined />
                      </button>
                    </Tooltip>
                  )}

                  <button
                    className="toolbar-btn toolbar-btn--primary"
                    onClick={() => openEditor(activeTemplate)}
                  >
                    <EditOutlined /> Edit dashboard
                  </button>

                  <Dropdown menu={viewMoreMenu} trigger={['click']} placement="bottomRight">
                    <button className="toolbar-btn toolbar-btn--icon" title="More options" aria-label="More options">
                      <MoreOutlined />
                    </button>
                  </Dropdown>
                </div>

                <DashboardDetail
                  template={activeTemplate}
                  onBack={openList}
                  onEdit={() => openEditor(activeTemplate)}
                  hideHeader
                />
              </>
            )}

            {/* ── Editor ── */}
            {view === 'editor' && (
              <>
                <div className="canvas-toolbar">
                  <button className="toolbar-btn" onClick={() => activeTemplate ? openDetail(activeTemplate) : openList()}>
                    <ArrowLeftOutlined />
                    Dashboards
                  </button>
                  <div className="toolbar-divider" />
                  <span className="toolbar-dashboard-name">{templateName}</span>
                  <div className="toolbar-divider" />

                  <div className="layout-switcher">
                    <LayoutOutlined className="layout-switcher__icon" />
                    <Select
                      value={layoutMode}
                      onChange={handleLayoutSwitch}
                      size="small"
                      variant="borderless"
                      popupMatchSelectWidth={false}
                      options={[
                        { value: 'grid',   label: 'Grid' },
                        { value: 'rows',   label: 'Rows' },
                        { value: 'xy',     label: 'Free (XY)' },
                        { value: 'mosaic', label: 'Mosaic' },
                      ]}
                    />
                  </div>

                  <div className="toolbar-status">
                    {isDirty && items.length > 0 && <Tag color="warning">Unsaved changes</Tag>}
                    {!isDirty && savedLabel && <Tag color="success">{savedLabel}</Tag>}
                  </div>

                  <Tooltip title="Undo last action">
                    <button className="toolbar-btn toolbar-btn--icon" onClick={handleUndo} disabled={!canUndo} aria-label="Undo">
                      <UndoOutlined />
                    </button>
                  </Tooltip>

                  <Tooltip title="Clear canvas">
                    <button className="toolbar-btn" onClick={handleClear} disabled={items.length === 0}>
                      <ClearOutlined /> Clear
                    </button>
                  </Tooltip>

                  <Tooltip title="Reset to last saved version">
                    <button className="toolbar-btn" onClick={handleReset} disabled={!isDirty}>
                      <UndoOutlined /> Reset
                    </button>
                  </Tooltip>

                  <button
                    className="toolbar-btn toolbar-btn--primary"
                    onClick={() => openSave(false)}
                    disabled={items.length === 0}
                  >
                    <SaveOutlined /> Save
                  </button>

                  <Dropdown menu={editMoreMenu} trigger={['click']} placement="bottomRight">
                    <button className="toolbar-btn toolbar-btn--icon" title="More options" aria-label="More options">
                      <MoreOutlined />
                    </button>
                  </Dropdown>
                </div>

                <DropCanvas ref={canvasRef} items={items} layoutMode={layoutMode} gridCols={gridCols} onAdd={addItem} onAddChild={addChildItem} onRemove={removeItem} onUpdateItem={updateItemConfig} onResize={resizeItem} />
              </>
            )}
          </main>
        </div>
        </DndContextProvider>
      </div>

      {/* ── New dashboard wizard ── */}
      <NewDashboardWizard
        open={wizardOpen}
        onCancel={() => setWizardOpen(false)}
        canvasSize={canvasSize}
        onConfirm={(preloadedItems, mode, cols) => {
          setWizardOpen(false);
          openEditor(undefined, preloadedItems, mode, cols);
        }}
      />

      {/* ── Save / Save-as modal ── */}
      <Modal
        open={saveModalOpen}
        title={isSaveAs ? 'Save as new dashboard' : 'Save dashboard'}
        okText="Save"
        cancelText="Cancel"
        onOk={confirmSave}
        onCancel={() => setSaveMod(false)}
        width={360}
      >
        <div className="save-modal__field">
          <label className="save-modal__label">
            Dashboard name
          </label>
          <Input
            value={templateName}
            onChange={(e) => setTplName(e.target.value)}
            placeholder="My Dashboard"
            onPressEnter={confirmSave}
            autoFocus
          />
        </div>
      </Modal>

      {/* ── Edit properties modal ── */}
      <DashboardPropertiesModal
        open={propsOpen}
        initialValues={{ name: templateName, ...tplProps }}
        onApply={handleApplyProps}
        onCancel={() => setPropsOpen(false)}
      />
    </ConfigProvider>
  );
}
