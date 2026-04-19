import { useState } from 'react';
import { ChevronRight, ChevronDown, X, Pin, Box, Type, Image as ImageIcon, MoveVertical, CornerDownRight } from 'lucide-react';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface TreeNode {
  id: string;
  label: string;
  type: 'container' | 'heading' | 'text' | 'button' | 'image' | 'spacing';
  children?: TreeNode[];
}

const treeData: TreeNode[] = [
  {
    id: 'body',
    label: 'body',
    type: 'container',
    children: [
      {
        id: 'hero-heading-center',
        label: 'hero heading center',
        type: 'container',
        children: [
          {
            id: 'container',
            label: 'container',
            type: 'container',
            children: [{ id: 'h1-centered', label: 'h1 centered heading', type: 'heading' }],
          },
          {
            id: 'hero-wrapper',
            label: 'hero wrapper',
            type: 'container',
            children: [
              {
                id: 'hero-split-1',
                label: 'hero split',
                type: 'container',
                children: [
                  { id: 'margin-bottom', label: 'margin bottom 24px', type: 'spacing' },
                  { id: 'button-primary', label: 'button primary', type: 'button' },
                ],
              },
              {
                id: 'hero-split-2',
                label: 'hero split',
                type: 'container',
                children: [{ id: 'shadow-two', label: 'shadow two', type: 'image' }],
              },
            ],
          },
        ],
      },
    ],
  },
];

const iconMap = {
  container: <Box size={10} />,
  heading: <Type size={10} />,
  text: <Type size={10} />,
  button: <CornerDownRight size={10} />,
  image: <ImageIcon size={10} />,
  spacing: <MoveVertical size={10} />,
} as const;

interface TreeItemProps {
  node: TreeNode;
  level: number;
  selectedId: string;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}

const TreeItem = ({ node, level, selectedId, onSelect, expandedIds, onToggle }: TreeItemProps) => {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = Boolean(node.children?.length);

  return (
    <div>
      <div
        className={`ui-tree-row ${isSelected ? 'ui-tree-row-selected text-text-primary' : 'text-text-secondary'}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggle(node.id);
            }}
            className="flex h-3 w-3 items-center justify-center text-text-muted transition-colors hover:text-text-secondary"
          >
            {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </button>
        ) : (
          <div className="w-3" />
        )}

        <span className="flex h-4 w-4 items-center justify-center flex-shrink-0 text-text-muted">
          {iconMap[node.type]}
        </span>

        <span className="flex-1 truncate text-ui-sm font-medium">{formatUiLabel(node.label)}</span>
      </div>

      {hasChildren && isExpanded && node.children!.map((child) => (
        <TreeItem
          key={child.id}
          node={child}
          level={level + 1}
          selectedId={selectedId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};

const EditorNavigationTree = () => {
  const [selectedId, setSelectedId] = useState('h1-centered');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['body', 'hero-heading-center', 'container', 'hero-wrapper', 'hero-split-1']));

  const handleToggle = (id: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="ui-panel-shell w-full">
      <div className="ui-tree-header flex items-center justify-between">
        <span className="ui-tree-header-label">Navigator</span>
        <div className="flex items-center gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded-ui-sm text-text-muted transition-colors hover:bg-surface-2 hover:text-text-secondary">
            <Pin size={11} />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded-ui-sm text-text-muted transition-colors hover:bg-surface-2 hover:text-text-secondary">
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {treeData.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            level={0}
            selectedId={selectedId}
            onSelect={setSelectedId}
            expandedIds={expandedIds}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default EditorNavigationTree;
