import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { CREATOR_FRAME_PRESETS, createInitialCreatorDocument, createNodeTemplate } from './mockDocument';
import type {
  CreatorChainedAction,
  CreatorColorToken,
  CreatorDocument,
  CreatorEasingCurve,
  CreatorHistoryEntry,
  CreatorInstanceOverride,
  CreatorInteractionAction,
  CreatorInteractionTrigger,
  CreatorNode,
  CreatorNodeContent,
  CreatorNodeLayout,
  CreatorNodeResponsive,
  CreatorNodeStyle,
  CreatorSpacingToken,
  CreatorStylePreset,
  CreatorTool,
  CreatorVariant,
  CreatorViewportState,
} from './types';

interface CreatorState {
  document: CreatorDocument;
  colorTokens: CreatorColorToken[];
  spacingTokens: CreatorSpacingToken[];
  stylePresets: CreatorStylePreset[];
  selectionIds: string[];
  hoveredNodeId: string | null;
  activeTool: CreatorTool;
  viewport: CreatorViewportState;
  previewMode: boolean;
  commandPaletteOpen: boolean;
  editingNodeId: string | null;
  cursorCanvasPoint: { x: number; y: number } | null;
  pendingInsertType: CreatorNode['type'] | null;
  hasManualViewportOffset: boolean;
  expandedLayerIds: string[];
  snapEnabled: boolean;
  lastSavedAt: number | null;
  dirty: boolean;
  past: CreatorHistoryEntry[];
  future: CreatorHistoryEntry[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'preset';

const DEFAULT_COLOR_TOKENS: CreatorColorToken[] = [
  { id: 'color-brand-primary', label: 'Brand / Primary', value: 'rgb(191, 31, 47)' },
  { id: 'color-brand-accent', label: 'Brand / Accent', value: 'rgb(0, 178, 169)' },
  { id: 'color-surface-base', label: 'Surface / Base', value: 'rgb(14, 20, 38)' },
  { id: 'color-surface-muted', label: 'Surface / Muted', value: 'rgb(220, 226, 242)' },
  { id: 'color-text-primary', label: 'Text / Primary', value: 'rgb(255, 255, 255)' },
  { id: 'color-text-muted', label: 'Text / Muted', value: 'rgba(255, 255, 255, 0.72)' },
];

const DEFAULT_SPACING_TOKENS: CreatorSpacingToken[] = [
  { id: 'space-2', label: 'Space 2', value: 8 },
  { id: 'space-3', label: 'Space 3', value: 12 },
  { id: 'space-4', label: 'Space 4', value: 16 },
  { id: 'space-6', label: 'Space 6', value: 24 },
  { id: 'space-8', label: 'Space 8', value: 32 },
  { id: 'space-10', label: 'Space 10', value: 40 },
];

const DEFAULT_STYLE_PRESETS: CreatorStylePreset[] = [
  {
    id: 'preset-soft-card',
    name: 'Soft Card',
    style: {
      fill: 'rgba(255,255,255,0.06)',
      stroke: 'rgba(255,255,255,0.14)',
      strokeWidth: 1,
      radius: 8,
      shadow: 'var(--elevation-md)',
    },
  },
  {
    id: 'preset-solid-cta',
    name: 'Solid CTA',
    style: {
      fill: 'rgb(191, 31, 47)',
      stroke: 'transparent',
      color: 'rgb(255,255,255)',
      radius: 8,
      fontWeight: 700,
      shadow: '0 16px 40px rgba(191,31,47,0.32)',
    },
  },
];

const cloneValue = <T,>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const createHistoryEntry = (state: CreatorState): CreatorHistoryEntry => ({
  document: cloneValue(state.document),
  selectedIds: [...state.selectionIds],
  viewport: cloneValue(state.viewport),
  activeTool: state.activeTool,
  previewMode: state.previewMode,
});

const getCenteredPan = (layout: CreatorNodeLayout, zoom: number) => ({
  // With worldOrigin = stageCenter + pan, true centering is independent of stage size.
  // We offset by the layout center in world units so its center lands on stage center.
  panX: -(layout.x + layout.width / 2) * zoom,
  panY: -(layout.y + layout.height / 2) * zoom,
});

const createInitialState = (): CreatorState => {
  const document = createInitialCreatorDocument();
  const stageWidth = 1280;
  const stageHeight = 720;
  const zoom = 0.72;
  const frame = document.nodes[document.rootId].layout;
  const centeredPan = getCenteredPan(frame, zoom);

  return {
  document,
  colorTokens: cloneValue(DEFAULT_COLOR_TOKENS),
  spacingTokens: cloneValue(DEFAULT_SPACING_TOKENS),
  stylePresets: cloneValue(DEFAULT_STYLE_PRESETS),
  selectionIds: ['text-title'],
  hoveredNodeId: null,
  activeTool: 'select',
  viewport: {
    zoom,
    panX: centeredPan.panX,
    panY: centeredPan.panY,
    framePreset: 'desktop',
    stageWidth,
    stageHeight,
  },
  previewMode: false,
  commandPaletteOpen: false,
  editingNodeId: null,
  cursorCanvasPoint: null,
  pendingInsertType: null,
  hasManualViewportOffset: false,
  expandedLayerIds: ['frame-root', 'section-hero'],
  snapEnabled: true,
  lastSavedAt: Date.now(),
  dirty: false,
  past: [],
  future: [],
  };
};

export const creatorStore = createStore<CreatorState>(() => createInitialState());

const getState = () => creatorStore.getState();

const getNodePath = (document: CreatorDocument, nodeId: string): CreatorNode[] => {
  const path: CreatorNode[] = [];
  let current = document.nodes[nodeId];

  while (current) {
    path.unshift(current);
    current = current.parentId ? document.nodes[current.parentId] : undefined;
  }

  return path;
};

export const getNodeAbsoluteLayout = (document: CreatorDocument, nodeId: string): CreatorNodeLayout => {
  const path = getNodePath(document, nodeId);
  return path.slice(1).reduce(
    (acc, node) => ({
      x: acc.x + node.layout.x,
      y: acc.y + node.layout.y,
      width: node.layout.width,
      height: node.layout.height,
    }),
    { x: 0, y: 0, width: document.nodes[document.rootId].layout.width, height: document.nodes[document.rootId].layout.height },
  );
};

const flattenSubtree = (document: CreatorDocument, nodeId: string): string[] => {
  const node = document.nodes[nodeId];
  return [nodeId, ...node.children.flatMap((childId) => flattenSubtree(document, childId))];
};

const isDescendantNode = (document: CreatorDocument, ancestorId: string, targetId: string): boolean => {
  if (ancestorId === targetId) return true;
  const ancestor = document.nodes[ancestorId];
  if (!ancestor) return false;
  return ancestor.children.some((childId) => isDescendantNode(document, childId, targetId));
};

const removeNodeFromParent = (document: CreatorDocument, nodeId: string) => {
  const node = document.nodes[nodeId];
  if (!node?.parentId) {
    return;
  }

  const parent = document.nodes[node.parentId];
  parent.children = parent.children.filter((childId) => childId !== nodeId);
};

const applyDocumentMutation = (mutator: (draft: CreatorDocument) => void, options?: { selectIds?: string[] | null }) => {
  creatorStore.setState((current) => {
    const nextDocument = cloneValue(current.document);
    const historyEntry = createHistoryEntry(current);
    mutator(nextDocument);

    return {
      ...current,
      document: nextDocument,
      selectionIds: options?.selectIds === null ? [] : options?.selectIds ?? current.selectionIds,
      dirty: true,
      past: [...current.past, historyEntry].slice(-40),
      future: [],
    };
  });
};

const setState = (updater: (current: CreatorState) => CreatorState) => {
  creatorStore.setState((current) => updater(current));
};

export const useCreatorStore = <T,>(selector: (snapshot: CreatorState) => T) =>
  useStore(creatorStore, selector);

const buildDuplicateSubtree = (
  document: CreatorDocument,
  nodeId: string,
  parentId: string | null,
  idMap: Map<string, string>,
  collectedNodes: CreatorNode[],
) => {
  const original = document.nodes[nodeId];
  const clonedId = `${original.type}-${Math.random().toString(36).slice(2, 8)}`;
  idMap.set(nodeId, clonedId);

  const cloneNode = cloneValue(original);
  cloneNode.id = clonedId;
  cloneNode.parentId = parentId;
  cloneNode.children = original.children.map((childId) => buildDuplicateSubtree(document, childId, clonedId, idMap, collectedNodes).id);
  collectedNodes.push(cloneNode);
  return cloneNode;
};

export const creatorActions = {
  reset() {
    creatorStore.setState(createInitialState(), true);
  },
  selectNode(nodeId: string, additive = false) {
    setState((current) => {
      const nextIds = additive
        ? current.selectionIds.includes(nodeId)
          ? current.selectionIds.filter((id) => id !== nodeId)
          : [...current.selectionIds, nodeId]
        : [nodeId];

      return { ...current, selectionIds: nextIds, editingNodeId: additive ? current.editingNodeId : null };
    });
  },
  selectNodes(nodeIds: string[]) {
    setState((current) => ({ ...current, selectionIds: nodeIds, editingNodeId: null }));
  },
  clearSelection() {
    setState((current) => ({ ...current, selectionIds: [], editingNodeId: null }));
  },
  setHoveredNode(nodeId: string | null) {
    setState((current) => ({ ...current, hoveredNodeId: nodeId }));
  },
  setActiveTool(tool: CreatorTool) {
    setState((current) => ({
      ...current,
      activeTool: tool,
      pendingInsertType: tool === 'create' ? current.pendingInsertType : null,
    }));
  },
  armInsertType(type: CreatorNode['type'] | null) {
    setState((current) => ({
      ...current,
      pendingInsertType: type,
      activeTool: type ? 'create' : current.activeTool === 'create' ? 'select' : current.activeTool,
    }));
  },
  setZoom(zoom: number) {
    setState((current) => ({ ...current, viewport: { ...current.viewport, zoom: clamp(zoom, 0.25, 2.25) } }));
  },
  setPan(panX: number, panY: number) {
    setState((current) => ({ ...current, hasManualViewportOffset: true, viewport: { ...current.viewport, panX, panY } }));
  },
  setStageSize(stageWidth: number, stageHeight: number) {
    setState((current) => {
      const frame = current.document.nodes[current.document.rootId].layout;
      const centeredPan = getCenteredPan(frame, current.viewport.zoom);
      return {
        ...current,
        viewport: {
          ...current.viewport,
          stageWidth,
          stageHeight,
          panX: current.hasManualViewportOffset ? current.viewport.panX : centeredPan.panX,
          panY: current.hasManualViewportOffset ? current.viewport.panY : centeredPan.panY,
        },
      };
    });
  },
  setFramePreset(presetId: string) {
    const preset = CREATOR_FRAME_PRESETS.find((candidate) => candidate.id === presetId);
    if (!preset) return;

    applyDocumentMutation((draft) => {
      draft.nodes[draft.rootId].layout.width = preset.width;
      draft.nodes[draft.rootId].layout.height = preset.height;
    });

    setState((current) => {
      const frame = current.document.nodes[current.document.rootId].layout;
      const centeredPan = getCenteredPan(frame, current.viewport.zoom);
      return {
        ...current,
        viewport: {
          ...current.viewport,
          framePreset: presetId,
          panX: current.hasManualViewportOffset ? current.viewport.panX : centeredPan.panX,
          panY: current.hasManualViewportOffset ? current.viewport.panY : centeredPan.panY,
        },
      };
    });
  },
  setPreviewMode(previewMode: boolean) {
    setState((current) => ({ ...current, previewMode, editingNodeId: previewMode ? null : current.editingNodeId }));
  },
  toggleCommandPalette(force?: boolean) {
    setState((current) => ({ ...current, commandPaletteOpen: force ?? !current.commandPaletteOpen }));
  },
  setEditingNode(nodeId: string | null) {
    setState((current) => ({ ...current, editingNodeId: nodeId }));
  },
  setCursorCanvasPoint(point: { x: number; y: number } | null) {
    setState((current) => ({ ...current, cursorCanvasPoint: point }));
  },
  setLayerExpanded(nodeId: string, expanded: boolean) {
    setState((current) => ({
      ...current,
      expandedLayerIds: expanded ? [...new Set([...current.expandedLayerIds, nodeId])] : current.expandedLayerIds.filter((id) => id !== nodeId),
    }));
  },
  setSnapEnabled(snapEnabled: boolean) {
    setState((current) => ({ ...current, snapEnabled }));
  },
  updateNodeLayout(nodeId: string, patch: Partial<CreatorNodeLayout>) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.layout = { ...node.layout, ...patch };
    });
  },
  updateNodeLayouts(patches: Record<string, Partial<CreatorNodeLayout>>) {
    const nodeIds = Object.keys(patches);
    if (!nodeIds.length) return;

    applyDocumentMutation((draft) => {
      nodeIds.forEach((nodeId) => {
        const node = draft.nodes[nodeId];
        if (!node) return;
        node.layout = { ...node.layout, ...patches[nodeId] };
      });
    });
  },
  updateNodeStyle(nodeId: string, patch: Partial<CreatorNodeStyle>) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.style = { ...node.style, ...patch };
    });
  },
  updateNodeContent(nodeId: string, patch: Partial<CreatorNodeContent>) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.content = { ...node.content, ...patch };
    });
  },
  applyColorToken(nodeId: string, field: 'fill' | 'stroke' | 'color', tokenId: string) {
    const token = getState().colorTokens.find((entry) => entry.id === tokenId);
    if (!token) return;
    creatorActions.updateNodeStyle(nodeId, { [field]: token.value });
  },
  applySpacingToken(nodeId: string, field: 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft', tokenId: string) {
    const token = getState().spacingTokens.find((entry) => entry.id === tokenId);
    if (!token) return;
    creatorActions.updateNodeStyle(nodeId, { [field]: token.value });
  },
  saveStylePresetFromNode(nodeId: string, name: string) {
    const current = getState();
    const node = current.document.nodes[nodeId];
    if (!node) return;
    const cleanName = name.trim() || `${node.name} preset`;
    const nextPreset: CreatorStylePreset = {
      id: `preset-${slugify(cleanName)}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      style: cloneValue(node.style),
    };
    setState((snapshot) => ({
      ...snapshot,
      stylePresets: [nextPreset, ...snapshot.stylePresets].slice(0, 20),
      dirty: true,
    }));
  },
  applyStylePreset(nodeId: string, presetId: string) {
    const preset = getState().stylePresets.find((entry) => entry.id === presetId);
    if (!preset) return;
    creatorActions.updateNodeStyle(nodeId, preset.style);
  },
  deleteStylePreset(presetId: string) {
    setState((current) => ({
      ...current,
      stylePresets: current.stylePresets.filter((preset) => preset.id !== presetId),
      dirty: true,
    }));
  },
  updateNodeName(nodeId: string, name: string) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.name = name.trim() || node.name;
    });
  },
  updateNodeResponsive(nodeId: string, patch: Partial<CreatorNodeResponsive>) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.responsive = { ...node.responsive, ...patch };
    });
  },
  markAsComponent(nodeId: string) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node || node.id === draft.rootId) return;
      if (!node.componentKey) {
        node.componentKey = `component-${slugify(node.name)}-${Math.random().toString(36).slice(2, 6)}`;
      }
      node.instanceOf = node.componentKey;
    });
  },
  createInstanceFromNode(nodeId: string) {
    const current = getState();
    const source = current.document.nodes[nodeId];
    if (!source || nodeId === current.document.rootId) return;
    const componentKey = source.componentKey ?? `component-${slugify(source.name)}-${Math.random().toString(36).slice(2, 6)}`;

    if (!source.componentKey) {
      creatorActions.markAsComponent(nodeId);
    }

    const idMap = new Map<string, string>();
    const collectedNodes: CreatorNode[] = [];
    const cloneRoot = buildDuplicateSubtree(getState().document, nodeId, source.parentId, idMap, collectedNodes);
    cloneRoot.layout.x += 36;
    cloneRoot.layout.y += 36;
    cloneRoot.instanceOf = componentKey;
    cloneRoot.componentKey = null;

    applyDocumentMutation(
      (draft) => {
        collectedNodes.forEach((node) => {
          draft.nodes[node.id] = node;
        });
        if (cloneRoot.parentId) {
          const parent = draft.nodes[cloneRoot.parentId];
          parent.children = [...parent.children, cloneRoot.id];
        }
      },
      { selectIds: [cloneRoot.id] },
    );
  },
  setNodeVariant(nodeId: string, variant: CreatorVariant) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.variant = variant;
    });
  },
  updateNodeInteraction(
    nodeId: string,
    patch: Partial<{
      trigger: CreatorInteractionTrigger;
      action: CreatorInteractionAction;
      targetId: string | null;
      transitionMs: number;
      easing: CreatorEasingCurve;
      navigateUrl: string;
      setVariantValue: CreatorVariant;
    }>,
  ) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.interaction = { ...node.interaction, ...patch };
    });
  },
  runNodeInteraction(nodeId: string) {
    const current = getState();
    const node = current.document.nodes[nodeId];
    if (!node) return;
    const targetId = node.interaction.targetId ?? nodeId;

    if (node.interaction.action === 'none') return;
    if (node.interaction.action === 'duplicate') {
      creatorActions.duplicateNode(targetId);
      return;
    }
    if (node.interaction.action === 'delete') {
      creatorActions.deleteNode(targetId);
      return;
    }
    if (node.interaction.action === 'toggleVisibility') {
      creatorActions.toggleNodeVisibility(targetId);
      return;
    }
    if (node.interaction.action === 'toggleLock') {
      creatorActions.toggleNodeLock(targetId);
      return;
    }
    if (node.interaction.action === 'focus') {
      creatorActions.selectNode(targetId);
      creatorActions.focusSelection();
      return;
    }
    if (node.interaction.action === 'navigate') {
      const url = node.interaction.navigateUrl;
      if (url) {
        window.open(url, '_blank', 'noopener');
      }
      return;
    }
    if (node.interaction.action === 'setVariant') {
      creatorActions.setNodeVariant(targetId, node.interaction.setVariantValue);
    }
  },
  moveNode(nodeId: string, delta: { x: number; y: number }) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node || node.locked) return;
      node.layout.x += delta.x;
      node.layout.y += delta.y;
    });
  },
  resizeNode(nodeId: string, patch: Partial<CreatorNodeLayout>) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node || node.locked) return;
      node.layout = {
        ...node.layout,
        ...patch,
        width: Math.max(48, patch.width ?? node.layout.width),
        height: Math.max(40, patch.height ?? node.layout.height),
      };
    });
  },
  reorderNode(nodeId: string, targetParentId: string, targetIndex: number) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      const targetParent = draft.nodes[targetParentId];
      if (!node || !targetParent || nodeId === draft.rootId) return;
      if (nodeId === targetParentId) return;
      if (isDescendantNode(draft, nodeId, targetParentId)) return;

      removeNodeFromParent(draft, nodeId);
      node.parentId = targetParentId;
      const nextChildren = [...targetParent.children];
      nextChildren.splice(clamp(targetIndex, 0, nextChildren.length), 0, nodeId);
      targetParent.children = nextChildren;
    });
  },
  toggleNodeVisibility(nodeId: string) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.hidden = !node.hidden;
    });
  },
  toggleNodeLock(nodeId: string) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.locked = !node.locked;
    });
  },
  insertNode(type: CreatorNode['type'], position = { x: 80, y: 80 }, parentId?: string, layoutPatch?: Partial<CreatorNodeLayout>) {
    const current = getState();
    const resolvedParentId = parentId ?? current.document.rootId;
    const nextId = `${type}-${Math.random().toString(36).slice(2, 8)}`;
    applyDocumentMutation(
      (draft) => {
        const parent = draft.nodes[resolvedParentId];
        if (!parent) return;
        const node = createNodeTemplate(type, nextId, position, resolvedParentId);
        if (layoutPatch) {
          node.layout = { ...node.layout, ...layoutPatch };
        }
        draft.nodes[nextId] = node;
        parent.children = [...parent.children, nextId];
      },
      { selectIds: [nextId] },
    );
    setState((snapshot) => ({
      ...snapshot,
      pendingInsertType: snapshot.activeTool === 'create' ? snapshot.pendingInsertType : null,
    }));
  },
  deleteNode(nodeId: string) {
    const current = getState();
    if (nodeId === current.document.rootId) return;

    applyDocumentMutation(
      (draft) => {
        removeNodeFromParent(draft, nodeId);
        const idsToDelete = flattenSubtree(draft, nodeId);
        idsToDelete.forEach((id) => {
          delete draft.nodes[id];
        });
      },
      { selectIds: [] },
    );
  },
  duplicateNode(nodeId: string) {
    const current = getState();
    const original = current.document.nodes[nodeId];
    if (!original || nodeId === current.document.rootId) return;

    const idMap = new Map<string, string>();
    const collectedNodes: CreatorNode[] = [];
    const cloneRoot = buildDuplicateSubtree(current.document, nodeId, original.parentId, idMap, collectedNodes);
    cloneRoot.layout.x += 24;
    cloneRoot.layout.y += 24;

    applyDocumentMutation(
      (draft) => {
        collectedNodes.forEach((node) => {
          draft.nodes[node.id] = node;
        });

        if (cloneRoot.parentId) {
          const parent = draft.nodes[cloneRoot.parentId];
          parent.children = [...parent.children, cloneRoot.id];
        }
      },
      { selectIds: [cloneRoot.id] },
    );
  },
  undo() {
    const current = getState();
    if (!current.past.length) return;
    const previous = current.past[current.past.length - 1];
    const currentEntry = createHistoryEntry(current);

    creatorStore.setState({
      ...current,
      document: cloneValue(previous.document),
      selectionIds: [...previous.selectedIds],
      viewport: cloneValue(previous.viewport),
      activeTool: previous.activeTool,
      previewMode: previous.previewMode,
      past: current.past.slice(0, -1),
      future: [currentEntry, ...current.future],
      dirty: true,
    });
  },
  redo() {
    const current = getState();
    if (!current.future.length) return;
    const next = current.future[0];
    const currentEntry = createHistoryEntry(current);

    creatorStore.setState({
      ...current,
      document: cloneValue(next.document),
      selectionIds: [...next.selectedIds],
      viewport: cloneValue(next.viewport),
      activeTool: next.activeTool,
      previewMode: next.previewMode,
      future: current.future.slice(1),
      past: [...current.past, currentEntry],
      dirty: true,
    });
  },
  focusSelection() {
    const current = getState();
    const targetId = current.selectionIds[0];
    const frame = current.document.nodes[current.document.rootId];
    const layout = targetId ? getNodeAbsoluteLayout(current.document, targetId) : frame.layout;

    setState((current) => {
      const centeredPan = getCenteredPan(layout, current.viewport.zoom);

      return {
        ...current,
        hasManualViewportOffset: true,
        viewport: { ...current.viewport, panX: centeredPan.panX, panY: centeredPan.panY },
      };
    });
  },
  saveDraft() {
    setState((current) => ({ ...current, lastSavedAt: Date.now(), dirty: false }));
  },
};

export const getCreatorNode = (nodeId: string) => creatorStore.getState().document.nodes[nodeId];

/* ── Token Management ─────────────────────────── */

export const tokenActions = {
  addColorToken(label: string, value: string) {
    const id = `color-${slugify(label)}-${Math.random().toString(36).slice(2, 6)}`;
    setState((current) => ({
      ...current,
      colorTokens: [...current.colorTokens, { id, label: label.trim(), value }].slice(0, 30),
      dirty: true,
    }));
  },
  updateColorToken(tokenId: string, patch: Partial<Omit<CreatorColorToken, 'id'>>) {
    setState((current) => ({
      ...current,
      colorTokens: current.colorTokens.map((token) =>
        token.id === tokenId ? { ...token, ...patch } : token,
      ),
      dirty: true,
    }));
  },
  deleteColorToken(tokenId: string) {
    setState((current) => ({
      ...current,
      colorTokens: current.colorTokens.filter((token) => token.id !== tokenId),
      dirty: true,
    }));
  },
  addSpacingToken(label: string, value: number) {
    const id = `space-${slugify(label)}-${Math.random().toString(36).slice(2, 6)}`;
    setState((current) => ({
      ...current,
      spacingTokens: [...current.spacingTokens, { id, label: label.trim(), value }].slice(0, 30),
      dirty: true,
    }));
  },
  updateSpacingToken(tokenId: string, patch: Partial<Omit<CreatorSpacingToken, 'id'>>) {
    setState((current) => ({
      ...current,
      spacingTokens: current.spacingTokens.map((token) =>
        token.id === tokenId ? { ...token, ...patch } : token,
      ),
      dirty: true,
    }));
  },
  deleteSpacingToken(tokenId: string) {
    setState((current) => ({
      ...current,
      spacingTokens: current.spacingTokens.filter((token) => token.id !== tokenId),
      dirty: true,
    }));
  },
  renameStylePreset(presetId: string, name: string) {
    setState((current) => ({
      ...current,
      stylePresets: current.stylePresets.map((preset) =>
        preset.id === presetId ? { ...preset, name: name.trim() || preset.name } : preset,
      ),
      dirty: true,
    }));
  },
  duplicateStylePreset(presetId: string) {
    const current = getState();
    const source = current.stylePresets.find((preset) => preset.id === presetId);
    if (!source) return;
    const next: CreatorStylePreset = {
      id: `preset-${slugify(source.name)}-${Math.random().toString(36).slice(2, 6)}`,
      name: `${source.name} copy`,
      style: cloneValue(source.style),
    };
    setState((snapshot) => ({
      ...snapshot,
      stylePresets: [...snapshot.stylePresets, next].slice(0, 20),
      dirty: true,
    }));
  },
};

/* ── Component System Depth ───────────────────── */

export const componentActions = {
  detachInstance(nodeId: string) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node || !node.instanceOf) return;
      node.instanceOf = null;
      node.instanceOverrides = [];
    });
  },
  relinkInstance(nodeId: string, componentKey: string) {
    const current = getState();
    const sourceNode = Object.values(current.document.nodes).find(
      (node) => node.componentKey === componentKey,
    );
    if (!sourceNode) return;

    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.instanceOf = componentKey;
      node.instanceOverrides = [];
    });
  },
  addInstanceOverride(nodeId: string, override: CreatorInstanceOverride) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node || !node.instanceOf) return;
      const existing = node.instanceOverrides.findIndex(
        (entry) => entry.field === override.field && entry.path === override.path,
      );
      if (existing >= 0) {
        node.instanceOverrides[existing] = override;
      } else {
        node.instanceOverrides.push(override);
      }
    });
  },
  resetInstanceOverrides(nodeId: string) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.instanceOverrides = [];
    });
  },
  resetInstanceOverride(nodeId: string, field: string, path: string) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.instanceOverrides = node.instanceOverrides.filter(
        (entry) => !(entry.field === field && entry.path === path),
      );
    });
  },
};

/* ── Interaction Editor Depth ─────────────────── */

export const interactionActions = {
  setInteractionChain(nodeId: string, trigger: CreatorInteractionTrigger) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      if (!node.interactionChain) {
        node.interactionChain = {
          trigger,
          actions: [],
        };
      } else {
        node.interactionChain.trigger = trigger;
      }
    });
  },
  addChainedAction(nodeId: string, action?: Partial<CreatorChainedAction>) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      if (!node.interactionChain) {
        node.interactionChain = {
          trigger: 'click',
          actions: [],
        };
      }
      const newAction: CreatorChainedAction = {
        id: `chain-${Math.random().toString(36).slice(2, 8)}`,
        action: 'none',
        targetId: null,
        transitionMs: 200,
        easing: 'ease-out',
        delayMs: 0,
        navigateUrl: '',
        setVariantValue: 'default',
        ...action,
      };
      node.interactionChain.actions.push(newAction);
    });
  },
  updateChainedAction(nodeId: string, actionId: string, patch: Partial<Omit<CreatorChainedAction, 'id'>>) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node?.interactionChain) return;
      const target = node.interactionChain.actions.find((entry) => entry.id === actionId);
      if (target) {
        Object.assign(target, patch);
      }
    });
  },
  removeChainedAction(nodeId: string, actionId: string) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node?.interactionChain) return;
      node.interactionChain.actions = node.interactionChain.actions.filter(
        (entry) => entry.id !== actionId,
      );
    });
  },
  reorderChainedAction(nodeId: string, actionId: string, newIndex: number) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node?.interactionChain) return;
      const actions = node.interactionChain.actions;
      const fromIndex = actions.findIndex((entry) => entry.id === actionId);
      if (fromIndex < 0) return;
      const [removed] = actions.splice(fromIndex, 1);
      actions.splice(clamp(newIndex, 0, actions.length), 0, removed);
    });
  },
  clearInteractionChain(nodeId: string) {
    applyDocumentMutation((draft) => {
      const node = draft.nodes[nodeId];
      if (!node) return;
      node.interactionChain = null;
    });
  },
  runInteractionChain(nodeId: string) {
    const current = getState();
    const node = current.document.nodes[nodeId];
    if (!node?.interactionChain || node.interactionChain.actions.length === 0) return;

    node.interactionChain.actions.forEach((chainAction) => {
      const run = () => {
        const targetId = chainAction.targetId ?? nodeId;
        switch (chainAction.action) {
          case 'duplicate':
            creatorActions.duplicateNode(targetId);
            break;
          case 'delete':
            creatorActions.deleteNode(targetId);
            break;
          case 'toggleVisibility':
            creatorActions.toggleNodeVisibility(targetId);
            break;
          case 'toggleLock':
            creatorActions.toggleNodeLock(targetId);
            break;
          case 'focus':
            creatorActions.selectNode(targetId);
            creatorActions.focusSelection();
            break;
          case 'setVariant':
            creatorActions.setNodeVariant(targetId, chainAction.setVariantValue);
            break;
          default:
            break;
        }
      };

      if (chainAction.delayMs > 0) {
        setTimeout(run, chainAction.delayMs);
      } else {
        run();
      }
    });
  },
};
