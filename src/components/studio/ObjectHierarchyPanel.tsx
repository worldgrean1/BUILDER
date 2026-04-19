import { useState, type ReactNode } from 'react';
import { ChevronRight, ChevronDown, Box, Circle, Triangle, Hexagon, Globe, Layers, Eye, EyeOff, Lock } from 'lucide-react';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface SceneObject {
  id: string;
  label: string;
  tag: string;
  type: 'mesh' | 'light' | 'camera' | 'group' | 'curve';
  visible?: boolean;
  locked?: boolean;
  children?: SceneObject[];
}

const sceneObjects: SceneObject[] = [
  {
    id: 'scene-root',
    label: 'scene root',
    tag: 'WORLD',
    type: 'group',
    children: [
      {
        id: 'lighting-group',
        label: 'lighting rig',
        tag: 'LGT_GRP',
        type: 'group',
        children: [
          { id: 'key-light', label: 'key light', tag: 'SUN_KEY', type: 'light' },
          { id: 'fill-light', label: 'fill light', tag: 'AREA_FILL', type: 'light' },
          { id: 'rim-light', label: 'rim light', tag: 'SPOT_RIM', type: 'light' },
        ],
      },
      {
        id: 'camera-group',
        label: 'cameras',
        tag: 'CAM_GRP',
        type: 'group',
        children: [
          { id: 'main-cam', label: 'main cam', tag: 'PERSP_01', type: 'camera' },
          { id: 'orbit-cam', label: 'orbit cam', tag: 'ORBIT_02', type: 'camera' },
        ],
      },
      {
        id: 'mesh-group',
        label: 'mesh objects',
        tag: 'GEO_GRP',
        type: 'group',
        children: [
          { id: 'fuel-head', label: 'fuel head', tag: 'HOUSING', type: 'mesh' },
          { id: 'head-cover', label: 'head cover', tag: 'CAP_RED', type: 'mesh' },
          { id: 'fuel-tank', label: 'fuel tank', tag: 'DATA_CORE', type: 'mesh' },
          { id: 'probe-sensor', label: 'probe sensor', tag: 'EXT_ARM', type: 'mesh' },
          { id: 'harness', label: 'harness', tag: 'CABLE_BUS', type: 'mesh' },
          { id: 'gear-belt', label: 'gear belt', tag: 'MECH_DRIVE', type: 'mesh' },
          { id: 'mounting-base', label: 'mounting base', tag: 'PLATFORM', type: 'mesh', locked: true },
        ],
      },
      {
        id: 'curve-group',
        label: 'curve data',
        tag: 'CRV_GRP',
        type: 'group',
        children: [
          { id: 'motion-path', label: 'motion path', tag: 'ANIM_CRV', type: 'curve' },
          { id: 'spline-01', label: 'spline 01', tag: 'NURBS', type: 'curve' },
        ],
      },
    ],
  },
];

const typeIconMap: Record<SceneObject['type'], ReactNode> = {
  mesh: <Box size={10} />,
  light: <Circle size={10} />,
  camera: <Triangle size={10} />,
  group: <Hexagon size={10} />,
  curve: <Globe size={10} />,
};

const typeColorMap: Record<SceneObject['type'], string> = {
  mesh: 'text-info',
  light: 'text-warning',
  camera: 'text-success',
  group: 'text-text-muted',
  curve: 'text-brand-teal',
};

interface ObjectItemProps {
  object: SceneObject;
  depth?: number;
  selectedId: string;
  onSelect: (id: string) => void;
}

const ObjectItem = ({ object, depth = 0, selectedId, onSelect }: ObjectItemProps) => {
  const [open, setOpen] = useState(depth < 2);
  const [visible, setVisible] = useState(object.visible !== false);
  const hasChildren = Boolean(object.children?.length);
  const isSelected = selectedId === object.id;
  const indent = depth * 14;

  return (
    <div>
      <div
        className={`relative flex cursor-pointer select-none items-center gap-1.5 border-l-2 py-[5px] pr-2 transition-colors ${isSelected ? 'border-brand bg-brand/10' : 'border-transparent hover:bg-surface-2/40'}`}
        style={{ paddingLeft: `${indent + (isSelected ? 6 : 8)}px` }}
        onClick={() => {
          if (hasChildren) {
            setOpen(!open);
          }
          onSelect(object.id);
        }}
      >
        <span className="w-3 flex-shrink-0 text-text-muted">
          {hasChildren ? open ? <ChevronDown size={9} /> : <ChevronRight size={9} /> : null}
        </span>

        <span className={`flex-shrink-0 ${typeColorMap[object.type]}`}>{typeIconMap[object.type]}</span>

        <span className={`flex-1 truncate text-ui-xs font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
          {formatUiLabel(object.label)}
        </span>

        <span className="mr-1 hidden max-w-[52px] flex-shrink-0 truncate font-mono text-ui-micro text-text-disabled group-hover:block">
          {object.tag}
        </span>

        <button
          className="flex-shrink-0 text-text-disabled transition-colors hover:text-text-secondary"
          onClick={(event) => {
            event.stopPropagation();
            setVisible(!visible);
          }}
        >
          {visible ? <Eye size={10} /> : <EyeOff size={10} className="text-text-disabled" />}
        </button>

        {object.locked && <Lock size={9} className="ml-0.5 flex-shrink-0 text-warning opacity-60" />}
      </div>

      {open && hasChildren && object.children!.map((child) => (
        <ObjectItem key={child.id} object={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
};

interface ObjectHierarchyPanelProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const ObjectHierarchyPanel = ({ selectedId, onSelect }: ObjectHierarchyPanelProps) => (
  <div className="flex h-full w-full flex-col overflow-hidden bg-surface-1">
    <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2.5">
      <span className="ui-section-kicker text-brand">Hierarchy</span>
      <Layers size={11} className="text-text-muted" />
    </div>

    <div className="flex-1 overflow-y-auto py-1">
      {sceneObjects.map((object) => (
        <ObjectItem key={object.id} object={object} depth={0} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>

    <div className="flex items-center gap-2 border-t border-border-subtle px-3 py-2">
      <span className="font-mono text-ui-micro text-text-disabled">16 objects</span>
      <span className="ml-auto font-mono text-ui-micro text-text-disabled">4 groups</span>
    </div>
  </div>
);

export default ObjectHierarchyPanel;
