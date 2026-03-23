import { useRef, useState, useCallback } from "react";
import {
  LayoutOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import ComponentTree from "./ComponentTree";
import { treeData, libraryData } from "../data/treeData";
import { LEFT_PANEL_MIN_W, LEFT_PANEL_MAX_W } from "../constants";
import "./LeftPanel.css";

export type PanelPosition = 'left' | 'right' | 'top' | 'bottom';

const collections = [
  {
    key: "blocks",
    label: "Blocks",
    description: "Layout elements",
    icon: <LayoutOutlined />,
    data: treeData,
  },
  {
    key: "library",
    label: "Library",
    description: "Charts, filters & widgets",
    icon: <AppstoreOutlined />,
    data: libraryData,
    showDelete: true,
  },
] as const;

interface Props {
  position?: PanelPosition;
  onPositionChange?: (pos: PanelPosition) => void;
}

export default function LeftPanel({ position = 'left', onPositionChange }: Props) {
  const [size, setSize] = useState(400);
  const [activeKey, setActiveKey] = useState<string>("blocks");
  const dragging = useRef(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const active = collections.find((c) => c.key === activeKey) ?? collections[0];

  const isHorizontal = position === 'left' || position === 'right';
  const minSize = isHorizontal ? LEFT_PANEL_MIN_W : 150;
  const maxSize = isHorizontal ? LEFT_PANEL_MAX_W : 400;

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      startPos.current = isHorizontal ? e.clientX : e.clientY;
      startSize.current = size;
      document.body.style.cursor = isHorizontal ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const current = isHorizontal ? ev.clientX : ev.clientY;
        const multiplier = (position === 'left' || position === 'top') ? 1 : -1;
        const delta = (current - startPos.current) * multiplier;
        setSize(Math.min(maxSize, Math.max(minSize, startSize.current + delta)));
      };
      const onUp = () => {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [size, isHorizontal, position, minSize, maxSize],
  );

  const panelStyle: React.CSSProperties = isHorizontal
    ? { width: size }
    : { height: size };

  return (
    <div
      className={`left-panel left-panel--${position}`}
      style={panelStyle}
    >
      <div className="collections-label">Collections</div>

      {/* Collection selector */}
      <div className={`collection-selector ${!isHorizontal ? 'collection-selector--horizontal' : ''}`}>
        {collections.map((col) => (
          <button
            key={col.key}
            className={`collection-card${activeKey === col.key ? " collection-card--active" : ""}`}
            onClick={() => setActiveKey(col.key)}
          >
            <span className="collection-card__icon">{col.icon}</span>
            <span className="collection-card__text">
              <span className="collection-card__label">{col.label}</span>
              <span className="collection-card__desc">{col.description}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Tree content */}
      <div className="collection-content">
        <ComponentTree
          key={active.key}
          data={active.data as any}
          showDelete={"showDelete" in active && !!active.showDelete}
          onDelete={(key) => console.log("delete", key)}
          positionPicker={onPositionChange ? (
            <PositionPicker current={position} onChange={onPositionChange} />
          ) : undefined}
        />
      </div>

      <div
        className={`resize-handle resize-handle--${position}`}
        onMouseDown={onMouseDown}
      />
    </div>
  );
}

// ── Position Picker ──────────────────────────────────────────────────────────

function PositionPicker({
  current,
  onChange,
}: {
  current: PanelPosition;
  onChange: (pos: PanelPosition) => void;
}) {
  const positions: { key: PanelPosition; row: number; col: number }[] = [
    { key: 'top',    row: 0, col: 1 },
    { key: 'left',   row: 1, col: 0 },
    { key: 'right',  row: 1, col: 2 },
    { key: 'bottom', row: 2, col: 1 },
  ];

  return (
    <div className="position-picker" title="Panel position">
      <div className="position-picker__grid">
        {positions.map(({ key, row, col }) => (
          <button
            key={key}
            className={`position-picker__cell ${current === key ? 'position-picker__cell--active' : ''}`}
            style={{ gridRow: row + 1, gridColumn: col + 1 }}
            onClick={() => onChange(key)}
            title={`Move panel to ${key}`}
          />
        ))}
        {/* Center dot (represents canvas) */}
        <div className="position-picker__center" style={{ gridRow: 2, gridColumn: 2 }} />
      </div>
    </div>
  );
}
