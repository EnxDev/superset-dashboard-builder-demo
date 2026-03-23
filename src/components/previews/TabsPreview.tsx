import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useMemo } from 'react';

interface Props {
  config?: Record<string, unknown>;
}

export default function TabsPreview({ config = {} }: Props) {
  const position = (config.tabPosition as TabsProps['tabPosition']) ?? 'top';
  const count = Math.max(1, Math.min(Number(config.tabCount) || 2, 10));

  const items: TabsProps['items'] = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: String(i + 1),
        label: `Tab ${i + 1}`,
        children: (
          <div style={{ padding: '4px 0', fontSize: 11, color: 'var(--color-text-muted)' }}>
            Content for Tab {i + 1}
          </div>
        ),
      })),
    [count],
  );

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Tabs
        defaultActiveKey="1"
        tabPosition={position}
        size="small"
        items={items}
        style={{ height: '100%' }}
      />
    </div>
  );
}
