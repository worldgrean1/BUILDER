import PageLayout from '../components/layout/PageLayout';
import CreatorCanvas from '@/features/creator/components/CreatorCanvas';
import CreatorCommandPalette from '@/features/creator/components/CreatorCommandPalette';
import CreatorInspector from '@/features/creator/components/CreatorInspector';
import CreatorSidebar from '@/features/creator/components/CreatorSidebar';
import CreatorTopBar from '@/features/creator/components/CreatorTopBar';
import { useCreatorStore } from '@/features/creator/store';
import { SettingsModal } from '@/features/settings/components/SettingsModal';

const CreatorPage = () => {
  const dirty = useCreatorStore((state) => state.dirty);
  const document = useCreatorStore((state) => state.document);
  const selectionIds = useCreatorStore((state) => state.selectionIds);

  const selectedLabel = selectionIds.length === 0
    ? 'Canvas'
    : selectionIds.length === 1
      ? document.nodes[selectionIds[0]]?.name ?? '—'
      : `${selectionIds.length} selected`;

  const nodeCount = Object.keys(document.nodes).length - 1;

  const bottomBar = (
    <>
      <div className="flex items-center gap-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-warning animate-pulse' : 'bg-success'}`} />
        <span className="text-[10px] text-text-muted">{dirty ? 'Editing' : 'Synced'}</span>
      </div>

      <div className="h-3 w-px bg-border-subtle" />

      <span className="text-[10px] text-text-disabled">
        {document.nodes[document.rootId].layout.width}×{document.nodes[document.rootId].layout.height}
      </span>

      <div className="h-3 w-px bg-border-subtle" />

      <span className="text-[10px] text-text-muted">{selectedLabel}</span>

      <div className="h-3 w-px bg-border-subtle" />

      <span className="text-[10px] text-text-disabled">{nodeCount} nodes</span>

      <div className="ml-auto">
        <span className="text-[9px] text-text-disabled">⌘K command palette</span>
      </div>
    </>
  );

  return (
    <>
      <PageLayout
        topBar={<CreatorTopBar />}
        leftPanel={<CreatorSidebar />}
        mainContent={<CreatorCanvas />}
        rightPanel={<CreatorInspector />}
        bottomBar={bottomBar}
      />
      <CreatorCommandPalette />
      <SettingsModal />
    </>
  );
};

export default CreatorPage;
