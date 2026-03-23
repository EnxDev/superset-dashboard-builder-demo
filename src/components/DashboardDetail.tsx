import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import type { Template } from '../store/templateStore';
import DropCanvas from './DropCanvas';
import './DashboardDetail.css';

interface Props {
  template: Template;
  onBack: () => void;
  onEdit: () => void;
  hideHeader?: boolean;
}

export default function DashboardDetail({ template, onBack, onEdit, hideHeader }: Props) {
  return (
    <div className="db-detail">
      {!hideHeader && (
        <div className="db-detail__header">
          <button className="db-detail__back" onClick={onBack}>
            <ArrowLeftOutlined /> Dashboards
          </button>
          <div className="db-detail__meta">
            <span className="db-detail__name">{template.name}</span>
            <Tag className="db-detail__tag">
              {template.items.length} chart{template.items.length !== 1 ? 's' : ''}
            </Tag>
            <span className="db-detail__time">
              Last saved {new Date(template.savedAt).toLocaleString()}
            </span>
          </div>
          <button className="toolbar-btn toolbar-btn--primary db-detail__edit" onClick={onEdit}>
            <EditOutlined /> Edit
          </button>
        </div>
      )}

      <DropCanvas items={template.items} layoutMode={template.layoutMode} gridCols={template.gridCols} readOnly />
    </div>
  );
}
