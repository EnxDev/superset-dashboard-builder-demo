# Superset Dashboard Page Builder — Agent Architecture

## Overview

A React + TypeScript dashboard page builder inspired by Apache Superset. Users compose dashboards by dragging components from a categorized tree panel onto a canvas that supports multiple layout modes (Grid, Rows, Free XY, Mosaic). Dashboards can be saved, opened, edited, and configured through a properties modal.

**Stack:** React 18 · TypeScript · Ant Design 5 · Vite 5

---

## Project Structure

```
src/
├── App.tsx                        # Root — routing (list/detail/editor), theme, toolbar, modals
├── App.css                        # Theme tokens (CSS vars), layout, toolbar, header
├── main.tsx                       # Entry point — mounts <App> with utilities.css
├── constants.ts                   # Shared magic numbers (card sizes, panel widths, z-index)
├── types.ts                       # Barrel re-export for all shared types
│
├── store/
│   └── templateStore.ts           # localStorage CRUD for templates, type definitions
│
├── data/
│   ├── treeData.ts                # Component tree structure (All Elements + Saved Elements)
│   ├── blockSettings.ts           # Per-element-type settings form definitions
│   ├── layoutModes.tsx            # Layout mode options (Grid/Rows/XY/Mosaic) with SVG previews
│   ├── layoutPresets.tsx          # Preset slot definitions per layout mode
│   └── presetResolver.ts         # Converts fractional preset slots → pixel CanvasItems
│
├── styles/
│   └── utilities.css              # Shared CSS: modal-base, selectable-card, u-truncate, etc.
│
├── components/
│   ├── LeftPanel.tsx / .css       # Resizable sidebar with tabs (All Elements / Saved Elements)
│   ├── ComponentTree.tsx / .css   # Virtualized antd Tree with search, drag, memoization
│   ├── DropCanvas.tsx / .css      # Drop zone — delegates to layout-specific renderers
│   ├── CanvasCard.tsx             # Single card on canvas (header + preview + actions)
│   ├── CardPreview.tsx            # Routes element key → visual preview component
│   ├── DashboardList.tsx / .css   # Grid of saved dashboards with search/delete
│   ├── DashboardDetail.tsx / .css # Read-only dashboard view with toolbar
│   ├── NewDashboardWizard.tsx / .css  # 3-step wizard: layout mode → start point → preset
│   ├── BlockSettingsModal.tsx / .css   # Per-element config modal (type-aware form fields)
│   ├── DashboardPropertiesModal.tsx / .css # Dashboard-level properties (Superset-style collapse)
│   │
│   ├── previews/                  # SVG chart/component previews (14 files)
│   │   ├── index.ts               # Barrel export
│   │   ├── PiePreview.tsx
│   │   ├── BarPreview.tsx
│   │   ├── LinePreview.tsx
│   │   ├── ScatterPreview.tsx
│   │   ├── TablePreview.tsx
│   │   ├── KpiPreview.tsx
│   │   ├── FilterPreview.tsx
│   │   ├── FeedPreview.tsx
│   │   ├── InputPreview.tsx
│   │   ├── ProgressPreview.tsx
│   │   ├── AlertPreview.tsx
│   │   ├── AiPreview.tsx
│   │   ├── MapPreview.tsx
│   │   └── GenericPreview.tsx
│   │
│   └── renderers/                 # Layout-specific canvas renderers
│       ├── index.ts               # Barrel export
│       ├── XYCanvas.tsx           # Free positioning with pointer-based drag-to-move
│       ├── GridCanvas.tsx         # CSS grid with col/row/span placement
│       ├── RowsCanvas.tsx         # Full-width stacked rows
│       └── MosaicCanvas.tsx       # CSS columns masonry layout
```

---

## Data Flow

```
treeData ──→ ComponentTree (search/filter/virtualize)
                │
                │  HTML5 drag: componentKey + componentTitle
                ▼
          DropCanvas (onDrop)
                │
                │  Opens BlockSettingsModal for config
                ▼
          App.items[] state (CanvasItem[])
                │
                ├──→ Layout renderer (XY/Grid/Rows/Mosaic)
                │        └── CanvasCard → CardPreview → SVG preview
                │
                ├──→ Save → templateStore → localStorage
                │
                └──→ Reset / Undo (history stack)
```

---

## Key Concepts

### Views (App.tsx state machine)
| View | Shows | Left Panel |
|------|-------|------------|
| `list` | DashboardList — grid of saved dashboards | Hidden |
| `detail` | DashboardDetail — read-only view + toolbar | Hidden |
| `editor` | DropCanvas + toolbar (undo/save/reset/clear) | Visible |

### Layout Modes (CanvasItem placement)
| Mode | Positioning | CSS | Key fields |
|------|------------|-----|------------|
| `grid` | Column/row slots | `display: grid` | `col`, `row`, `colSpan`, `rowSpan` |
| `rows` | Vertical stack | `flex-direction: column` | `row` |
| `xy` | Absolute pixel coords | `position: absolute` | `x`, `y`, `w`, `h` |
| `mosaic` | CSS columns masonry | `columns: N` | `h` |

### Theme System
- CSS custom properties in `:root` / `[data-theme="dark"]` (App.css)
- Ant Design `ConfigProvider` with Superset token overrides
- `localStorage('theme')` persistence
- Light tokens: white surfaces, Superset blue primary
- Dark tokens: antd dark algorithm base palette

### Drag & Drop
- **Panel → Canvas:** HTML5 `draggable` + `dataTransfer` on `LeafNode`
- **XY card move:** Pointer events (`pointerdown/move/up`) with `setPointerCapture`
- These two systems are independent and don't conflict

### Performance (ComponentTree)
- `useMemo` on filter + tree build
- `memo(LeafNode)` — skips re-renders
- `useCallback` on `titleRender`, `handleSearch`, `handleExpand`
- `virtual` + dynamic `height` via `ResizeObserver` — only ~20 DOM nodes

### Template Storage
- `localStorage` key `superset_pb_templates` → `Template[]`
- Each template: `{ id, name, savedAt, items, layoutMode, gridCols, properties }`
- Save = upsert by ID, Save As = new ID
- Reset = restore `activeTemplate.items`

---

## Shared Patterns

### CSS Utilities (styles/utilities.css)
| Class | Purpose |
|-------|---------|
| `modal-base` | Consistent modal header/body/footer padding + borders |
| `modal-form` | Standard form label size/color in modals |
| `selectable-card` | Bordered card with hover/active ring (wizard, presets) |
| `selectable-card--active` | Primary border + ring |
| `selectable-card__check` | Absolute top-right check icon |
| `u-truncate` | `nowrap` + `overflow: hidden` + `text-overflow: ellipsis` |
| `icon-action-btn` | Transparent button with icon, hover to primary |
| `svg-preview` | `display: block` for SVG chart previews |

### Constants (constants.ts)
| Constant | Value | Used by |
|----------|-------|---------|
| `DEFAULT_CARD_W/H` | 220 / 180 | DropCanvas, renderers |
| `LAYOUT_GAP` | 8 | presetResolver |
| `LEFT_PANEL_MIN/MAX_W` | 180 / 480 | LeftPanel |
| `CANVAS_FALLBACK_W/H` | 900 / 600 | DropCanvas imperative handle |
| `MAX_UNDO_STEPS` | 50 | App.tsx history |
| `BRAND_NAME` | 'SUPERSET' | App header |
| `DEFAULT_TEMPLATE_NAME` | 'My Dashboard' | Save modal |

---

## Accessibility

- All 14 preview SVGs have `role="img"` + descriptive `aria-label`
- Tree leaf nodes: `tabIndex={0}`, `role="button"`, `aria-label="Drag {title} component"`
- Icon-only toolbar buttons: `aria-label` (theme toggle, undo, more-options)

---

## Commands

```bash
npm run dev     # Start Vite dev server
npm run build   # TypeScript check + production build
npx tsc --noEmit  # Type check only
```
