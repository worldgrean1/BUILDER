import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Circle } from 'lucide-react';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface SceneNode {
  id: string;
  label: string;
  tag?: string;
  type?: 'root' | 'folder' | 'item';
  active?: boolean;
  selected?: boolean;
  children?: SceneNode[];
}

const sceneTree: SceneNode[] = [
  {
    id: 'master-core',
    label: 'MASTER CORE',
    type: 'root',
    children: [
      {
        id: 'global-properties',
        label: 'GLOBAL PROPERTIES',
        type: 'folder',
        children: [
          { id: 'lighting-rig', label: 'LIGHTING RIG', tag: 'STUDIO_LGT', type: 'item' },
          { id: 'atmosphere', label: 'ATMOSPHERE', tag: 'AERO_FOG', type: 'item' },
          { id: 'environment', label: 'ENVIRONMENT', tag: 'IBL_TONE', type: 'item' },
          { id: 'post-processing', label: 'POST-PROCESSING', tag: 'CINEMA_FX', type: 'item' },
        ],
      },
      {
        id: 'object-meshes',
        label: 'OBJECT MESHES',
        type: 'folder',
        children: [
          { id: 'fuel-head', label: 'FUEL HEAD', tag: 'HOUSING', type: 'item', active: true, selected: true },
          { id: 'head-cover', label: 'HEAD COVER', tag: 'CAP_RED', type: 'item' },
          { id: 'fuel-tank', label: 'FUEL TANK', tag: 'DATA_CORE', type: 'item' },
          { id: 'probe-sensor', label: 'PROBE SENSOR', tag: 'EXT_ARM', type: 'item' },
          { id: 'harness', label: 'HARNESS', tag: 'CABLE_BUS', type: 'item' },
          { id: 'gear-belt', label: 'GEAR BELT', tag: 'MECH_DRIVE', type: 'item' },
          { id: 'mounting-base', label: 'MOUNTING BASE', tag: 'PLATFORM', type: 'item' },
          { id: 'truck-chassis', label: 'TRUCK CHASSIS', tag: 'MAIN_RIG', type: 'item' },
          { id: 'cab-windows', label: 'CAB WINDOWS', tag: 'OPTICS', type: 'item' },
          { id: 'wheels', label: 'WHEELS', tag: 'TRANSMISSION', type: 'item' },
          { id: 'tl-identity', label: 'TL IDENTITY', tag: 'BRAND', type: 'item' },
          { id: 'rear-lights', label: 'REAR LIGHTS', tag: 'EMISSION', type: 'item' },
        ],
      },
    ],
  },
];

interface SceneTreeItemProps {
  node: SceneNode;
  depth?: number;
  onSelect?: (id: string) => void;
  selectedId?: string;
}

const SceneTreeItem = ({ node, depth = 0, onSelect, selectedId }: SceneTreeItemProps) => {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 12;
  const isSelected = selectedId === node.id;

  const getIcon = () => {
    if (node.type === 'root' || node.type === 'folder') {
      return <Folder size={11} className="text-text-muted flex-shrink-0" />;
    }
    return (
      <Circle
        size={9}
        className={`flex-shrink-0 ${isSelected ? 'fill-brand text-brand' : 'text-text-disabled'}`}
      />
    );
  };

  return (
    <div>
      <div
        className={`ui-tree-row ${isSelected ? 'ui-tree-row-selected' : ''} ${node.active && !isSelected ? 'ui-tree-row-active' : ''}`}
        style={{ paddingLeft: `${indent + (isSelected ? 6 : 8)}px` }}
        onClick={() => {
          if (hasChildren) setOpen(!open);
          if (node.type === 'item' && onSelect) onSelect(node.id);
        }}
      >
        {hasChildren ? (
          <span className="text-text-muted flex-shrink-0 w-3">
            {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </span>
        ) : (
          <span className="w-3 flex-shrink-0"></span>
        )}
        {getIcon()}
        <span className={`ui-tree-label ${isSelected ? 'text-text-primary' : node.active ? 'text-brand' : 'text-text-secondary'}`}>
          {formatUiLabel(node.label)}
        </span>
        {node.tag && (
          <span className="ui-tree-meta ml-1 flex-shrink-0 truncate max-w-[60px]">
            {node.tag}
          </span>
        )}
      </div>
      {open && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <SceneTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SceneNavigationTreeProps {
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const SceneNavigationTree = ({ selectedId = 'fuel-head', onSelect }: SceneNavigationTreeProps) => (
  <div className="ui-panel-shell w-full flex-shrink-0">
    <div className="ui-tree-header">
      <span className="ui-tree-header-label">Navigation Layers</span>
    </div>
    <div className="flex-1 overflow-y-auto py-1">
      {sceneTree.map((node) => (
        <SceneTreeItem
          key={node.id}
          node={node}
          depth={0}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  </div>
);

export default SceneNavigationTree;
