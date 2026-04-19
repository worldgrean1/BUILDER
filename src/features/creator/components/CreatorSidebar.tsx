import type { DragEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, ChevronDown, ChevronRight, Code2, Cuboid, Eye, EyeOff, Image as ImageIcon, Layers3, Lock, Plus, PlusSquare, Search, SquareStack, Type } from 'lucide-react';
import { CREATOR_INSERT_ITEMS } from '@/features/creator/mockDocument';
import { creatorActions, useCreatorStore } from '@/features/creator/store';
import type { CreatorDocument, CreatorNodeType } from '@/features/creator/types';
import { CreatorChatPanel } from '@/features/creator/components/CreatorChatPanel';
import { useSettingsStore } from '@/features/settings/settingsStore';

type SidebarTab = 'layers' | 'insert' | 'assist';

const typeIcons: Record<CreatorNodeType, ReactNode> = {
  frame: <SquareStack size={11} />,
  section: <Box size={11} />,
  container: <Box size={11} />,
  card: <Layers3 size={11} />,
  text: <Type size={11} />,
  button: <PlusSquare size={11} />,
  image: <ImageIcon size={11} />,
  threeD: <Cuboid size={11} />,
  embed: <Code2 size={11} />,
};

const LAYER_ROW_HEIGHT = 28;
const LAYER_OVERSCAN = 8;

type FlattenedLayerRow = { nodeId: string; depth: number };
type DropPosition = 'before' | 'inside' | 'after';

const isDescendantNode = (document: CreatorDocument, ancestorId: string, targetId: string): boolean => {
  if (ancestorId === targetId) return true;
  const node = document.nodes[ancestorId];
  if (!node) return false;
  return node.children.some((childId) => isDescendantNode(document, childId, targetId));
};

const buildLayerMatchSet = (document: CreatorDocument, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;
  const includedIds = new Set<string>();
  Object.values(document.nodes).forEach((node) => {
    if (!node.name.toLowerCase().includes(normalizedQuery)) return;
    let currentId: string | null = node.id;
    while (currentId) { includedIds.add(currentId); currentId = document.nodes[currentId]?.parentId ?? null; }
  });
  return includedIds;
};

const flattenRows = (document: CreatorDocument, rootId: string, expandedLayerIds: string[], query: string): FlattenedLayerRow[] => {
  const expandedSet = new Set(expandedLayerIds);
  const matches = buildLayerMatchSet(document, query);
  const queryActive = query.trim().length > 0;
  const rows: FlattenedLayerRow[] = [];
  const walk = (nodeId: string, depth: number) => {
    if (matches && !matches.has(nodeId)) return;
    const node = document.nodes[nodeId];
    if (!node) return;
    rows.push({ nodeId, depth });
    if (!(queryActive || expandedSet.has(nodeId))) return;
    node.children.forEach((childId) => walk(childId, depth + 1));
  };
  walk(rootId, 0);
  return rows;
};

const getDropTarget = (document: CreatorDocument, draggedId: string, targetId: string, position: DropPosition): { parentId: string; index: number } | null => {
  const targetNode = document.nodes[targetId];
  if (!targetNode || draggedId === targetId) return null;
  if (position === 'inside') {
    if (isDescendantNode(document, draggedId, targetId)) return null;
    return { parentId: targetId, index: targetNode.children.length };
  }
  const targetParentId = targetNode.parentId;
  if (!targetParentId) return null;
  if (isDescendantNode(document, draggedId, targetParentId)) return null;
  const siblings = document.nodes[targetParentId].children;
  const targetIndex = siblings.indexOf(targetId);
  if (targetIndex < 0) return null;
  return { parentId: targetParentId, index: position === 'before' ? targetIndex : targetIndex + 1 };
};

/* ── Layer Row ── */

const LayerRow = ({
  row, dragState, onDragIntent, onDropRow, editingNodeId, onStartRename, onFinishRename,
}: {
  row: FlattenedLayerRow;
  dragState: { draggedId: string; overId: string | null; position: DropPosition | null } | null;
  onDragIntent: (nodeId: string, event: DragEvent<HTMLDivElement>) => void;
  onDropRow: (nodeId: string) => void;
  editingNodeId: string | null;
  onStartRename: (nodeId: string) => void;
  onFinishRename: () => void;
}) => {
  const node = useCreatorStore((state) => state.document.nodes[row.nodeId]);
  const selected = useCreatorStore((state) => state.selectionIds.includes(row.nodeId));
  const expanded = useCreatorStore((state) => state.expandedLayerIds.includes(row.nodeId));
  const [draftName, setDraftName] = useState('');
  const isRenaming = editingNodeId === row.nodeId;

  useEffect(() => { if (isRenaming && node) setDraftName(node.name); }, [isRenaming, node]);
  if (!node) return null;

  const children = node.children;
  const showBefore = dragState?.overId === row.nodeId && dragState.position === 'before';
  const showAfter = dragState?.overId === row.nodeId && dragState.position === 'after';
  const showInside = dragState?.overId === row.nodeId && dragState.position === 'inside';

  return (
    <div className="relative" style={{ height: `${LAYER_ROW_HEIGHT}px` }}>
      {showBefore && <div className="pointer-events-none absolute left-2 right-2 top-0 z-10 h-px bg-brand" />}
      <div
        draggable={node.id !== 'frame-root'}
        onDragStart={(event) => { event.dataTransfer.setData('application/x-creator-layer', row.nodeId); event.dataTransfer.effectAllowed = 'move'; }}
        onDragOver={(event) => onDragIntent(row.nodeId, event)}
        onDrop={() => onDropRow(row.nodeId)}
        className={`flex items-center gap-1 transition-colors ${selected ? 'bg-brand/10 text-text-primary' : 'text-text-secondary hover:bg-surface-2/30'}`}
        style={{
          paddingLeft: `${row.depth * 14 + 8}px`,
          height: `${LAYER_ROW_HEIGHT}px`,
          boxShadow: showInside ? 'inset 0 0 0 1px hsl(var(--brand) / 0.55)' : undefined,
          borderLeft: selected ? '2px solid hsl(var(--brand))' : '2px solid transparent',
        }}
        onClick={() => creatorActions.selectNode(row.nodeId)}
      >
        {children.length > 0 ? (
          <button onClick={(event) => { event.stopPropagation(); creatorActions.setLayerExpanded(row.nodeId, !expanded); }} className="flex h-4 w-4 items-center justify-center text-text-disabled">
            {expanded ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
          </button>
        ) : <div className="w-4" />}

        <span className="text-text-muted">{typeIcons[node.type]}</span>

        {isRenaming ? (
          <input
            autoFocus value={draftName} onChange={(event) => setDraftName(event.target.value)}
            onBlur={() => { creatorActions.updateNodeName(row.nodeId, draftName); onFinishRename(); }}
            onKeyDown={(event) => { event.stopPropagation(); if (event.key === 'Enter') { creatorActions.updateNodeName(row.nodeId, draftName); onFinishRename(); } if (event.key === 'Escape') { setDraftName(node.name); onFinishRename(); } }}
            className="ui-input h-5 flex-1 px-1.5 text-[10px]" onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <button type="button" className="flex-1 truncate text-left text-[10px] font-medium" onDoubleClick={(event) => { event.stopPropagation(); onStartRename(row.nodeId); }}>{node.name}</button>
        )}

        <div className="ml-auto flex items-center gap-0.5 pr-1.5 opacity-0 transition-opacity group-hover:opacity-100 [div:hover>&]:opacity-100">
          <button onClick={(event) => { event.stopPropagation(); creatorActions.toggleNodeVisibility(row.nodeId); }} className="text-text-disabled hover:text-text-primary">
            {node.hidden ? <EyeOff size={10} /> : <Eye size={10} />}
          </button>
          <button onClick={(event) => { event.stopPropagation(); creatorActions.toggleNodeLock(row.nodeId); }} className={`hover:text-text-primary ${node.locked ? 'text-brand' : 'text-text-disabled'}`}>
            <Lock size={10} />
          </button>
        </div>
      </div>
      {showAfter && <div className="pointer-events-none absolute left-2 right-2 bottom-0 z-10 h-px bg-brand" />}
    </div>
  );
};

/* ── Main Sidebar ── */

const CreatorSidebar = () => {
  const document = useCreatorStore((state) => state.document);
  const expandedLayerIds = useCreatorStore((state) => state.expandedLayerIds);
  const rootId = useCreatorStore((state) => state.document.rootId);
  const activeTool = useCreatorStore((state) => state.activeTool);
  const pendingInsertType = useCreatorStore((state) => state.pendingInsertType);
  const aiEnabled = useSettingsStore(s => s.aiEnabled);
  const [activeTab, setActiveTab] = useState<SidebarTab>('layers');
  const [query, setQuery] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [dragState, setDragState] = useState<{ draggedId: string; overId: string | null; position: DropPosition | null } | null>(null);
  const [editingLayerNameId, setEditingLayerNameId] = useState<string | null>(null);
  const layersViewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportHeight, setViewportHeight] = useState(400);

  const filteredInsertItems = useMemo(
    () => CREATOR_INSERT_ITEMS.filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const layerRows = useMemo(
    () => flattenRows(document, rootId, expandedLayerIds, activeTab === 'layers' ? query : ''),
    [activeTab, document, expandedLayerIds, query, rootId],
  );

  useEffect(() => {
    const viewport = layersViewportRef.current;
    if (!viewport || activeTab !== 'layers') return;
    if (typeof ResizeObserver === 'undefined') return;
    const measure = () => setViewportHeight(viewport.clientHeight);
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, [activeTab]);

  const totalHeight = layerRows.length * LAYER_ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / LAYER_ROW_HEIGHT) - LAYER_OVERSCAN);
  const endIndex = Math.min(layerRows.length, Math.ceil((scrollTop + viewportHeight) / LAYER_ROW_HEIGHT) + LAYER_OVERSCAN);
  const topSpacer = startIndex * LAYER_ROW_HEIGHT;
  const bottomSpacer = Math.max(0, totalHeight - endIndex * LAYER_ROW_HEIGHT);
  const visibleRows = layerRows.slice(startIndex, endIndex);

  const nodeCount = Object.keys(document.nodes).length - 1;

  return (
    <div className="ui-panel-shell w-full">
      {/* Tab bar */}
      <div className="flex border-b border-border-subtle bg-surface-0/40">
        {((['layers', 'insert'] as SidebarTab[]).concat(aiEnabled ? ['assist'] as SidebarTab[] : [])).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium transition-colors ${activeTab === t ? 'border-b border-brand bg-brand/5 text-brand' : 'text-text-muted hover:text-text-primary'}`}>
            {t === 'layers' ? <><Layers3 size={11} /> Layers <span className="text-[9px] text-text-disabled">({nodeCount})</span></> : t === 'insert' ? <><Plus size={11} /> Insert</> : <>✨ Assist</>}
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab !== 'assist' && (
      <div className="border-b border-border-subtle px-2.5 py-1.5">
        <label className="flex items-center gap-1.5 rounded border border-border-default bg-surface-0/60 px-2 py-1">
          <Search size={10} className="text-text-disabled" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={activeTab === 'insert' ? 'Search widgets...' : 'Filter layers...'} className="w-full bg-transparent text-[10px] text-text-primary outline-none placeholder:text-text-disabled" />
        </label>
      </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'layers' && (
          <div
            ref={layersViewportRef} className="h-full overflow-y-auto"
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
            onDragOver={(event) => { event.preventDefault(); if (!dragState?.draggedId || !layerRows.length) return; const lastRow = layerRows[layerRows.length - 1]; setDragState({ draggedId: dragState.draggedId, overId: lastRow.nodeId, position: 'after' }); }}
            onDrop={(event) => { event.preventDefault(); const draggedId = event.dataTransfer.getData('application/x-creator-layer'); const fallbackTarget = layerRows[layerRows.length - 1]; if (!draggedId || !fallbackTarget) { setDragState(null); return; } const nextDrop = getDropTarget(document, draggedId, fallbackTarget.nodeId, 'after'); if (nextDrop) creatorActions.reorderNode(draggedId, nextDrop.parentId, nextDrop.index); setDragState(null); }}
            onDragLeave={(event) => { if (event.currentTarget.contains(event.relatedTarget as Node | null)) return; setDragState((c) => (c ? { ...c, overId: null, position: null } : null)); }}
          >
            {layerRows.length === 0 && <div className="px-3 py-4 text-[10px] text-text-muted">No matching layers.</div>}
            {layerRows.length > 0 && (
              <div style={{ height: `${totalHeight}px` }}>
                {topSpacer > 0 && <div style={{ height: `${topSpacer}px` }} />}
                {visibleRows.map((row) => (
                  <LayerRow key={row.nodeId} row={row} dragState={dragState} editingNodeId={editingLayerNameId}
                    onStartRename={(nodeId) => setEditingLayerNameId(nodeId)} onFinishRename={() => setEditingLayerNameId(null)}
                    onDragIntent={(nodeId, event) => { event.preventDefault(); const draggedId = event.dataTransfer.getData('application/x-creator-layer'); if (!draggedId) return; const rect = event.currentTarget.getBoundingClientRect(); const ratio = (event.clientY - rect.top) / rect.height; const position: DropPosition = ratio < 0.28 ? 'before' : ratio > 0.72 ? 'after' : 'inside'; const nextDrop = getDropTarget(document, draggedId, nodeId, position); setDragState({ draggedId, overId: nodeId, position: nextDrop ? position : null }); }}
                    onDropRow={(nodeId) => { if (!dragState?.draggedId || !dragState.position) { setDragState(null); return; } const nextDrop = getDropTarget(document, dragState.draggedId, nodeId, dragState.position); if (nextDrop) creatorActions.reorderNode(dragState.draggedId, nextDrop.parentId, nextDrop.index); setDragState(null); }}
                  />
                ))}
                {bottomSpacer > 0 && <div style={{ height: `${bottomSpacer}px` }} />}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insert' && (
          <div className="p-2.5">
            {filteredInsertItems.length === 0 && <div className="rounded border border-border-default bg-surface-0/50 px-3 py-3 text-[10px] text-text-muted">No results.</div>}
            <div className="grid grid-cols-2 gap-1.5">
              {filteredInsertItems.map((item) => {
                const armed = pendingInsertType === item.type && activeTool === 'create';
                return (
                  <button
                    key={item.id} draggable
                    onDragStart={(event) => { event.dataTransfer.setData('application/x-creator-insert', item.type); event.dataTransfer.effectAllowed = 'copy'; }}
                    onClick={() => { if (activeTool === 'create') { creatorActions.armInsertType(item.type); return; } creatorActions.insertNode(item.type, { x: 120, y: 120 }); }}
                    className={`flex flex-col items-center gap-1.5 rounded-md border p-2.5 text-center transition-colors ${armed ? 'border-brand/40 bg-brand/10 text-brand' : 'border-border-default bg-surface-0/50 text-text-muted hover:border-border-strong hover:text-text-primary'}`}
                  >
                    {item.type === 'text' ? <Type size={16} /> : item.type === 'image' ? <ImageIcon size={16} /> : item.type === 'threeD' ? <Cuboid size={16} /> : item.type === 'embed' ? <Code2 size={16} /> : <Box size={16} />}
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'assist' && (
          <CreatorChatPanel />
        )}
      </div>
    </div>
  );
};

export default CreatorSidebar;
