import { Input, Button, Space } from 'antd';

export default function InputPreview() {
  return (
    <div style={{ width: '100%', height: '100%', padding: '8px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
      <div>
        <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Label</div>
        <Input size="small" placeholder="Enter value..." defaultValue="Hello world" />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Email</div>
        <Input size="small" placeholder="email@example.com" defaultValue="user@acme.com" />
      </div>
      <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
        <Button size="small" type="primary">Submit</Button>
      </Space>
    </div>
  );
}
