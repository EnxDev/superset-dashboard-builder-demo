import { Alert, Space } from 'antd';

export default function AlertPreview() {
  return (
    <div style={{ width: '100%', height: '100%', padding: '6px 8px', overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Alert message="Data saved successfully" type="success" showIcon style={{ fontSize: 11 }} />
        <Alert message="Approaching quota limit" type="warning" showIcon style={{ fontSize: 11 }} />
        <Alert message="Connection failed" type="error" showIcon style={{ fontSize: 11 }} />
      </Space>
    </div>
  );
}
