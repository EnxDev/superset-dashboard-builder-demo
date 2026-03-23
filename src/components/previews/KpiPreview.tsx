import { Statistic, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

export default function KpiPreview() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '8px 12px' }}>
      <Row gutter={16} style={{ width: '100%' }}>
        <Col span={8}>
          <Statistic
            title="Users"
            value={24813}
            valueStyle={{ fontSize: 20, color: '#20A7C9' }}
            prefix={<ArrowUpOutlined style={{ fontSize: 14 }} />}
            suffix={<span style={{ fontSize: 11, color: '#59B578' }}>+12.4%</span>}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Revenue"
            value={89240}
            precision={0}
            valueStyle={{ fontSize: 20, color: '#20A7C9' }}
            prefix="$"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Churn"
            value={2.3}
            precision={1}
            valueStyle={{ fontSize: 20, color: '#EF4444' }}
            prefix={<ArrowDownOutlined style={{ fontSize: 14 }} />}
            suffix="%"
          />
        </Col>
      </Row>
    </div>
  );
}
