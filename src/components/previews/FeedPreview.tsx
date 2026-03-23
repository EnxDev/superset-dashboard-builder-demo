import { Timeline } from 'antd';

const items = [
  { children: 'User A liked a chart', color: '#20A7C9' },
  { children: 'Dashboard updated by Bob', color: '#59B578' },
  { children: 'New comment on "Revenue"', color: '#FFA94D' },
  { children: 'Report exported', color: '#20A7C9' },
];

export default function FeedPreview() {
  return (
    <div style={{ width: '100%', height: '100%', padding: '10px 12px', overflow: 'auto' }}>
      <Timeline items={items} style={{ fontSize: 11 }} />
    </div>
  );
}
