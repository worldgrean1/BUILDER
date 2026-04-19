import { useState } from 'react';
import { ChevronRight, ChevronDown, Star, Square, Grid3x3 } from 'lucide-react';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface TreeNode {
  id: string;
  label: string;
  tag?: string;
  type?: 'folder' | 'section' | 'item' | 'root';
  active?: boolean;
  selected?: boolean;
  children?: TreeNode[];
}

const treeData: TreeNode[] = [
  {
    id: 'root',
    label: 'ROOT ARCHITECTURE',
    type: 'root',
    children: [
      {
        id: 'hud',
        label: 'HUD COMPONENTS',
        type: 'folder',
        children: [
          { id: 'ticker', label: 'CLIENT TICKER', tag: 'TICK_S1', type: 'item' },
          { id: 'ruler', label: 'DEPTH RULER', tag: 'RUL_R2', type: 'item' },
          { id: 'logo', label: 'LOGO MORPH', tag: 'MORPH_R2', type: 'item' },
        ],
      },
      {
        id: 'runtime',
        label: 'RUNTIME SECTIONS',
        type: 'folder',
        children: [
          {
            id: 's01',
            label: '01 INTELLIGENCE',
            type: 'section',
            active: true,
            children: [
              { id: 's01-hero', label: 'HERO CONTENT', tag: 'MEDIA', type: 'item' },
              { id: 's01-titles', label: 'VERTICAL TITLES', tag: 'TYPE', type: 'item', selected: true },
            ],
          },
          { id: 's02', label: '02 PRECISION', type: 'section' },
          { id: 's03', label: '03 FUEL', type: 'section' },
          { id: 's04', label: '04 PLATFORM', type: 'section' },
          { id: 's05', label: '05 CAPABILITIES', type: 'section' },
          { id: 's06', label: '06 SOLUTIONS', type: 'section' },
          { id: 's07', label: '07 CAN / OBD', type: 'section' },
          { id: 's08', label: '08 AI + IOT', type: 'section' },
          { id: 's09', label: '09 VISION', type: 'section' },
          { id: 's10', label: '10 CONNECT', type: 'section' },
        ],
      },
    ],
  },
];

interface TreeItemProps {
  node: TreeNode;
  depth?: number;
}

const TreeItem = ({ node, depth = 0 }: TreeItemProps) => {
  const [open, setOpen] = useState(
    node.type === 'root' || node.type === 'folder' || node.active
  );
  const hasChildren = node.children && node.children.length > 0;

  const indent = depth * 12;

  const getIcon = () => {
    if (node.type === 'root' || node.type === 'folder') return <Grid3x3 size={11} className="text-text-muted flex-shrink-0" />;
    if (node.type === 'section') return <Square size={10} className="text-text-muted flex-shrink-0" />;
    return <Star size={10} className={`flex-shrink-0 ${node.selected ? 'text-brand fill-brand' : 'text-text-disabled'}`} />;
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
        {node.tag && (
          <span className="ui-tree-meta ml-1 flex-shrink-0">{node.tag}</span>
        )}
      </div>
      {open && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const NavigationTree = () => (
  <div className="ui-panel-shell w-full flex-shrink-0">
    <div className="ui-tree-header">
      <span className="ui-tree-header-label">Navigation Layers</span>
    </div>
    <div className="flex-1 overflow-y-auto py-1">
      {treeData.map((node) => (
        <TreeItem key={node.id} node={node} depth={0} />
      ))}
    </div>
  </div>
);

export default NavigationTree;
