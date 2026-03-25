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
  initialConfig?: Record<string, unknown>;
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
      return <Input type="color" style={{ width: '100%', height: 32, padding: 2, cursor: 'pointer' }} />;

    case 'daterange':
      return <RangePicker style={{ width: '100%' }} />;

    default:
      return <Input />;
  }
}

export default function BlockSettingsModal({
  open, nodeKey, nodeTitle, isEditing, initialConfig, onConfirm, onCancel,
}: Props) {
  const [form] = Form.useForm();
  const config = resolveSettings(nodeKey);
  const categoryLabel = getCategoryLabel(config.category);
  const layoutModeValue = Form.useWatch('layoutMode', form);
  const borderEnabledValue = Form.useWatch('borderEnabled', form);

  // Seed form: use initialConfig when editing, defaults when creating new
  useEffect(() => {
    if (open) {
      const values: Record<string, unknown> = { title: nodeTitle };
      config.fields.forEach((f) => {
        if (f.defaultValue !== undefined) values[f.key] = f.defaultValue;
      });
      // Overlay saved config values when editing
      if (isEditing && initialConfig) {
        Object.entries(initialConfig).forEach(([k, v]) => {
          // Skip internal flags
          if (!k.startsWith('_')) values[k] = v;
        });
      }
      form.setFieldsValue(values);
    }
  }, [open, nodeKey, nodeTitle, isEditing, initialConfig, config, form]);

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
            hidden={
              (field.key === 'gridCols' && !['grid', 'mosaic'].includes(layoutModeValue ?? config.fields.find((f) => f.key === 'layoutMode')?.defaultValue ?? ''))
              || (['borderColor', 'borderWidth', 'borderRadius', 'borderStyle'].includes(field.key) && !borderEnabledValue)
            }
          >
            {renderField(field)}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
