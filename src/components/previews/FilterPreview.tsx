import { Tag } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const FILTER_TYPE_LABELS: Record<string, string> = {
  value: 'Value',
  range: 'Range',
  time: 'Time',
  timegrain: 'Time Grain',
  timecolumn: 'Time Column',
};

export default function FilterPreview() {
  return (
    <div className="filter-info-preview">
      <FilterOutlined className="filter-info-preview__icon" />
      <div className="filter-info-preview__details">
        <span className="filter-info-preview__label">Filter</span>
        <div className="filter-info-preview__tags">
          <Tag color="blue">{FILTER_TYPE_LABELS.value}</Tag>
          <Tag>Global scope</Tag>
        </div>
      </div>
    </div>
  );
}
