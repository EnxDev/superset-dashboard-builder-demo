import { useState } from 'react';
import { Modal, Steps, Tag, Tooltip, Alert } from 'antd';
import { CheckOutlined, FileOutlined, RocketOutlined, SwapOutlined } from '@ant-design/icons';
import { loadTemplates, type CanvasItem, type LayoutMode, type Template } from '../store/templateStore';
import { LAYOUT_MODES, type LayoutModeOption } from '../data/layoutModes';
import { PRESETS_BY_MODE, type LayoutPreset } from '../data/layoutPresets';
import { resolvePreset } from '../data/presetResolver';
import { rearrangeForLayout } from '../utils/collision';
import { STARTER_TEMPLATES, STARTER_CATEGORY_LABELS, type StarterTemplate, type StarterCategory } from '../data/starterTemplates';
import './NewDashboardWizard.css';

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: (items: CanvasItem[], mode: LayoutMode, gridCols: number) => void;
  canvasSize: { w: number; h: number };
}

export default function NewDashboardWizard({ open, onCancel, onConfirm, canvasSize }: Props) {
  const [step, setStep] = useState(0);

  // Step 0: starting point
  const [startFrom, setStartFrom] = useState<'layout' | 'template' | 'starter'>('layout');
  const [selectedStarter, setSelectedStarter] = useState<StarterTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [starterFilter, setStarterFilter] = useState<StarterCategory | 'all'>('all');

  // Step 1: layout mode
  const [selectedMode, setSelectedMode] = useState<LayoutModeOption>(LAYOUT_MODES[0]);

  // Step 2: preset (only for 'layout' start)
  const [selectedPreset, setSelectedPreset] = useState<LayoutPreset | null>(null);

  const templates = loadTemplates();
  const presetsForMode = PRESETS_BY_MODE[selectedMode.id];

  const filteredStarters = starterFilter === 'all'
    ? STARTER_TEMPLATES
    : STARTER_TEMPLATES.filter((s) => s.category === starterFilter);

  // Determine if the source layout differs from the selected layout
  const sourceLayout: LayoutMode | null =
    startFrom === 'starter' && selectedStarter ? selectedStarter.layoutMode :
    startFrom === 'template' && selectedTemplate ? (selectedTemplate.layoutMode ?? 'grid') :
    null;
  const layoutChanged = sourceLayout !== null && sourceLayout !== selectedMode.id;

  const reset = () => {
    setStep(0);
    setStartFrom('layout');
    setSelectedStarter(null);
    setSelectedTemplate(null);
    setStarterFilter('all');
    setSelectedMode(LAYOUT_MODES[0]);
    setSelectedPreset(null);
  };

  // When picking a starter/template, auto-set the layout to match it
  const handleStarterSelect = (st: StarterTemplate) => {
    setSelectedStarter(st);
    const mode = LAYOUT_MODES.find((m) => m.id === st.layoutMode);
    if (mode) setSelectedMode(mode);
  };

  const handleTemplateSelect = (tpl: Template) => {
    setSelectedTemplate(tpl);
    const mode = LAYOUT_MODES.find((m) => m.id === (tpl.layoutMode ?? 'grid'));
    if (mode) setSelectedMode(mode);
  };

  const handleModeChange = (m: LayoutModeOption) => {
    setSelectedMode(m);
    setSelectedPreset(null);
  };

  const handleOk = () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) { setStep(2); return; }

    // Step 2: confirm & create
    const targetMode = selectedMode.id;
    const { w, h } = canvasSize;
    const cw = w > 0 ? w : 900;
    const ch = h > 0 ? h : 600;

    if (startFrom === 'starter' && selectedStarter) {
      let items = selectedStarter.items.map((it) => ({
        ...it,
        id: `${it.key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }));
      const cols = selectedStarter.gridCols;
      // Rearrange if layout mode was changed
      if (layoutChanged) {
        items = rearrangeForLayout(items, targetMode, cols, cw, ch);
      }
      onConfirm(items, targetMode, cols);
    } else if (startFrom === 'template' && selectedTemplate) {
      let items = [...selectedTemplate.items];
      const cols = selectedTemplate.gridCols ?? 3;
      if (layoutChanged) {
        items = rearrangeForLayout(items, targetMode, cols, cw, ch);
      }
      onConfirm(items, targetMode, cols);
    } else {
      // From preset
      const preset = selectedPreset ?? presetsForMode[0];
      const resolved = resolvePreset(preset, targetMode, cw, ch);
      onConfirm(resolved, targetMode, preset.cols ?? 3);
    }
    reset();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else { reset(); onCancel(); }
  };

  const handleCancel = () => { reset(); onCancel(); };

  const canProceed = () => {
    if (step === 0) {
      if (startFrom === 'template') return selectedTemplate !== null;
      if (startFrom === 'starter') return selectedStarter !== null;
      return true;
    }
    return true;
  };

  const okText = step < 2 ? 'Next' : 'Create dashboard';
  const cancelText = step === 0 ? 'Cancel' : 'Back';

  return (
    <Modal
      open={open}
      title="New dashboard"
      width={780}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ disabled: !canProceed() }}
      onOk={handleOk}
      onCancel={step === 0 ? handleCancel : handleBack}
      cancelButtonProps={{ onClick: step === 0 ? handleCancel : handleBack }}
      className="wiz-modal"
      destroyOnHidden
    >
      <Steps
        current={step}
        size="small"
        className="wiz-steps"
        items={[
          { title: 'Starting point' },
          { title: 'Layout mode' },
          { title: 'Confirm' },
        ]}
      />

      {/* ── Step 0: Starting point ── */}
      {step === 0 && (
        <div className="wiz-body">
          <p className="wiz-subtitle">How do you want to start?</p>
          <div className="wiz-start-options">
            <div
              className={`wiz-start-card selectable-card ${startFrom === 'layout' ? 'selectable-card--active' : ''}`}
              onClick={() => setStartFrom('layout')}
            >
              {startFrom === 'layout' && <CheckOutlined className="selectable-card__check" />}
              <div className="wiz-start-icon">
                <svg viewBox="0 0 48 48" width="48" height="48">
                  <rect x="4" y="4" width="40" height="18" rx="3" fill="currentColor" opacity="0.25" />
                  <rect x="4" y="26" width="18" height="18" rx="3" fill="currentColor" opacity="0.25" />
                  <rect x="26" y="26" width="18" height="18" rx="3" fill="currentColor" opacity="0.25" />
                </svg>
              </div>
              <div className="wiz-start-label">From a preset</div>
              <div className="wiz-start-desc">Choose a preset arrangement of panels and start fresh.</div>
            </div>

            <div
              className={`wiz-start-card selectable-card ${startFrom === 'starter' ? 'selectable-card--active' : ''}`}
              onClick={() => setStartFrom('starter')}
            >
              {startFrom === 'starter' && <CheckOutlined className="selectable-card__check" />}
              <div className="wiz-start-icon">
                <RocketOutlined style={{ fontSize: 40, opacity: 0.6 }} />
              </div>
              <div className="wiz-start-label">From a starter template</div>
              <div className="wiz-start-desc">
                {STARTER_TEMPLATES.length} pre-built dashboards for common analytics use cases.
              </div>
            </div>

            <div
              className={`wiz-start-card selectable-card ${startFrom === 'template' ? 'selectable-card--active' : ''} ${templates.length === 0 ? 'selectable-card--disabled' : ''}`}
              onClick={() => templates.length > 0 && setStartFrom('template')}
            >
              {startFrom === 'template' && <CheckOutlined className="selectable-card__check" />}
              <div className="wiz-start-icon">
                <FileOutlined style={{ fontSize: 40, opacity: 0.6 }} />
              </div>
              <div className="wiz-start-label">From a saved template</div>
              <div className="wiz-start-desc">
                {templates.length === 0
                  ? 'No saved templates yet.'
                  : `${templates.length} template${templates.length !== 1 ? 's' : ''} available.`}
              </div>
            </div>
          </div>

          {/* Starter template picker */}
          {startFrom === 'starter' && (
            <div className="wiz-template-list">
              <p className="wiz-subtitle" style={{ marginTop: 16 }}>Choose a starter template</p>
              <div className="wiz-starter-filters">
                <Tag.CheckableTag
                  checked={starterFilter === 'all'}
                  onChange={() => setStarterFilter('all')}
                >
                  All
                </Tag.CheckableTag>
                {(Object.entries(STARTER_CATEGORY_LABELS) as [StarterCategory, string][]).map(([cat, label]) => (
                  <Tag.CheckableTag
                    key={cat}
                    checked={starterFilter === cat}
                    onChange={() => setStarterFilter(cat)}
                  >
                    {label}
                  </Tag.CheckableTag>
                ))}
              </div>
              <div className="wiz-starter-grid">
                {filteredStarters.map((st) => (
                  <Tooltip key={st.id} title={st.description}>
                    <div
                      className={`wiz-starter-card selectable-card ${selectedStarter?.id === st.id ? 'selectable-card--active' : ''}`}
                      onClick={() => handleStarterSelect(st)}
                    >
                      {selectedStarter?.id === st.id && <CheckOutlined className="selectable-card__check" />}
                      <div className="wiz-starter-preview">
                        {st.items.slice(0, 6).map((it) => <div key={it.id} className="wiz-starter-dot" />)}
                      </div>
                      <div className="wiz-starter-name u-truncate">{st.name}</div>
                      <div className="wiz-starter-meta">
                        {st.items.length} items · {st.layoutMode}
                      </div>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {startFrom === 'template' && templates.length > 0 && (
            <div className="wiz-template-list">
              <p className="wiz-subtitle" style={{ marginTop: 16 }}>Select a template</p>
              <div className="wiz-tpl-grid">
                {templates.map((tpl) => (
                  <Tooltip key={tpl.id} title={`${tpl.items.length} chart${tpl.items.length !== 1 ? 's' : ''} · ${tpl.layoutMode ?? 'grid'}`}>
                    <div
                      className={`wiz-tpl-card selectable-card ${selectedTemplate?.id === tpl.id ? 'selectable-card--active' : ''}`}
                      onClick={() => handleTemplateSelect(tpl)}
                    >
                      {selectedTemplate?.id === tpl.id && <CheckOutlined className="selectable-card__check" />}
                      <div className="wiz-tpl-preview">
                        {tpl.items.slice(0, 4).map((item) => <div key={item.id} className="wiz-tpl-dot" />)}
                      </div>
                      <div className="wiz-tpl-name u-truncate">{tpl.name}</div>
                      <div className="wiz-tpl-mode">{tpl.layoutMode ?? 'grid'}</div>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 1: Layout mode ── */}
      {step === 1 && (
        <div className="wiz-body">
          <p className="wiz-subtitle">Choose how your dashboard arranges charts</p>

          {/* Show which layout the source uses */}
          {sourceLayout && (
            <Alert
              type="info"
              showIcon
              className="wiz-layout-hint"
              message={
                layoutChanged
                  ? <><SwapOutlined /> Items will be rearranged from <Tag>{sourceLayout}</Tag> to <Tag>{selectedMode.id}</Tag> layout.</>
                  : <>Matches the source layout: <Tag>{sourceLayout}</Tag></>
              }
              style={{ marginBottom: 12 }}
            />
          )}

          <div className="wiz-mode-grid">
            {LAYOUT_MODES.map((m) => (
              <div
                key={m.id}
                className={`wiz-mode-card selectable-card ${selectedMode.id === m.id ? 'selectable-card--active' : ''}`}
                onClick={() => handleModeChange(m)}
              >
                {selectedMode.id === m.id && <CheckOutlined className="selectable-card__check" />}
                {sourceLayout === m.id && <Tag color="blue" className="wiz-mode-source-tag">source</Tag>}
                <div className="wiz-mode-preview">{m.preview}</div>
                <div className="wiz-mode-label">{m.label}</div>
                <div className="wiz-mode-desc">{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Confirm / Preset picker ── */}
      {step === 2 && (
        <div className="wiz-body">
          {startFrom === 'layout' ? (
            <>
              <p className="wiz-subtitle">
                Choose a <strong>{selectedMode.label}</strong> preset
              </p>
              <div className="wiz-layout-grid">
                {presetsForMode.map((preset) => {
                  const active = (selectedPreset ?? presetsForMode[0]).id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className={`wiz-layout-card selectable-card ${active ? 'selectable-card--active' : ''}`}
                      onClick={() => setSelectedPreset(preset)}
                    >
                      {active && <CheckOutlined className="selectable-card__check" />}
                      <div className="wiz-layout-preview">{preset.preview}</div>
                      <div className="wiz-layout-label">{preset.label}</div>
                      <div className="wiz-layout-desc">{preset.description}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : startFrom === 'starter' && selectedStarter ? (
            <div className="wiz-confirm">
              <p className="wiz-subtitle">You're about to create a dashboard from:</p>
              <div className="wiz-confirm-name"><RocketOutlined /> {selectedStarter.name}</div>
              <p className="wiz-confirm-meta">
                {selectedStarter.items.length} component(s) ·
                Layout: <Tag>{selectedMode.id}</Tag> ·
                {STARTER_CATEGORY_LABELS[selectedStarter.category]}
              </p>
              {layoutChanged && (
                <Alert
                  type="info"
                  showIcon
                  icon={<SwapOutlined />}
                  message={`Items will be rearranged from ${sourceLayout} to ${selectedMode.id} layout.`}
                  style={{ marginTop: 8 }}
                />
              )}
              <p className="wiz-confirm-desc">{selectedStarter.description}</p>
            </div>
          ) : (
            <div className="wiz-confirm">
              <p className="wiz-subtitle">You're about to create a dashboard from:</p>
              <div className="wiz-confirm-name"><FileOutlined /> {selectedTemplate?.name ?? '—'}</div>
              <p className="wiz-confirm-meta">
                {selectedTemplate?.items.length ?? 0} chart(s) ·
                Layout: <Tag>{selectedMode.id}</Tag>
              </p>
              {layoutChanged && (
                <Alert
                  type="info"
                  showIcon
                  icon={<SwapOutlined />}
                  message={`Items will be rearranged from ${sourceLayout} to ${selectedMode.id} layout.`}
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
