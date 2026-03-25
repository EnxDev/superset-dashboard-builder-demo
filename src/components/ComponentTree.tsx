import { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react';
import { Tree, Input } from 'antd';
import { HolderOutlined, DeleteOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { useDraggable } from '@dnd-kit/core';
import type { DataNode } from '@rc-component/tree/lib/interface';
import { type ComponentNode } from '../data/treeData';
import './ComponentTree.css';

const { Search } = Input;

// ── Pure helpers (no React, stable references) ─────────────────────────────────

function filterTree(nodes: ComponentNode[], query: string): ComponentNode[] {
  if (!query) return nodes;
  const q = query.toLowerCase();
  return nodes.reduce<ComponentNode[]>((acc, node) => {
    if (node.children) {
      const filteredChildren = filterTree(node.children, q);
      if (filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
    } else if (node.title.toLowerCase().includes(q)) {
      acc.push(node);
    }
    return acc;
  }, []);
}

interface DataNodeWithDepth extends DataNode {
  depth: number;
}

function buildAntdTree(nodes: ComponentNode[], depth = 0): DataNodeWithDepth[] {
  return nodes.map((node) => ({
    key: node.key,
    title: node.title,
    depth,
    isLeaf: !node.children || node.children.length === 0,
    children: node.children ? buildAntdTree(node.children, depth + 1) : undefined,
  }));
}

function collectAllKeys(nodes: ComponentNode[]): string[] {
  return nodes.flatMap((n) => [n.key, ...(n.children ? collectAllKeys(n.children) : [])]);
}

function collectChildKeys(node: ComponentNode): string[] {
  if (!node.children) return [];
  return node.children.flatMap((c) => [c.key, ...collectChildKeys(c)]);
}

// ── Leaf node (memoized — only re-renders when its own props change) ───────────

interface LeafNodeProps {
  title: string;
  nodeKey: string;
  showDelete?: boolean;
  onDelete?: (key: string) => void;
}

const LeafNode = memo(function LeafNode({ title, nodeKey, showDelete, onDelete }: LeafNodeProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tree-${nodeKey}`,
    data: { source: 'tree', key: nodeKey, title } as const,
  });

  return (
    <div
      ref={setNodeRef}
      className={`leaf-node ${isDragging ? 'leaf-node--dragging' : ''}`}
      {...listeners}
      {...attributes}
      aria-label={`Drag ${title} component`}
    >
      <HolderOutlined className="drag-icon" />
      <span className="leaf-label">{title}</span>
      {showDelete && (
        <DeleteOutlined
          className="delete-icon"
          onClick={(e) => { e.stopPropagation(); onDelete?.(nodeKey); }}
        />
      )}
    </div>
  );
});

// ── Main tree ──────────────────────────────────────────────────────────────────

interface ComponentTreeProps {
  data: ComponentNode[];
  showDelete?: boolean;
  onDelete?: (key: string) => void;
  positionPicker?: React.ReactNode;
}

export default function ComponentTree({ data, showDelete, onDelete, positionPicker }: ComponentTreeProps) {
  const [search, setSearch] = useState('');
  const [treeHeight, setTreeHeight] = useState(400);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const treeWrapRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<any>(null);

  // Top-level categories for quick-jump chips
  const categories = useMemo(() => data.map((n) => ({ key: n.key, title: n.title })), [data]);

  // Measure the available height for the virtual list
  useEffect(() => {
    const el = treeWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setTreeHeight(Math.floor(entry.contentRect.height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pre-compute all keys once when data changes (not on every render)
  const allKeys = useMemo(() => collectAllKeys(data), [data]);

  // Default: only the first top-level node expanded
  const [expandedKeys, setExpandedKeys] = useState<string[]>(() =>
    data.length > 0 ? [data[0].key] : []
  );

  // Memoize filtered + transformed tree — only recomputes when data or search change
  const antdData = useMemo(() => {
    const filtered = filterTree(data, search);
    return buildAntdTree(filtered);
  }, [data, search]);

  // Stable titleRender — useCallback so antd Tree doesn't see a new function each render
  const titleRender = useCallback((node: DataNode) => {
    const n = node as DataNodeWithDepth;
    if (n.isLeaf) {
      return <LeafNode title={n.title as string} nodeKey={n.key as string} showDelete={showDelete} onDelete={onDelete} />;
    }
    return <span className="group-title">{n.title as string}</span>;
  }, [showDelete, onDelete]);

  const allExpanded = expandedKeys.length >= allKeys.length;

  const toggleExpandAll = useCallback(() => {
    if (allExpanded) {
      setExpandedKeys(data.length > 0 ? [data[0].key] : []);
    } else {
      setExpandedKeys(allKeys);
    }
    setActiveChip(null);
  }, [allExpanded, allKeys, data]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setActiveChip(null);
    if (val) {
      setExpandedKeys(allKeys);
    }
  }, [allKeys]);

  const handleExpand = useCallback((keys: React.Key[]) => {
    setExpandedKeys(keys as string[]);
  }, []);

  const handleChipClick = useCallback((key: string) => {
    setSearch('');
    const isAlreadyActive = activeChip === key;

    if (isAlreadyActive) {
      // Deselect — reset to first node expanded
      setActiveChip(null);
      setExpandedKeys(data.length > 0 ? [data[0].key] : []);
      return;
    }

    setActiveChip(key);

    // Expand only this category and its children
    const node = data.find((n) => n.key === key);
    if (node) {
      const childKeys = collectChildKeys(node);
      setExpandedKeys([key, ...childKeys]);
    }

    // Scroll to this key after a tick (let the tree re-render)
    requestAnimationFrame(() => {
      treeRef.current?.scrollTo?.({ key, align: 'top' });
    });
  }, [activeChip, data, allKeys]);

  const showChips = categories.length > 1;

  return (
    <div className="component-tree-panel">
      {/* Quick-jump category chips */}
      {showChips && (
        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`category-chip${activeChip === cat.key ? ' category-chip--active' : ''}`}
              onClick={() => handleChipClick(cat.key)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      )}

      <div className="tree-search-row">
        <Search
          placeholder="Search components..."
          value={search}
          onChange={handleSearch}
          className="tree-search"
          allowClear
        />
        <button
          className="expand-all-btn"
          onClick={toggleExpandAll}
          title={allExpanded ? 'Collapse all' : 'Expand all'}
          aria-label={allExpanded ? 'Collapse all' : 'Expand all'}
        >
          {allExpanded ? <DownOutlined /> : <RightOutlined />}
        </button>
        {positionPicker}
      </div>
      <div ref={treeWrapRef} className="tree-virtual-wrap">
        <Tree
          ref={treeRef}
          treeData={antdData}
          titleRender={titleRender}
          expandedKeys={expandedKeys}
          onExpand={handleExpand}
          selectable={false}
          blockNode
          showLine={{ showLeafIcon: false }}
          virtual
          height={treeHeight}
          className="component-tree"
        />
      </div>
    </div>
  );
}
