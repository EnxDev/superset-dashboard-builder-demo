import { useState } from 'react';
import { Modal, Steps, Tag, Tooltip } from 'antd';
import { CheckOutlined, FileOutlined, RocketOutlined } from '@ant-design/icons';
import { loadTemplates, type CanvasItem, type LayoutMode, type Template } from '../store/templateStore';
import { LAYOUT_MODES, type LayoutModeOption } from '../data/layoutModes';
import { PRESETS_BY_MODE, type LayoutPreset } from '../data/layoutPresets';
import { resolvePreset } from '../data/presetResolver';
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
  const [selectedMode, setSelectedMode] = useState<LayoutModeOption>(LAYOUT_MODES[0]);
  const [selectedPreset, setSelectedPreset] = useState<LayoutPreset | null>(null);
  const [startFrom, setStartFrom] = useState<'layout' | 'template' | 'starter'>('layout');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedStarter, setSelectedStarter] = useState<StarterTemplate | null>(null);
  const [starterFilter, setStarterFilter] = useState<StarterCategory | 'all'>('all');

  const templates = loadTemplates();
  const presetsForMode = PRESETS_BY_MODE[selectedMode.id];

  // Filter starters by selected layout mode, then by category
  const startersForMode = STARTER_TEMPLATES.filter((s) => s.layoutMode === selectedMode.id);
  const filteredStarters = starterFilter === 'all'
    ? startersForMode
    : startersForMode.filter((s) => s.category === starterFilter);

  // Filter saved templates by selected layout mode
  const templatesForMode = templates.filter((t) => (t.layoutMode ?? 'grid') === selectedMode.id);

  const reset = () => {
    setStep(0);
    setSelectedMode(LAYOUT_MODES[0]);
    setSelectedPreset(null);
    setStartFrom('layout');
    setSelectedTemplate(null);
    setSelectedStarter(null);
    setStarterFilter('all');
  };

  const handleModeChange = (m: LayoutModeOption) => {
    setSelectedMode(m);
    setSelectedPreset(null);
    setSelectedTemplate(null);
    setSelectedStarter(null);
    setStarterFilter('all');
  };

  const handleOk = () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) { setStep(2); return; }

    // Step 2: confirm
    if (startFrom === 'starter' && selectedStarter) {
      // Deep-clone items and assign fresh IDs so each dashboard is independent
      const freshItems = selectedStarter.items.map((it) => ({
        ...it,
        id: `${it.key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }));
      onConfirm(freshItems, selectedStarter.layoutMode, selectedStarter.gridCols);
    } else if (startFrom === 'template' && selectedTemplate) {
      onConfirm([...selectedTemplate.items], selectedTemplate.layoutMode ?? 'grid', selectedTemplate.gridCols ?? 3);
    } else {
      const preset = selectedPreset ?? presetsForMode[0];
      const { w, h } = canvasSize;
      const resolved = resolvePreset(preset, selectedMode.id, w > 0 ? w : 900, h > 0 ? h : 600);
      onConfirm(resolved, selectedMode.id, preset.cols ?? 3);
    }
    reset();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else { reset(); onCancel(); }
  };

  const handleCancel = () => { reset(); onCancel(); };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) {
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
          { title: 'Layout mode' },
          { title: 'Starting point' },
          { title: 'Preset' },
        ]}
      />

      {/* ── Step 0: layout mode ── */}
      {step === 0 && (
        <div className="wiz-body">
          <p className="wiz-subtitle">Choose how your dashboard arranges charts</p>
          <div className="wiz-mode-grid">
            {LAYOUT_MODES.map((m) => (
              <div
                key={m.id}
                className={`wiz-mode-card selectable-card ${selectedMode.id === m.id ? 'selectable-card--active' : ''}`}
                onClick={() => handleModeChange(m)}
              >
                {selectedMode.id === m.id && <CheckOutlined className="selectable-card__check" />}
                <div className="wiz-mode-preview">{m.preview}</div>
                <div className="wiz-mode-label">{m.label}</div>
                <div className="wiz-mode-desc">{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 1: starting point ── */}
      {step === 1 && (
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
              className={`wiz-start-card selectable-card ${startFrom === 'starter' ? 'selectable-card--active' : ''} ${startersForMode.length === 0 ? 'selectable-card--disabled' : ''}`}
              onClick={() => startersForMode.length > 0 && setStartFrom('starter')}
            >
              {startFrom === 'starter' && <CheckOutlined className="selectable-card__check" />}
              <div className="wiz-start-icon">
                <RocketOutlined style={{ fontSize: 40, opacity: 0.6 }} />
              </div>
              <div className="wiz-start-label">From a starter template</div>
              <div className="wiz-start-desc">
                {startersForMode.length > 0
                  ? `${startersForMode.length} pre-built ${selectedMode.label} dashboard${startersForMode.length !== 1 ? 's' : ''} available.`
                  : `No starter templates for ${selectedMode.label} mode.`}
              </div>
            </div>

            <div
              className={`wiz-start-card selectable-card ${startFrom === 'template' ? 'selectable-card--active' : ''} ${templatesForMode.length === 0 ? 'selectable-card--disabled' : ''}`}
              onClick={() => templatesForMode.length > 0 && setStartFrom('template')}
            >
              {startFrom === 'template' && <CheckOutlined className="selectable-card__check" />}
              <div className="wiz-start-icon">
                <FileOutlined style={{ fontSize: 40, opacity: 0.6 }} />
              </div>
              <div className="wiz-start-label">From a saved template</div>
              <div className="wiz-start-desc">
                {templatesForMode.length === 0
                  ? `No saved ${selectedMode.label} templates yet.`
                  : `${templatesForMode.length} ${selectedMode.label} template${templatesForMode.length !== 1 ? 's' : ''} available.`}
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
                      onClick={() => setSelectedStarter(st)}
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

          {startFrom === 'template' && templatesForMode.length > 0 && (
            <div className="wiz-template-list">
              <p className="wiz-subtitle" style={{ marginTop: 16 }}>Select a {selectedMode.label} template</p>
              <div className="wiz-tpl-grid">
                {templatesForMode.map((tpl) => (
                  <Tooltip key={tpl.id} title={`${tpl.items.length} chart${tpl.items.length !== 1 ? 's' : ''} · ${tpl.layoutMode ?? 'grid'}`}>
                    <div
                      className={`wiz-tpl-card selectable-card ${selectedTemplate?.id === tpl.id ? 'selectable-card--active' : ''}`}
                      onClick={() => setSelectedTemplate(tpl)}
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

      {/* ── Step 2: preset picker (only for layout start) ── */}
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
                Layout: {selectedStarter.layoutMode} ·
                {STARTER_CATEGORY_LABELS[selectedStarter.category]}
              </p>
              <p className="wiz-confirm-desc">{selectedStarter.description}</p>
            </div>
          ) : (
            <div className="wiz-confirm">
              <p className="wiz-subtitle">You're about to create a dashboard from:</p>
              <div className="wiz-confirm-name"><FileOutlined /> {selectedTemplate?.name ?? '—'}</div>
              <p className="wiz-confirm-meta">
                {selectedTemplate?.items.length ?? 0} chart(s) ·
                Layout: {selectedTemplate?.layoutMode ?? 'grid'}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
