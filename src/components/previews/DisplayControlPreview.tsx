import { Select, DatePicker, InputNumber } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const SAMPLE_VALUES: Record<string, Record<string, string[]>> = {
  sales: {
    category: ['Electronics', 'Clothing', 'Food & Beverage', 'Home & Garden', 'Sports', 'Books'],
    region: ['North', 'South', 'East', 'West', 'Central'],
    status: ['Active', 'Pending', 'Completed', 'Cancelled'],
  },
  users: {
    username: ['admin', 'john.doe', 'jane.smith', 'bob.wilson'],
    role: ['Admin', 'Editor', 'Viewer', 'Analyst'],
  },
  events: {
    event_type: ['Click', 'View', 'Purchase', 'Signup', 'Login'],
    source: ['Web', 'Mobile', 'API', 'Email'],
  },
  revenue: {
    country: ['US', 'UK', 'DE', 'FR', 'JP', 'BR', 'IN'],
    product_line: ['SaaS', 'Enterprise', 'Startup', 'Personal'],
    country_name: ['United States', 'China', 'India', 'Brazil', 'Germany'],
  },
};

const TIME_GRAINS = [
  { label: 'Hour', value: 'PT1H' },
  { label: 'Day', value: 'P1D' },
  { label: 'Week', value: 'P1W' },
  { label: 'Month', value: 'P1M' },
  { label: 'Quarter', value: 'P3M' },
  { label: 'Year', value: 'P1Y' },
];

interface Props {
  controlType?: string;
  dataset?: string;
  column?: string;
  multiSelect?: boolean;
  searchEnabled?: boolean;
  controlLabel?: string;
}

export default function DisplayControlPreview({
  controlType = 'value',
  dataset = 'sales',
  column = 'category',
  multiSelect = true,
  searchEnabled = false,
  controlLabel,
}: Props) {
  const stopProp = {
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
  };

  const values = SAMPLE_VALUES[dataset]?.[column] ?? [];

  let control: React.ReactNode;

  switch (controlType) {
    case 'range':
      control = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} {...stopProp}>
          <InputNumber size="small" placeholder="Min" style={{ flex: 1 }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>–</span>
          <InputNumber size="small" placeholder="Max" style={{ flex: 1 }} />
        </div>
      );
      break;
    case 'time':
      control = <RangePicker size="small" style={{ width: '100%' }} {...stopProp} />;
      break;
    case 'timegrain':
      control = (
        <Select
          size="small"
          placeholder="Select time grain..."
          options={TIME_GRAINS}
          defaultValue="P1D"
          style={{ width: '100%' }}
          {...stopProp}
        />
      );
      break;
    case 'timecolumn': {
      const cols = Object.keys(SAMPLE_VALUES[dataset] ?? {});
      control = (
        <Select
          size="small"
          placeholder="Select time column..."
          options={cols.map((c) => ({ label: c, value: c }))}
          style={{ width: '100%' }}
          {...stopProp}
        />
      );
      break;
    }
    default:
      control = (
        <Select
          size="small"
          mode={multiSelect ? 'multiple' : undefined}
          placeholder={`Select ${controlLabel || column || 'value'}...`}
          options={values.map((v) => ({ label: v, value: v }))}
          style={{ width: '100%' }}
          maxTagCount={2}
          allowClear
          showSearch={searchEnabled}
          suffixIcon={searchEnabled ? <SearchOutlined /> : undefined}
          {...stopProp}
        />
      );
  }

  return (
    <div className="display-control-preview">
      {controlLabel && <div className="display-control-preview__label">{controlLabel}</div>}
      {control}
    </div>
  );
}
