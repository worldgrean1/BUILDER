import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlignCenter, AlignLeft, AlignRight, Box, ChevronDown, Code2, Copy, Crosshair, Cuboid, Image as ImageIcon, MousePointer2, Move, Plus, RotateCcw, Scaling, Trash2, Type } from 'lucide-react';
import { CREATOR_INSERT_ITEMS } from '@/features/creator/mockDocument';
import { creatorActions, creatorStore, getNodeAbsoluteLayout, useCreatorStore } from '@/features/creator/store';
import type { CreatorNode, CreatorNodeLayout } from '@/features/creator/types';

type InteractionState =
  | null
  | {
      kind: 'move';
      nodeIds: string[];
      origin: { x: number; y: number };
      startLayouts: Record<string, CreatorNodeLayout>;
      liveLayouts: Record<string, CreatorNodeLayout>;
      guideX: number | null;
      guideY: number | null;
    }
  | {
      kind: 'resize';
      nodeId: string;
      handle: 'se';
      origin: { x: number; y: number };
      startLayout: CreatorNodeLayout;
      previewLayout: CreatorNodeLayout;
    }
  | {
      kind: 'rotate';
      nodeId: string;
      centerScreen: { x: number; y: number };
      startAngle: number;
      startRotation: number;
      previewRotation: number;
    }
  | {
      kind: 'marquee';
      origin: { x: number; y: number };
      current: { x: number; y: number };
    }
  | {
      kind: 'pan';
      origin: { x: number; y: number };
      panOrigin: { x: number; y: number };
    }
  | {
      kind: 'create';
      nodeType: CreatorNode['type'];
      origin: { x: number; y: number };
      current: { x: number; y: number };
    };

const isTextualNode = (node: CreatorNode) => node.type === 'text' || node.type === 'button' || node.type === 'card';
const SNAP_GRID = 8;
const SMART_SNAP_THRESHOLD = 10;
const MIN_CREATE_SIZE = { width: 72, height: 48 };
const getViewportClass = (framePreset: string): 'desktop' | 'tablet' | 'mobile' => {
  if (framePreset === 'tablet') return 'tablet';
  if (framePreset === 'mobile') return 'mobile';
  return 'desktop';
};

const normalizeAngle = (angle: number) => {
  let next = angle;
  while (next > 180) next -= 360;
  while (next < -180) next += 360;
  return next;
};

const collectSubtree = (document: { nodes: Record<string, CreatorNode> }, nodeId: string): string[] => {
  const node = document.nodes[nodeId];
  if (!node) return [];
  return [nodeId, ...node.children.flatMap((childId) => collectSubtree(document, childId))];
};

const widgetTypeIcons: Record<Exclude<CreatorNode['type'], 'frame' | 'section' | 'card' | 'button'>, typeof Box> = {
  container: Box,
  text: Type,
  image: ImageIcon,
  threeD: Cuboid,
  embed: Code2,
};

const toolIcons = {
  select: MousePointer2,
  create: Plus,
  move: Move,
  scale: Scaling,
} satisfies Record<'select' | 'create' | 'move' | 'scale', typeof MousePointer2>;

const getCreationRect = (origin: { x: number; y: number }, current: { x: number; y: number }) => {
  const rawWidth = current.x - origin.x;
  const rawHeight = current.y - origin.y;
  return {
    x: rawWidth >= 0 ? origin.x : origin.x + rawWidth,
    y: rawHeight >= 0 ? origin.y : origin.y + rawHeight,
    width: Math.max(MIN_CREATE_SIZE.width, Math.abs(rawWidth)),
    height: Math.max(MIN_CREATE_SIZE.height, Math.abs(rawHeight)),
  };
};

const CanvasNode = memo(
  ({
    nodeId,
    previewLayout,
    previewRotation,
    getPreviewLayout,
    getPreviewRotation,
    onStartMove,
    onStartResize,
    onStartRotate,
    onDoubleActivate,
    activeTool,
  }: {
    nodeId: string;
    previewLayout?: CreatorNodeLayout;
    previewRotation?: number;
    getPreviewLayout: (nodeId: string) => CreatorNodeLayout | undefined;
    getPreviewRotation: (nodeId: string) => number | undefined;
    onStartMove: (nodeId: string, event: React.MouseEvent) => void;
    onStartResize: (nodeId: string, event: React.MouseEvent) => void;
    onStartRotate: (nodeId: string, event: React.MouseEvent) => void;
    onDoubleActivate: (nodeId: string) => void;
    activeTool: 'select' | 'create' | 'move' | 'scale';
  }) => {
    const node = useCreatorStore((state) => state.document.nodes[nodeId]);
    const editingNodeId = useCreatorStore((state) => state.editingNodeId);
    const previewMode = useCreatorStore((state) => state.previewMode);
    const viewportClass = useCreatorStore((state) => getViewportClass(state.viewport.framePreset));
    const isSelected = useCreatorStore((state) => state.selectionIds.includes(nodeId));
    const isHovered = useCreatorStore((state) => state.hoveredNodeId === nodeId);
    const isEditing = editingNodeId === nodeId;
    const layout = previewLayout ?? node.layout;
    const rotation = previewRotation ?? node.style.rotation;

    const hiddenByViewport =
      (viewportClass === 'desktop' && node.responsive.hideOnDesktop) ||
      (viewportClass === 'tablet' && node.responsive.hideOnTablet) ||
      (viewportClass === 'mobile' && node.responsive.hideOnMobile);

    if (node.hidden || hiddenByViewport) return null;

    const commonStyle: React.CSSProperties = {
      position: 'absolute',
      left: layout.x,
      top: layout.y,
      width:
        node.responsive.widthMode === 'fluid'
          ? `min(${node.responsive.maxWidth ?? layout.width}px, 100%)`
          : layout.width,
      height: layout.height,
      borderRadius: node.style.radius,
      background: node.style.fill,
      border: `${node.style.strokeWidth}px solid ${node.style.stroke}`,
      boxShadow: node.style.shadow,
      opacity: node.style.opacity,
      color: node.style.color,
      paddingTop: node.style.paddingTop,
      paddingRight: node.style.paddingRight,
      paddingBottom: node.style.paddingBottom,
      paddingLeft: node.style.paddingLeft,
      overflow: 'hidden',
      userSelect: isEditing ? 'text' : 'none',
      transform: `rotate(${rotation}deg)`,
      transformOrigin: 'center center',
    };

    const content = (() => {
      switch (node.type) {
        case 'text':
          return (
            <div
              contentEditable={isEditing}
              draggable={false}
              suppressContentEditableWarning
              onBlur={(event) => {
                creatorActions.updateNodeContent(node.id, { text: event.currentTarget.textContent ?? '' });
                creatorActions.setEditingNode(null);
              }}
              className="h-full w-full outline-none"
              style={{
                fontSize: node.style.fontSize,
                fontWeight: node.style.fontWeight,
                letterSpacing: `${node.style.letterSpacing}em`,
                lineHeight: node.style.lineHeight,
                textAlign: node.style.textAlign,
              }}
            >
              {node.content.text}
            </div>
          );
        case 'button':
          return (
            <button
              type="button"
              draggable={false}
              className="flex h-full w-full items-center justify-center bg-transparent font-semibold outline-none"
              style={{
                color: node.style.color,
                fontSize: node.style.fontSize,
                fontWeight: node.style.fontWeight,
                letterSpacing: `${node.style.letterSpacing}em`,
              }}
            >
              {node.content.text}
            </button>
          );
        case 'image':
          return node.content.src ? (
            <img src={node.content.src} alt={node.content.alt ?? node.name} className="h-full w-full object-cover" draggable={false} />
          ) : (
            <div className="flex h-full w-full flex-col justify-between">
              <div className="rounded-ui-sm bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">Preview</div>
              <div className="rounded-[8px] border border-white/10 bg-black/10 p-4 text-white/80">
                <p className="text-sm font-semibold">Interactive frame</p>
                <p className="mt-2 text-xs text-white/60">Drop components here or resize this panel like a Figma artboard object.</p>
              </div>
            </div>
          );
        case 'threeD':
          return node.content.src ? (
            <iframe
              src={node.content.src}
              title={node.name}
              className="h-full w-full border-0"
              allow="fullscreen; xr-spatial-tracking"
            />
          ) : (
            <div className="flex h-full w-full flex-col justify-between rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]">
              <div className="flex items-center justify-between">
                <div className="rounded-ui-sm border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                  3D Widget
                </div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">{node.content.runtime === 'threejs' ? 'Three.js' : 'Spline'}</div>
              </div>
              <div className="flex flex-1 items-center justify-center">
              <div className="relative h-20 w-20 rotate-[18deg] rounded-[8px] border border-white/12 bg-white/8 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                  <div className="absolute inset-3 rounded-[8px] border border-dashed border-white/25" />
                  <div className="absolute -right-3 top-4 h-8 w-8 rounded-ui-sm border border-cyan-300/35 bg-cyan-300/12 blur-[1px]" />
                </div>
              </div>
              <div className="rounded-[8px] border border-white/8 bg-black/16 p-4 text-white/72">
                <p className="text-sm font-semibold">Connect a Spline or Three.js viewer</p>
                <p className="mt-2 text-xs text-white/55">Paste a scene URL in the inspector and this widget will render it inline.</p>
              </div>
            </div>
          );
        case 'embed':
          return node.content.src ? (
            <iframe src={node.content.src} title={node.name} className="h-full w-full border-0" allow="fullscreen" />
          ) : (
            <div className="flex h-full w-full flex-col justify-between rounded-[inherit] bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="rounded-ui-sm border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                  Embed
                </div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">IFrame</div>
              </div>
              <div className="flex flex-1 items-center justify-center rounded-[8px] border border-dashed border-white/12 bg-black/10">
                <div className="space-y-2 text-center text-white/60">
                  <p className="text-sm font-semibold">External viewer block</p>
                  <p className="text-xs">Paste any embeddable URL to render it here.</p>
                </div>
              </div>
            </div>
          );
        case 'card':
          return (
            <div className="flex h-full flex-col justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted">System</div>
              <div>
                <p className="text-xl font-semibold text-text-primary">Inspector + layers stay connected.</p>
                <p className="mt-2 text-sm text-text-secondary">{node.content.text}</p>
              </div>
            </div>
          );
        default:
          return (
            <div className="flex h-full w-full flex-col gap-3">
              {node.children.length === 0 && (
                <>
                  <div className="h-2.5 w-24 rounded-ui-sm bg-white/10" />
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((value) => (
                      <div key={value} className="h-20 rounded-2xl border border-white/10 bg-white/5" />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
      }
    })();

    return (
      <div
        data-node-id={node.id}
        style={commonStyle}
        onMouseEnter={() => {
          creatorActions.setHoveredNode(node.id);
          if (previewMode && node.interaction.trigger === 'hover') {
            creatorActions.runNodeInteraction(node.id);
          }
        }}
        onMouseLeave={() => creatorActions.setHoveredNode(null)}
        onMouseDown={(event) => {
          if (!isEditing) {
            event.preventDefault();
          }
          if (!previewMode && !node.locked && activeTool !== 'create') {
            onStartMove(node.id, event);
          }
        }}
        onDoubleClick={() => onDoubleActivate(node.id)}
        onClick={() => {
          if (previewMode && node.interaction.trigger === 'click') {
            creatorActions.runNodeInteraction(node.id);
          }
        }}
        className={`${previewMode ? '' : activeTool === 'scale' ? 'cursor-se-resize' : activeTool === 'create' ? 'cursor-crosshair' : 'cursor-default'} transition-shadow`}
        data-tool={activeTool}
      >
        {content}

        {node.children.map((childId) => (
          <CanvasNode
            key={childId}
            nodeId={childId}
            previewLayout={getPreviewLayout(childId)}
            previewRotation={getPreviewRotation(childId)}
            getPreviewLayout={getPreviewLayout}
            getPreviewRotation={getPreviewRotation}
            onStartMove={onStartMove}
            onStartResize={onStartResize}
            onStartRotate={onStartRotate}
            onDoubleActivate={onDoubleActivate}
            activeTool={activeTool}
          />
        ))}

        {!previewMode && (isSelected || isHovered) && (
          <div
            className={`pointer-events-none absolute inset-0 rounded-[inherit] border ${
              isSelected ? 'border-brand shadow-[0_0_0_1px_rgba(191,31,47,0.5)]' : 'border-white/30'
            }`}
          />
        )}

        {!previewMode && isSelected && !node.locked && (
          <>
            <div className="pointer-events-none absolute -top-7 left-0 rounded-ui-md bg-surface-1 px-2 py-1 text-[10px] font-medium text-brand shadow-elevation-low">
              {node.name}
            </div>
            <button
              onMouseDown={(event) => {
                event.stopPropagation();
                onStartResize(node.id, event);
              }}
              className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 rounded-ui-sm border border-white bg-brand"
            />
            <button
              onMouseDown={(event) => {
                event.stopPropagation();
                onStartRotate(node.id, event);
              }}
              className="absolute -top-5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-ui-sm border border-white bg-surface-0 shadow-elevation-low"
              title="Rotate"
            />
          </>
        )}
      </div>
    );
  },
);

const CreatorCanvas = () => {
  const document = useCreatorStore((state) => state.document);
  const selectionIds = useCreatorStore((state) => state.selectionIds);
  const hoveredNodeId = useCreatorStore((state) => state.hoveredNodeId);
  const editingNodeId = useCreatorStore((state) => state.editingNodeId);
  const viewport = useCreatorStore((state) => state.viewport);
  const previewMode = useCreatorStore((state) => state.previewMode);
  const activeTool = useCreatorStore((state) => state.activeTool);
  const pendingInsertType = useCreatorStore((state) => state.pendingInsertType);
  const snapEnabled = useCreatorStore((state) => state.snapEnabled);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stageMetricsRef = useRef<{ left: number; top: number } | null>(null);
  const interactionRef = useRef<InteractionState>(null);
  const pointerRafRef = useRef<number | null>(null);
  const pendingClientPointRef = useRef<{ x: number; y: number; shiftKey: boolean } | null>(null);
  const [interaction, setInteraction] = useState<InteractionState>(null);
  const [insertHighlight, setInsertHighlight] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement | null>(null);
  const frame = document.nodes[document.rootId];
  const widgetOptions = useMemo(() => CREATOR_INSERT_ITEMS.filter((item) => item.group === 'Widgets'), []);
  const activeWidget = useMemo(
    () => widgetOptions.find((item) => item.type === pendingInsertType) ?? null,
    [pendingInsertType, widgetOptions],
  );
  const ActiveToolIcon = toolIcons[activeTool];
  const ActiveWidgetIcon = activeWidget ? widgetTypeIcons[activeWidget.type as keyof typeof widgetTypeIcons] : Plus;
  const snap = useCallback((value: number) => (snapEnabled ? Math.round(value / SNAP_GRID) * SNAP_GRID : value), [snapEnabled]);

  useEffect(() => {
    interactionRef.current = interaction;
  }, [interaction]);

  useEffect(() => {
    if (!createMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (createMenuRef.current?.contains(event.target as Node)) return;
      setCreateMenuOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [createMenuOpen]);

  useEffect(() => {
    const syncStageMetrics = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      stageMetricsRef.current = { left: rect.left, top: rect.top };

      const { viewport } = creatorStore.getState();
      if (viewport.stageWidth !== stage.clientWidth || viewport.stageHeight !== stage.clientHeight) {
        creatorActions.setStageSize(stage.clientWidth, stage.clientHeight);
      }
    };

    syncStageMetrics();
    window.addEventListener('resize', syncStageMetrics);
    window.addEventListener('scroll', syncStageMetrics, { passive: true });

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => syncStageMetrics()) : null;
    if (observer && stageRef.current) {
      observer.observe(stageRef.current);
    }

    return () => {
      window.removeEventListener('resize', syncStageMetrics);
      window.removeEventListener('scroll', syncStageMetrics);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        creatorActions.toggleCommandPalette(true);
      }

      if ((event.target as HTMLElement | null)?.tagName === 'INPUT' || (event.target as HTMLElement | null)?.isContentEditable) {
        return;
      }

      if (event.key === 'Escape' && editingNodeId) {
        creatorActions.setEditingNode(null);
        return;
      }

      if (event.key === ' ') {
        setSpacePressed(true);
      }

      if (event.key.toLowerCase() === 'v') creatorActions.setActiveTool('select');
      if (event.key === '+' || (event.key === '=' && event.shiftKey)) creatorActions.setActiveTool('create');
      if (event.key.toLowerCase() === 'g') creatorActions.setActiveTool('move');
      if (event.key.toLowerCase() === 's') creatorActions.setActiveTool('scale');
      if (event.key.toLowerCase() === 'f') creatorActions.focusSelection();

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        if (selectionIds[0]) creatorActions.duplicateNode(selectionIds[0]);
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) creatorActions.redo();
        else creatorActions.undo();
      }

      if (event.key === 'Delete' && selectionIds[0]) {
        creatorActions.deleteNode(selectionIds[0]);
      }

      const nudge = (() => {
        if (event.key === 'ArrowLeft') return { x: -1, y: 0 };
        if (event.key === 'ArrowRight') return { x: 1, y: 0 };
        if (event.key === 'ArrowUp') return { x: 0, y: -1 };
        if (event.key === 'ArrowDown') return { x: 0, y: 1 };
        return null;
      })();

      if (nudge && selectionIds.length > 0) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const patches = Object.fromEntries(
          selectionIds
            .map((nodeId) => {
              const node = document.nodes[nodeId];
              if (!node || node.locked) return null;
              const nextX = node.layout.x + nudge.x * step;
              const nextY = node.layout.y + nudge.y * step;
              return [nodeId, { x: snap(nextX), y: snap(nextY) }];
            })
            .filter(Boolean) as [string, Partial<CreatorNodeLayout>][],
        );
        creatorActions.updateNodeLayouts(patches);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ') setSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [document.nodes, editingNodeId, selectionIds, snap]);

  const worldOriginX = viewport.stageWidth / 2 + viewport.panX;
  const worldOriginY = viewport.stageHeight / 2 + viewport.panY;

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    if (!stageMetricsRef.current) {
      const stage = stageRef.current;
      if (stage) {
        const rect = stage.getBoundingClientRect();
        stageMetricsRef.current = { left: rect.left, top: rect.top };
      }
    }
    if (!stageMetricsRef.current) return { x: 0, y: 0 };

    return {
      x: (clientX - stageMetricsRef.current.left - worldOriginX) / viewport.zoom,
      y: (clientY - stageMetricsRef.current.top - worldOriginY) / viewport.zoom,
    };
  }, [viewport.zoom, worldOriginX, worldOriginY]);

  const getPreviewLayout = useCallback((nodeId: string) => {
    const liveInteraction = interactionRef.current;
    if (!liveInteraction) return undefined;

    if (liveInteraction.kind === 'move') {
      return liveInteraction.liveLayouts[nodeId];
    }

    if (liveInteraction.kind === 'resize' && liveInteraction.nodeId === nodeId) {
      return liveInteraction.previewLayout;
    }

    return undefined;
  }, []);

  const getPreviewRotation = useCallback((nodeId: string) => {
    const liveInteraction = interactionRef.current;
    if (!liveInteraction) return undefined;
    if (liveInteraction.kind === 'rotate' && liveInteraction.nodeId === nodeId) {
      return liveInteraction.previewRotation;
    }
    return undefined;
  }, []);

  const computeSmartSnap = useCallback(
    (nodeId: string, deltaX: number, deltaY: number) => {
      const subtreeIds = new Set(collectSubtree(document, nodeId));
      const absolute = getNodeAbsoluteLayout(document, nodeId);
      const moved = {
        x: absolute.x + deltaX,
        y: absolute.y + deltaY,
        width: absolute.width,
        height: absolute.height,
      };

      const movingXPoints = [
        moved.x,
        moved.x + moved.width / 2,
        moved.x + moved.width,
      ];
      const movingYPoints = [
        moved.y,
        moved.y + moved.height / 2,
        moved.y + moved.height,
      ];

      const targets = Object.values(document.nodes)
        .filter((node) => node.id !== document.rootId && !node.hidden && !subtreeIds.has(node.id))
        .map((node) => getNodeAbsoluteLayout(document, node.id));
      targets.push({ x: 0, y: 0, width: frame.layout.width, height: frame.layout.height });

      let bestX: { distance: number; offset: number; guide: number } | null = null;
      let bestY: { distance: number; offset: number; guide: number } | null = null;

      targets.forEach((target) => {
        const targetXPoints = [target.x, target.x + target.width / 2, target.x + target.width];
        const targetYPoints = [target.y, target.y + target.height / 2, target.y + target.height];

        movingXPoints.forEach((movingPoint) => {
          targetXPoints.forEach((targetPoint) => {
            const distance = Math.abs(movingPoint - targetPoint);
            if (distance > SMART_SNAP_THRESHOLD) return;
            if (!bestX || distance < bestX.distance) {
              bestX = { distance, offset: targetPoint - movingPoint, guide: targetPoint };
            }
          });
        });

        movingYPoints.forEach((movingPoint) => {
          targetYPoints.forEach((targetPoint) => {
            const distance = Math.abs(movingPoint - targetPoint);
            if (distance > SMART_SNAP_THRESHOLD) return;
            if (!bestY || distance < bestY.distance) {
              bestY = { distance, offset: targetPoint - movingPoint, guide: targetPoint };
            }
          });
        });
      });

      return {
        deltaX: deltaX + (bestX?.offset ?? 0),
        deltaY: deltaY + (bestY?.offset ?? 0),
        guideX: bestX?.guide ?? null,
        guideY: bestY?.guide ?? null,
      };
    },
    [document, frame.layout.height, frame.layout.width],
  );

  useEffect(() => {
    if (!interaction) return;

    const flushPointerMove = () => {
      pointerRafRef.current = null;
      const pendingClientPoint = pendingClientPointRef.current;
      if (!pendingClientPoint) return;
      pendingClientPointRef.current = null;

      const liveInteraction = interactionRef.current;
      if (!liveInteraction) return;

      if (liveInteraction.kind === 'pan') {
        creatorActions.setPan(
          liveInteraction.panOrigin.x + (pendingClientPoint.x - liveInteraction.origin.x),
          liveInteraction.panOrigin.y + (pendingClientPoint.y - liveInteraction.origin.y),
        );
        return;
      }

      const nextPoint = screenToCanvas(pendingClientPoint.x, pendingClientPoint.y);
      creatorActions.setCursorCanvasPoint(nextPoint);

      if (liveInteraction.kind === 'marquee') {
        setInteraction((current) => {
          if (!current || current.kind !== 'marquee') return current;
          return { ...current, current: nextPoint };
        });
        return;
      }

      if (liveInteraction.kind === 'create') {
        setInteraction((current) => {
          if (!current || current.kind !== 'create') return current;
          return { ...current, current: nextPoint };
        });
        return;
      }

      if (liveInteraction.kind === 'move') {
        let deltaX = nextPoint.x - liveInteraction.origin.x;
        let deltaY = nextPoint.y - liveInteraction.origin.y;
        if (pendingClientPoint.shiftKey) {
          if (Math.abs(deltaX) >= Math.abs(deltaY)) deltaY = 0;
          else deltaX = 0;
        }

        let guideX: number | null = null;
        let guideY: number | null = null;
        if (snapEnabled && liveInteraction.nodeIds.length === 1) {
          const smartSnap = computeSmartSnap(liveInteraction.nodeIds[0], deltaX, deltaY);
          deltaX = smartSnap.deltaX;
          deltaY = smartSnap.deltaY;
          guideX = smartSnap.guideX;
          guideY = smartSnap.guideY;
        }

        const nextLayouts = Object.fromEntries(
          Object.entries(liveInteraction.startLayouts).map(([nodeId, startLayout]) => [
            nodeId,
            {
              ...startLayout,
              x: snap(Math.round(startLayout.x + deltaX)),
              y: snap(Math.round(startLayout.y + deltaY)),
            },
          ]),
        );
        setInteraction((current) => {
          if (!current || current.kind !== 'move') return current;
          return { ...current, liveLayouts: nextLayouts, guideX, guideY };
        });
        return;
      }

      if (liveInteraction.kind === 'resize') {
        const deltaX = nextPoint.x - liveInteraction.origin.x;
        const deltaY = nextPoint.y - liveInteraction.origin.y;
        let nextWidth = Math.max(48, Math.round(liveInteraction.startLayout.width + deltaX));
        let nextHeight = Math.max(40, Math.round(liveInteraction.startLayout.height + deltaY));

        if (pendingClientPoint.shiftKey) {
          const ratio = liveInteraction.startLayout.width / Math.max(1, liveInteraction.startLayout.height);
          if (Math.abs(deltaX) >= Math.abs(deltaY)) {
            nextHeight = Math.max(40, Math.round(nextWidth / ratio));
          } else {
            nextWidth = Math.max(48, Math.round(nextHeight * ratio));
          }
        }

        setInteraction((current) => {
          if (!current || current.kind !== 'resize') return current;
          return {
            ...current,
            previewLayout: {
              ...current.previewLayout,
              width: snap(nextWidth),
              height: snap(nextHeight),
            },
          };
        });
      }

      if (liveInteraction.kind === 'rotate') {
        const currentAngle = Math.atan2(
          pendingClientPoint.y - liveInteraction.centerScreen.y,
          pendingClientPoint.x - liveInteraction.centerScreen.x,
        );
        const deltaDegrees = ((currentAngle - liveInteraction.startAngle) * 180) / Math.PI;
        const previewRotation = normalizeAngle(liveInteraction.startRotation + deltaDegrees);
        setInteraction((current) => {
          if (!current || current.kind !== 'rotate') return current;
          return { ...current, previewRotation };
        });
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      pendingClientPointRef.current = { x: event.clientX, y: event.clientY, shiftKey: event.shiftKey };
      if (pointerRafRef.current === null) {
        pointerRafRef.current = window.requestAnimationFrame(flushPointerMove);
      }
    };

    const handleMouseUp = () => {
      const liveInteraction = interactionRef.current;
      if (!liveInteraction) return;

      if (liveInteraction.kind === 'move') {
        creatorActions.updateNodeLayouts(
          Object.fromEntries(
            Object.entries(liveInteraction.liveLayouts).map(([nodeId, layout]) => [nodeId, { x: layout.x, y: layout.y }]),
          ),
        );
      }

      if (liveInteraction.kind === 'resize') {
        creatorActions.resizeNode(liveInteraction.nodeId, {
          width: liveInteraction.previewLayout.width,
          height: liveInteraction.previewLayout.height,
        });
      }

      if (liveInteraction.kind === 'rotate') {
        creatorActions.updateNodeStyle(liveInteraction.nodeId, { rotation: liveInteraction.previewRotation });
      }

      if (liveInteraction.kind === 'marquee') {
        const minX = Math.min(liveInteraction.origin.x, liveInteraction.current.x);
        const minY = Math.min(liveInteraction.origin.y, liveInteraction.current.y);
        const maxX = Math.max(liveInteraction.origin.x, liveInteraction.current.x);
        const maxY = Math.max(liveInteraction.origin.y, liveInteraction.current.y);

        const ids = Object.values(document.nodes)
          .filter((node) => node.id !== document.rootId && !node.hidden)
          .filter((node) => {
            const layout = getNodeAbsoluteLayout(document, node.id);
            return layout.x < maxX && layout.x + layout.width > minX && layout.y < maxY && layout.y + layout.height > minY;
          })
          .map((node) => node.id);

        creatorActions.selectNodes(ids);
      }

      if (liveInteraction.kind === 'create') {
        const nextRect = getCreationRect(liveInteraction.origin, liveInteraction.current);
        creatorActions.insertNode(
          liveInteraction.nodeType,
          { x: nextRect.x, y: nextRect.y },
          undefined,
          { width: snap(nextRect.width), height: snap(nextRect.height) },
        );
      }

      setInteraction(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      if (pointerRafRef.current !== null) {
        window.cancelAnimationFrame(pointerRafRef.current);
        pointerRafRef.current = null;
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [computeSmartSnap, document, frame.layout.height, frame.layout.width, interaction, screenToCanvas, snap, snapEnabled]);

  const selectedAbsolute = selectionIds.length === 1 ? getNodeAbsoluteLayout(document, selectionIds[0]) : null;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-surface-0">
      <div className="flex h-10 flex-shrink-0 items-center gap-2 border-b border-border-subtle bg-surface-2 px-3">
        <div className="flex items-center gap-2 rounded-ui-md border border-border-default bg-surface-1/80 px-2.5 py-1">
          <div className={`flex h-6 w-6 items-center justify-center rounded-ui-sm ${activeTool === 'create' ? 'bg-brand/15 text-brand' : 'bg-surface-2 text-text-secondary'}`}>
            <ActiveToolIcon size={12} />
          </div>
        </div>

        <div className="mx-1 h-5 w-px bg-border-subtle" />

        <div className="flex items-center gap-2">
          <div ref={createMenuRef} className="relative">
            <button
              onClick={() => {
                creatorActions.setActiveTool('create');
                setCreateMenuOpen((current) => !current);
              }}
              className={`flex h-8 items-center gap-2 rounded-ui-md border px-2.5 transition-colors ${
                activeTool === 'create' || createMenuOpen
                  ? 'border-brand/30 bg-brand/10 text-brand'
                  : 'border-border-default bg-surface-1 text-text-primary hover:border-border-strong'
              }`}
              title="Create widget"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-ui-sm bg-white/6">
                <ActiveWidgetIcon size={11} />
              </div>
              <Plus size={10} />
              <ChevronDown size={11} className={`transition-transform ${createMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {createMenuOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-30 rounded-ui-md border border-border-default bg-surface-1/95 p-1.5 shadow-elevation-md backdrop-blur">
                <div className="flex items-center gap-1">
                  {widgetOptions.map((item) => {
                    const ItemIcon = widgetTypeIcons[item.type as keyof typeof widgetTypeIcons];
                    const selected = pendingInsertType === item.type && activeTool === 'create';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          creatorActions.armInsertType(item.type);
                          setCreateMenuOpen(false);
                        }}
                        aria-label={item.label}
                        title={item.label}
                        className={`flex h-9 w-9 items-center justify-center rounded-ui-sm border transition-colors ${
                          selected
                            ? 'border-brand/25 bg-brand/12 text-brand'
                            : 'border-transparent text-text-secondary hover:border-border-default hover:bg-surface-2/70 hover:text-text-primary'
                        }`}
                      >
                        <ItemIcon size={15} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => creatorActions.focusSelection()} className="ui-icon-button h-8 w-8" title="Focus selection">
            <Crosshair size={12} />
          </button>
          <button onClick={() => creatorActions.setZoom(1)} className="ui-icon-button h-8 w-8" title="Reset zoom">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className={`ui-runtime-stage ui-runtime-grid ${
          interaction?.kind === 'pan'
            ? 'cursor-grabbing'
            : activeTool === 'create'
              ? 'cursor-crosshair'
              : spacePressed || activeTool === 'move'
                ? 'cursor-grab'
                : ''
        }`}
        onWheel={(event) => {
          event.preventDefault();
          const direction = event.deltaY > 0 ? -0.08 : 0.08;
          creatorActions.setZoom(viewport.zoom + direction);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setInsertHighlight(true);
        }}
        onDragLeave={() => setInsertHighlight(false)}
        onDrop={(event) => {
          event.preventDefault();
          setInsertHighlight(false);
          const rect = stageRef.current?.getBoundingClientRect();
          if (rect) {
            stageMetricsRef.current = { left: rect.left, top: rect.top };
          }
          const insertType = event.dataTransfer.getData('application/x-creator-insert') as CreatorNode['type'];
          if (!insertType) return;
          const point = screenToCanvas(event.clientX, event.clientY);
          creatorActions.insertNode(insertType, point);
        }}
        onMouseEnter={() => {
          const rect = stageRef.current?.getBoundingClientRect();
          if (rect) {
            stageMetricsRef.current = { left: rect.left, top: rect.top };
          }
        }}
        onMouseMove={(event) => {
          // While an interaction is active, the window-level move handler drives
          // drag/pan/resize updates. Avoid consuming the shared RAF slot here.
          if (interactionRef.current) return;

          pendingClientPointRef.current = { x: event.clientX, y: event.clientY, shiftKey: event.shiftKey };
          if (pointerRafRef.current === null) {
            pointerRafRef.current = window.requestAnimationFrame(() => {
              pointerRafRef.current = null;
              const pending = pendingClientPointRef.current;
              if (!pending) return;
              creatorActions.setCursorCanvasPoint(screenToCanvas(pending.x, pending.y));
            });
          }
        }}
        onMouseLeave={() => creatorActions.setCursorCanvasPoint(null)}
        onMouseDown={(event) => {
          if (previewMode) return;
          const rect = stageRef.current?.getBoundingClientRect();
          if (rect) {
            stageMetricsRef.current = { left: rect.left, top: rect.top };
          }

          const point = screenToCanvas(event.clientX, event.clientY);
          const clickedNode = (event.target as HTMLElement).closest('[data-node-id]');
          if (event.button === 0 && !clickedNode && activeTool === 'create' && pendingInsertType) {
            creatorActions.clearSelection();
            setInteraction({
              kind: 'create',
              nodeType: pendingInsertType,
              origin: point,
              current: point,
            });
            return;
          }

          const shouldPan =
            spacePressed ||
            event.button === 1 ||
            activeTool === 'move' ||
            (event.button === 0 && !clickedNode && !event.shiftKey && activeTool !== 'create');

          if (shouldPan) {
            setInteraction({
              kind: 'pan',
              origin: { x: event.clientX, y: event.clientY },
              panOrigin: { x: viewport.panX, y: viewport.panY },
            });
            return;
          }

          if (!clickedNode && event.shiftKey && activeTool !== 'create') {
            creatorActions.clearSelection();
            setInteraction({ kind: 'marquee', origin: point, current: point });
          }
        }}
      >
        <div className="ui-meta absolute left-4 top-4 text-text-disabled">// Visual canvas</div>

        {editingNodeId && !previewMode && (
          <div className="absolute right-4 top-4 z-30 rounded-ui-md border border-border-default bg-surface-1 px-3 py-1.5 text-ui-xs text-text-secondary shadow-elevation-low">
            Editing text. Press Esc to exit.
          </div>
        )}

        {activeTool === 'create' && !previewMode && (
          <div className="absolute right-4 top-4 z-30 rounded-ui-md border border-brand/25 bg-surface-1/95 px-3 py-1.5 text-ui-xs text-text-secondary shadow-elevation-low">
            {pendingInsertType ? `Drag to create a ${pendingInsertType} widget.` : 'Choose a widget from Insert, then drag on canvas.'}
          </div>
        )}

        <div
          className="absolute"
          style={{
            left: worldOriginX,
            top: worldOriginY,
            transform: `scale(${viewport.zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {!previewMode && (
            <div
              className={`pointer-events-none absolute rounded-[8px] border border-dashed transition-colors ${insertHighlight ? 'border-brand/60 shadow-[0_0_0_1px_rgba(191,31,47,0.35)]' : 'border-border-default/60'}`}
              style={{
                left: 0,
                top: 0,
                width: frame.layout.width,
                height: frame.layout.height,
                background: 'hsl(var(--surface-1) / 0.04)',
              }}
            />
          )}

          {frame.children.map((childId) => (
            <CanvasNode
              key={childId}
              nodeId={childId}
              previewLayout={getPreviewLayout(childId)}
              previewRotation={getPreviewRotation(childId)}
              getPreviewLayout={getPreviewLayout}
              getPreviewRotation={getPreviewRotation}
              onStartMove={(nodeId, event) => {
                event.stopPropagation();

                let ids: string[] = [];
                if (event.shiftKey) {
                  if (selectionIds.includes(nodeId)) {
                    ids = selectionIds.filter((id) => id !== nodeId);
                  } else {
                    ids = [...selectionIds, nodeId];
                  }
                  creatorActions.selectNode(nodeId, true);
                } else {
                  ids = selectionIds.includes(nodeId) ? selectionIds : [nodeId];
                  if (!selectionIds.includes(nodeId)) {
                    creatorActions.selectNode(nodeId);
                  }
                }

                if (!ids.length) {
                  return;
                }

                if (activeTool === 'scale' && ids.length === 1) {
                  const targetId = ids[0];
                  setInteraction({
                    kind: 'resize',
                    nodeId: targetId,
                    handle: 'se',
                    origin: screenToCanvas(event.clientX, event.clientY),
                    startLayout: { ...document.nodes[targetId].layout },
                    previewLayout: { ...document.nodes[targetId].layout },
                  });
                  return;
                }

                const startLayouts = Object.fromEntries(ids.map((id) => [id, { ...document.nodes[id].layout }]));
                setInteraction({
                  kind: 'move',
                  nodeIds: ids,
                  origin: screenToCanvas(event.clientX, event.clientY),
                  startLayouts,
                  liveLayouts: startLayouts,
                  guideX: null,
                  guideY: null,
                });
              }}
              onStartResize={(nodeId, event) => {
                event.stopPropagation();
                creatorActions.selectNode(nodeId);
                setInteraction({
                  kind: 'resize',
                  nodeId,
                  handle: 'se',
                  origin: screenToCanvas(event.clientX, event.clientY),
                  startLayout: { ...document.nodes[nodeId].layout },
                  previewLayout: { ...document.nodes[nodeId].layout },
                });
              }}
              onStartRotate={(nodeId, event) => {
                event.stopPropagation();
                creatorActions.selectNode(nodeId);
                const absolute = getNodeAbsoluteLayout(document, nodeId);
                const stageRect = stageRef.current?.getBoundingClientRect();
                if (!stageRect) return;
                const centerScreen = {
                  x: stageRect.left + worldOriginX + (absolute.x + absolute.width / 2) * viewport.zoom,
                  y: stageRect.top + worldOriginY + (absolute.y + absolute.height / 2) * viewport.zoom,
                };
                const startAngle = Math.atan2(event.clientY - centerScreen.y, event.clientX - centerScreen.x);
                setInteraction({
                  kind: 'rotate',
                  nodeId,
                  centerScreen,
                  startAngle,
                  startRotation: document.nodes[nodeId].style.rotation,
                  previewRotation: document.nodes[nodeId].style.rotation,
                });
              }}
              onDoubleActivate={(nodeId) => {
                const node = document.nodes[nodeId];
                creatorActions.selectNode(nodeId);
                if (isTextualNode(node)) {
                  creatorActions.setEditingNode(nodeId);
                }
              }}
              activeTool={activeTool}
            />
          ))}

          {!previewMode && frame.children.length === 0 && (
            <div
              className="absolute left-1/2 top-1/2 w-[440px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-default bg-surface-1/95 p-6 shadow-elevation-low"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <p className="text-ui-md font-semibold text-text-primary">Start building on the canvas</p>
              <p className="mt-2 text-ui-sm text-text-secondary">
                Drag widgets from Insert or use `+ Create` to draw the exact area before the element is created.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => creatorActions.insertNode('section', { x: 120, y: 120 })} className="ui-button-primary">
                  Add Section
                </button>
                <button onClick={() => creatorActions.insertNode('text', { x: 160, y: 160 })} className="ui-button-secondary">
                  Add Text
                </button>
                <button onClick={() => creatorActions.armInsertType('container')} className="ui-button-secondary">
                  Arm Container
                </button>
                <button onClick={() => creatorActions.toggleCommandPalette(true)} className="ui-button-secondary">
                  Open Command Palette
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedAbsolute && selectionIds.length === 1 && !previewMode && (
          <div
            className="absolute z-20 flex items-center gap-1 rounded-ui-md border border-border-default bg-surface-1 px-2 py-1 shadow-elevation-low"
            style={{
              left: worldOriginX + selectedAbsolute.x * viewport.zoom,
              top: worldOriginY + selectedAbsolute.y * viewport.zoom - 36,
            }}
          >
            <span className="ui-status-meta">x {Math.round(selectedAbsolute.x)}</span>
            <span className="ui-status-meta">y {Math.round(selectedAbsolute.y)}</span>
            <span className="ui-status-meta">w {Math.round(selectedAbsolute.width)}</span>
            <span className="ui-status-meta">h {Math.round(selectedAbsolute.height)}</span>
            <button
              onClick={() => creatorActions.duplicateNode(selectionIds[0])}
              className="flex h-6 w-6 items-center justify-center rounded-ui-sm text-text-muted hover:bg-surface-2 hover:text-text-primary"
            >
              <Copy size={11} />
            </button>
            <button
              onClick={() => creatorActions.deleteNode(selectionIds[0])}
              className="flex h-6 w-6 items-center justify-center rounded-ui-sm text-text-muted hover:bg-surface-2 hover:text-danger"
            >
              <Trash2 size={11} />
            </button>
            <button
              onClick={() => creatorActions.updateNodeLayout(selectionIds[0], { x: 0 })}
              className="flex h-6 w-6 items-center justify-center rounded-ui-sm text-text-muted hover:bg-surface-2 hover:text-text-primary"
            >
              <AlignLeft size={11} />
            </button>
            <button
              onClick={() =>
                creatorActions.updateNodeLayout(selectionIds[0], {
                  x: Math.round(frame.layout.width / 2 - document.nodes[selectionIds[0]].layout.width / 2),
                })
              }
              className="flex h-6 w-6 items-center justify-center rounded-ui-sm text-text-muted hover:bg-surface-2 hover:text-text-primary"
            >
              <AlignCenter size={11} />
            </button>
            <button
              onClick={() =>
                creatorActions.updateNodeLayout(selectionIds[0], {
                  x: Math.round(frame.layout.width - document.nodes[selectionIds[0]].layout.width - 24),
                })
              }
              className="flex h-6 w-6 items-center justify-center rounded-ui-sm text-text-muted hover:bg-surface-2 hover:text-text-primary"
            >
              <AlignRight size={11} />
            </button>
          </div>
        )}

        {selectedAbsolute && selectionIds.length === 1 && !previewMode && isTextualNode(document.nodes[selectionIds[0]]) && editingNodeId !== selectionIds[0] && (
          <div
            className="absolute z-20 rounded-ui-md border border-border-default bg-surface-1 px-2 py-1 text-ui-xs text-text-muted shadow-elevation-low"
            style={{
              left: worldOriginX + selectedAbsolute.x * viewport.zoom,
              top: worldOriginY + (selectedAbsolute.y + selectedAbsolute.height) * viewport.zoom + 8,
            }}
          >
            Double-click to edit text
          </div>
        )}

        {interaction?.kind === 'marquee' && (
          <div
            className="pointer-events-none absolute border border-brand bg-brand/10"
            style={{
              left: worldOriginX + Math.min(interaction.origin.x, interaction.current.x) * viewport.zoom,
              top: worldOriginY + Math.min(interaction.origin.y, interaction.current.y) * viewport.zoom,
              width: Math.abs(interaction.current.x - interaction.origin.x) * viewport.zoom,
              height: Math.abs(interaction.current.y - interaction.origin.y) * viewport.zoom,
            }}
          />
        )}

        {interaction?.kind === 'create' && (
          <div
            className="pointer-events-none absolute border border-dashed border-brand bg-brand/10 shadow-[0_0_0_1px_rgba(191,31,47,0.28)]"
            style={{
              left: worldOriginX + getCreationRect(interaction.origin, interaction.current).x * viewport.zoom,
              top: worldOriginY + getCreationRect(interaction.origin, interaction.current).y * viewport.zoom,
              width: getCreationRect(interaction.origin, interaction.current).width * viewport.zoom,
              height: getCreationRect(interaction.origin, interaction.current).height * viewport.zoom,
            }}
          />
        )}

        {interaction?.kind === 'move' && interaction.nodeIds.length === 1 && (() => {
          const layout = interaction.liveLayouts[interaction.nodeIds[0]];
          const centerX = layout.x + layout.width / 2;
          const centerY = layout.y + layout.height / 2;
          return (
            <>
              {interaction.guideX !== null && (
                <div
                  className="pointer-events-none absolute top-0 w-px bg-brand"
                  style={{ left: worldOriginX + interaction.guideX * viewport.zoom, height: worldOriginY + frame.layout.height * viewport.zoom }}
                />
              )}
              {interaction.guideY !== null && (
                <div
                  className="pointer-events-none absolute left-0 h-px bg-brand"
                  style={{ top: worldOriginY + interaction.guideY * viewport.zoom, width: worldOriginX + frame.layout.width * viewport.zoom }}
                />
              )}
              {Math.abs(centerX - frame.layout.width / 2) < 12 && (
                <div className="pointer-events-none absolute top-0 w-px bg-brand/60" style={{ left: worldOriginX + (frame.layout.width / 2) * viewport.zoom, height: frame.layout.height * viewport.zoom + worldOriginY }} />
              )}
              {Math.abs(centerY - frame.layout.height / 2) < 12 && (
                <div className="pointer-events-none absolute left-0 h-px bg-brand/60" style={{ top: worldOriginY + (frame.layout.height / 2) * viewport.zoom, width: frame.layout.width * viewport.zoom + worldOriginX }} />
              )}
            </>
          );
        })()}

        <div className="absolute bottom-4 right-4 flex items-center gap-1">
          {['25%', '50%', '75%', '100%', '150%'].map((zoomLabel) => {
            const value = Number.parseInt(zoomLabel, 10) / 100;
            return (
              <button
                key={zoomLabel}
                onClick={() => creatorActions.setZoom(value)}
                className={`rounded-ui-sm border px-2 py-1 font-mono text-ui-xs transition-colors ${
                  Math.abs(viewport.zoom - value) < 0.001
                    ? 'border-brand/40 bg-brand/10 text-brand'
                    : 'border-border-default text-text-disabled hover:border-border-strong hover:text-text-secondary'
                }`}
              >
                {zoomLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CreatorCanvas;

