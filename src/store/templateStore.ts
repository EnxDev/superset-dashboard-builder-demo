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
