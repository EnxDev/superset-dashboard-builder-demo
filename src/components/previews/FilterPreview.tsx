import { DatePicker, Select, Tag, Space } from 'antd';

const { RangePicker } = DatePicker;

export default function FilterPreview() {
  return (
    <div style={{ width: '100%', height: '100%', padding: '8px 10px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
      <RangePicker size="small" style={{ width: '100%' }} />
      <Select
        size="small"
        mode="multiple"
        placeholder="Select regions"
        defaultValue={['North', 'East']}
        options={['North', 'South', 'East', 'West'].map((r) => ({ label: r, value: r }))}
        style={{ width: '100%' }}
      />
      <Space size={4} wrap>
        <Tag color="blue">Active</Tag>
        <Tag color="green">North</Tag>
        <Tag color="orange">Q1 2024</Tag>
      </Space>
    </div>
  );
}
