import { useEffect } from 'react';
import {
  Modal, Form, Input, InputNumber, Select, Switch, DatePicker,
} from 'antd';
import { resolveSettings, getCategoryLabel, type SettingsField } from '../data/blockSettings';
import './BlockSettingsModal.css';

const { RangePicker } = DatePicker;

interface Props {
  open: boolean;
  nodeKey: string;
  nodeTitle: string;
  isEditing?: boolean;
  onConfirm: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

function renderField(field: SettingsField) {
  switch (field.type) {
    case 'text':
      return <Input placeholder={field.placeholder} />;

    case 'number':
      return (
        <InputNumber
          min={field.min}
          max={field.max}
          style={{ width: '100%' }}
        />
      );

    case 'select':
      return (
        <Select placeholder={field.placeholder} options={field.options} />
      );

    case 'multiselect':
      return (
        <Select
          mode="multiple"
          placeholder={field.placeholder}
          options={field.options}
        />
      );

    case 'toggle':
      return <Switch />;

    case 'color':
      return <Input type="color" style={{ width: 48, padding: 2 }} />;

    case 'daterange':
      return <RangePicker style={{ width: '100%' }} />;

    default:
      return <Input />;
  }
}

export default function BlockSettingsModal({
  open, nodeKey, nodeTitle, isEditing, onConfirm, onCancel,
}: Props) {
  const [form] = Form.useForm();
  const config = resolveSettings(nodeKey);
  const categoryLabel = getCategoryLabel(config.category);

  // Seed defaults whenever a new chart is being configured
  useEffect(() => {
    if (open) {
      const defaults: Record<string, unknown> = { title: nodeTitle };
      config.fields.forEach((f) => {
        if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
      });
      form.setFieldsValue(defaults);
    }
  }, [open, nodeKey, nodeTitle, config, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onConfirm(values);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={
        <div className="esm-title">
          <span className="esm-title__badge">{config.label}</span>
          <span className="esm-title__text">{isEditing ? `Edit ${categoryLabel}` : `Configure ${categoryLabel}`}</span>
        </div>
      }
      okText={isEditing ? 'Save' : `Add ${categoryLabel}`}
      cancelText="Cancel"
      onOk={handleOk}
      onCancel={handleCancel}
      width={520}
      destroyOnClose
      className="esm-modal modal-base"
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
        className="esm-form modal-form"
      >
        {config.fields.map((field) => (
          <Form.Item
            key={field.key}
            name={field.key}
            label={field.label}
            valuePropName={field.type === 'toggle' ? 'checked' : 'value'}
          >
            {renderField(field)}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
