import { useState } from 'react';
import { ChevronRight, ChevronDown, Square, Diamond } from 'lucide-react';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface CameraNode {
  id: string;
  label: string;
  pct?: string;
  type?: 'sequence' | 'shot' | 'keyframe';
  active?: boolean;
  selected?: boolean;
  children?: CameraNode[];
}

const cameraTree: CameraNode[] = [
  {
    id: 'timeline',
    label: 'TIMELINE SEQUENCE',
    type: 'sequence',
    children: [
      {
        id: 's1',
        label: '01 S1',
        type: 'shot',
        active: true,
        children: [
          { id: 'wide-hero', label: 'WIDE HERO POSE', pct: '0%', type: 'keyframe', selected: true },
          { id: 'slow-dolly', label: 'SLOW DOLLY FORWARD', pct: '0%', type: 'keyframe' },
          { id: 'subtle-orbit', label: 'SUBTLE ORBIT', pct: '0%', type: 'keyframe' },
          { id: 'focus-detail', label: 'FOCUS DETAIL', pct: '0%', type: 'keyframe' },
          { id: 'transition-s2', label: 'TRANSITION TO S2', pct: '0%', type: 'keyframe' },
        ],
      },
      { id: 's2', label: '02 S2', type: 'shot' },
      { id: 's3', label: '03 S3', type: 'shot' },
      { id: 's4', label: '04 S4', type: 'shot' },
      { id: 's5', label: '05 S5', type: 'shot' },
      { id: 's6', label: '06 S6', type: 'shot' },
      { id: 's7', label: '07 S7', type: 'shot' },
      { id: 's8', label: '08 S8', type: 'shot' },
      { id: 's9', label: '09 S9', type: 'shot' },
      { id: 's10', label: '10 S10', type: 'shot' },
    ],
  },
];

interface CameraTreeItemProps {
  node: CameraNode;
  depth?: number;
}

const CameraTreeItem = ({ node, depth = 0 }: CameraTreeItemProps) => {
  const [open, setOpen] = useState(node.type === 'sequence' || node.active);
  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 12;

  const getIcon = () => {
    if (node.type === 'sequence') return <Square size={10} className="text-text-muted flex-shrink-0" />;
    if (node.type === 'shot') return <Square size={9} className="text-text-muted flex-shrink-0" />;
    return <Diamond size={9} className={`flex-shrink-0 ${node.selected ? 'text-brand fill-brand' : 'text-warning'}`} />;
  };

  return (
    <div>
      <div
        className={`ui-tree-row ${node.selected ? 'ui-tree-row-selected' : ''} ${node.active ? 'ui-tree-row-active' : ''}`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          <span className="text-text-muted flex-shrink-0 w-3">
            {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </span>
        ) : (
          <span className="w-3 flex-shrink-0"></span>
        )}
        {getIcon()}
        <span className={`ui-tree-label ${node.selected ? 'text-text-primary' : node.active ? 'text-brand' : 'text-text-secondary'}`}>
          {formatUiLabel(node.label)}
        </span>
        {node.pct !== undefined && (
          <span className="ui-tree-meta ml-1 flex-shrink-0">{node.pct}</span>
        )}
      </div>
      {open && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <CameraTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const CameraNavigationTree = () => (
  <div className="ui-panel-shell w-full flex-shrink-0">
    <div className="ui-tree-header">
      <span className="ui-tree-header-label">Navigation Layers</span>
    </div>
    <div className="flex-1 overflow-y-auto py-1">
      {cameraTree.map((node) => (
        <CameraTreeItem key={node.id} node={node} depth={0} />
      ))}
    </div>
  </div>
);

export default CameraNavigationTree;
