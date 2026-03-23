import { Table } from 'antd';

const columns = [
  { title: 'Product', dataIndex: 'product', key: 'product', ellipsis: true },
  { title: 'Region', dataIndex: 'region', key: 'region' },
  { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', align: 'right' as const },
  { title: 'Growth', dataIndex: 'growth', key: 'growth', align: 'right' as const,
    render: (v: string) => <span style={{ color: v.startsWith('+') ? '#59B578' : '#EF4444' }}>{v}</span>,
  },
];

const data = [
  { key: '1', product: 'Widget A', region: 'North', revenue: '$12,400', growth: '+12.3%' },
  { key: '2', product: 'Widget B', region: 'South', revenue: '$8,200', growth: '-3.1%' },
  { key: '3', product: 'Service X', region: 'East', revenue: '$24,800', growth: '+28.5%' },
  { key: '4', product: 'Service Y', region: 'West', revenue: '$6,100', growth: '+5.7%' },
  { key: '5', product: 'Bundle Pro', region: 'Central', revenue: '$18,900', growth: '+15.2%' },
];

export default function TablePreview() {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <Table
        columns={columns}
        dataSource={data}
        size="small"
        pagination={false}
        style={{ fontSize: 11 }}
      />
    </div>
  );
}
