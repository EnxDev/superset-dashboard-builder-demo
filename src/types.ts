// Re-export all shared types from their source modules.
// Import from '@/types' (or '../types') instead of reaching into store/data files.

export type { CanvasItem, LayoutMode, Template, TemplateProperties } from './store/templateStore';
export type { ComponentNode } from './data/treeData';
