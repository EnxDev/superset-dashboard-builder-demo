import { useEffect } from 'react';
import { Modal, Collapse, Form, Input, Select } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import type { TemplateProperties } from '../store/templateStore';
import './DashboardPropertiesModal.css';

const { Panel } = Collapse;
const { TextArea } = Input;

interface Props {
  open: boolean;
  initialValues: Partial<TemplateProperties> & { name: string };
  onApply: (values: TemplateProperties) => void;
  onCancel: () => void;
}

const COLOR_SCHEMES = [
  'Superset Colors', 'Google Category 10c', 'Lyft Brand Colors',
  'Airbnb Colors', 'Preset Colors', 'Monochromatic Blue',
];

const REFRESH_OPTIONS = [
  { label: "Don't refresh", value: 0 },
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '30 minutes', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '6 hours', value: 21600 },
  { label: '24 hours', value: 86400 },
];

function SectionTitle({ label, subtitle }: { label: string; subtitle: string }) {
  return (
    <div className="dpm-section-header">
      <span className="dpm-section-title">
        {label} <CheckCircleOutlined className="dpm-check" />
      </span>
      <span className="dpm-section-sub">{subtitle}</span>
    </div>
  );
}

export default function DashboardPropertiesModal({ open, initialValues, onApply, onCancel }: Props) {
  const [form] = Form.useForm<TemplateProperties>();

  useEffect(() => {
    if (open) form.setFieldsValue(initialValues);
  }, [open, initialValues, form]);

  const handleApply = async () => {
    const values = await form.validateFields();
    onApply(values);
  };

  return (
    <Modal
      open={open}
      title="Dashboard properties"
      okText="Apply"
      cancelText="Cancel"
      onOk={handleApply}
      onCancel={onCancel}
      width={560}
      destroyOnClose
      className="dpm-modal modal-base"
    >
      <Form form={form} layout="vertical" size="small" className="dpm-form modal-form">
        <Collapse
          defaultActiveKey={['general']}
          ghost
          expandIconPosition="end"
          className="dpm-collapse"
        >
          {/* ── General information ── */}
          <Panel
            key="general"
            header={
              <SectionTitle
                label="General information"
                subtitle="Dashboard name and URL configuration"
              />
            }
          >
            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="urlSlug" label="URL Slug">
              <Input placeholder="e.g. my_dashboard" />
            </Form.Item>
          </Panel>

          {/* ── Access & ownership ── */}
          <Panel
            key="access"
            header={
              <SectionTitle
                label="Access & ownership"
                subtitle="Manage dashboard owners and access permissions"
              />
            }
          >
            <Form.Item name="owners" label="Owners">
              <Select
                mode="multiple"
                placeholder="Select owners"
                options={[
                  { label: 'Admin', value: 'admin' },
                  { label: 'Alpha', value: 'alpha' },
                  { label: 'Gamma', value: 'gamma' },
                ]}
              />
            </Form.Item>
          </Panel>

          {/* ── Styling ── */}
          <Panel
            key="styling"
            header={
              <SectionTitle
                label="Styling"
                subtitle="Configure dashboard appearance, colors, and custom CSS"
              />
            }
          >
            <Form.Item name="colorScheme" label="Color scheme">
              <Select
                options={COLOR_SCHEMES.map((s) => ({ label: s, value: s }))}
                placeholder="Select color scheme"
              />
            </Form.Item>
          </Panel>

          {/* ── Refresh settings ── */}
          <Panel
            key="refresh"
            header={
              <SectionTitle
                label="Refresh settings"
                subtitle="Configure automatic dashboard refresh"
              />
            }
          >
            <Form.Item name="refreshFrequency" label="Refresh frequency">
              <Select
                options={REFRESH_OPTIONS}
                defaultValue={0}
              />
            </Form.Item>
          </Panel>

          {/* ── Certification ── */}
          <Panel
            key="certification"
            header={
              <SectionTitle
                label="Certification"
                subtitle="Add certification details for this dashboard"
              />
            }
          >
            <Form.Item name="certifiedBy" label="Certified by">
              <Input placeholder="e.g. Data Team" />
            </Form.Item>
            <Form.Item name="certificationDetails" label="Certification details">
              <Input placeholder="e.g. Reviewed on 2024-01-01" />
            </Form.Item>
          </Panel>

          {/* ── Advanced settings ── */}
          <Panel
            key="advanced"
            header={
              <SectionTitle
                label="Advanced settings"
                subtitle="JSON metadata and advanced configuration"
              />
            }
          >
            <Form.Item name="jsonMetadata" label="JSON metadata">
              <TextArea rows={5} placeholder="{}" className="dpm-json" />
            </Form.Item>
          </Panel>
        </Collapse>
      </Form>
    </Modal>
  );
}
