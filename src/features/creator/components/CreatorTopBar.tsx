import { CheckCircle2, ChevronRight, Eye, EyeOff, Frame, History, Magnet, MousePointer2, Move, Plus, Redo2, Save, Scaling, Search, Settings, Undo2 } from 'lucide-react';
import { useMemo } from 'react';
import { CREATOR_FRAME_PRESETS } from '@/features/creator/mockDocument';
import { creatorActions, useCreatorStore } from '@/features/creator/store';
import { settingsActions } from '@/features/settings/settingsStore';

const tools = [
  { id: 'select', icon: MousePointer2, tip: 'Select (V)' },
  { id: 'create', icon: Plus, tip: 'Create (+)' },
  { id: 'move', icon: Move, tip: 'Move (G)' },
  { id: 'scale', icon: Scaling, tip: 'Scale (S)' },
] as const;

const CreatorTopBar = () => {
  const activeTool = useCreatorStore((state) => state.activeTool);
  const framePreset = useCreatorStore((state) => state.viewport.framePreset);
  const previewMode = useCreatorStore((state) => state.previewMode);
  const canUndo = useCreatorStore((state) => state.past.length > 0);
  const canRedo = useCreatorStore((state) => state.future.length > 0);
  const dirty = useCreatorStore((state) => state.dirty);
  const lastSavedAt = useCreatorStore((state) => state.lastSavedAt);
  const snapEnabled = useCreatorStore((state) => state.snapEnabled);
  const selectionIds = useCreatorStore((state) => state.selectionIds);
  const document = useCreatorStore((state) => state.document);

  const breadcrumb = useMemo(() => {
    if (selectionIds.length === 0) return ['Canvas'];
    if (selectionIds.length > 1) return [`${selectionIds.length} selected`];
    const path: string[] = [];
    let currentId: string | null = selectionIds[0];
    while (currentId) {
      const node = document.nodes[currentId];
      if (!node) break;
      path.unshift(node.name);
      currentId = node.parentId;
    }
    return path;
  }, [document.nodes, selectionIds]);

  const savedLabel = dirty
    ? 'Unsaved'
    : lastSavedAt
      ? `${Math.max(0, Math.round((Date.now() - lastSavedAt) / 60000))}m`
      : '—';

  return (
    <div className="ui-topbar min-w-0 overflow-x-auto overflow-y-hidden">
      {/* ── Tools ── */}
      <div className="flex items-center rounded-ui-sm border border-border-default bg-surface-0/60 p-0.5">
        {tools.map(({ id, icon: Icon, tip }) => (
          <button
            key={id}
            onClick={() => creatorActions.setActiveTool(id)}
            title={tip}
            className={`flex h-7 w-7 items-center justify-center rounded-ui-sm transition-colors ${
              activeTool === id ? 'bg-brand text-white shadow-elevation-low' : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
            }`}
          >
            <Icon size={13} strokeWidth={activeTool === id ? 2 : 1.6} />
          </button>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="mx-1 hidden h-5 w-px bg-border-subtle lg:block" />

      {/* ── Breadcrumb ── */}
      <div className="hidden items-center gap-1 text-ui-xs lg:flex">
        {breadcrumb.map((segment, index) => (
          <span key={`${segment}-${index}`} className="flex items-center gap-1">
            {index > 0 && <ChevronRight size={10} className="text-text-disabled" />}
            <span className={index === breadcrumb.length - 1 ? 'font-medium text-text-primary' : 'text-text-muted'}>
              {segment}
            </span>
          </span>
        ))}
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Frame Preset ── */}
      <div className="hidden items-center gap-1.5 rounded-ui-sm border border-border-default bg-surface-0/60 px-2 py-0.5 md:flex">
        <Frame size={11} className="text-text-muted" />
        <select
          value={framePreset}
          onChange={(event) => creatorActions.setFramePreset(event.target.value)}
          className="bg-transparent text-ui-xs text-text-primary outline-none"
        >
          {CREATOR_FRAME_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id} className="bg-surface-1 text-text-primary">
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Toggle Group ── */}
      <div className="flex items-center gap-0.5 rounded-ui-sm border border-border-default bg-surface-0/60 p-0.5">
        <button
          onClick={() => creatorActions.setPreviewMode(!previewMode)}
          title={previewMode ? 'Exit Preview' : 'Preview'}
          className={`flex h-7 w-7 items-center justify-center rounded-ui-sm transition-colors ${
            previewMode ? 'bg-brand/15 text-brand' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {previewMode ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        <button
          onClick={() => creatorActions.setSnapEnabled(!snapEnabled)}
          title={snapEnabled ? 'Disable Snap' : 'Enable Snap'}
          className={`flex h-7 w-7 items-center justify-center rounded-ui-sm transition-colors ${
            snapEnabled ? 'bg-brand/15 text-brand' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {snapEnabled ? <Magnet size={13} /> : <Magnet size={13} />}
        </button>
        <button
          onClick={() => creatorActions.toggleCommandPalette(true)}
          title="Command Palette (⌘K)"
          className="flex h-7 w-7 items-center justify-center rounded-ui-sm text-text-muted hover:text-text-primary"
        >
          <Search size={13} />
        </button>
        <button
          onClick={() => settingsActions.toggleSettingsPanel(true)}
          title="Settings"
          className="flex h-7 w-7 items-center justify-center rounded-ui-sm text-text-muted hover:text-text-primary hidden md:flex"
        >
          <Settings size={13} />
        </button>
      </div>

      {/* ── Undo / Redo ── */}
      <div className="flex items-center gap-0.5 rounded-ui-sm border border-border-default bg-surface-0/60 p-0.5">
        <button
          onClick={() => creatorActions.undo()}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          className="flex h-7 w-7 items-center justify-center rounded-ui-sm text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Undo2 size={13} />
        </button>
        <button
          onClick={() => creatorActions.redo()}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          className="flex h-7 w-7 items-center justify-center rounded-ui-sm text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Redo2 size={13} />
        </button>
      </div>

      {/* ── Save ── */}
      <button onClick={() => creatorActions.saveDraft()} className="ui-button-primary whitespace-nowrap" title="Save Draft">
        <Save size={11} />
        <span className="hidden sm:inline">Save</span>
      </button>

      {/* ── Save Status ── */}
      <div className={`hidden items-center gap-1.5 rounded-ui-sm px-2 py-1 text-ui-xs font-medium xl:flex ${dirty ? 'text-warning' : 'text-success'}`}>
        <CheckCircle2 size={10} />
        <span>{savedLabel}</span>
      </div>
    </div>
  );
};

export default CreatorTopBar;
