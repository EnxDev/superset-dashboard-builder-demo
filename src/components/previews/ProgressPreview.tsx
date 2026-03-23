import { Progress, Space } from 'antd';

const items = [
  { label: 'Uploads', pct: 72, color: '#20A7C9' },
  { label: 'Storage', pct: 45, color: '#59B578' },
  { label: 'API Quota', pct: 88, color: '#EF4444' },
];

export default function ProgressPreview() {
  return (
    <div style={{ width: '100%', height: '100%', padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {items.map((item) => (
          <div key={item.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span>{item.label}</span>
              <span style={{ fontWeight: 600, color: item.color }}>{item.pct}%</span>
            </div>
            <Progress percent={item.pct} showInfo={false} strokeColor={item.color} size="small" />
          </div>
        ))}
      </Space>
    </div>
  );
}
