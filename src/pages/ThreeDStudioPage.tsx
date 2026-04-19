import { useState, type ReactNode } from 'react';
import { Cpu, Box, Film, Play, Pause, RotateCcw } from 'lucide-react';
import TopBar from '../components/cms/TopBar';
import ObjectHierarchyPanel from '../components/studio/ObjectHierarchyPanel';
import StudioViewport from '../components/studio/StudioViewport';
import ObjectPropertiesPanel from '../components/studio/ObjectPropertiesPanel';
import RenderSettingsPanel from '../components/studio/RenderSettingsPanel';
import AnimationPanel from '../components/studio/AnimationPanel';
import StudioTimeline from '../components/studio/StudioTimeline';
import PageLayout from '../components/layout/PageLayout';
import { formatUiLabel } from '../utils/formatUiLabel';

type RightTab = 'properties' | 'render' | 'animation';

const rightTabs: { id: RightTab; label: string; icon: ReactNode }[] = [
  { id: 'properties', label: 'Properties', icon: <Box size={10} /> },
  { id: 'render', label: 'Render', icon: <Cpu size={10} /> },
  { id: 'animation', label: 'Animation', icon: <Film size={10} /> },
];

const ThreeDStudioPage = () => {
  const [selectedId, setSelectedId] = useState('fuel-head');
  const [rightTab, setRightTab] = useState<RightTab>('properties');
  const [showTimeline, setShowTimeline] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedLabel = formatUiLabel(selectedId);

  const handleTabChange = (tab: RightTab) => {
    setRightTab(tab);
    if (tab === 'animation') {
      setShowTimeline(true);
    }
  };

  const topBar = (
    <TopBar module="BOLD" subModule="3D PIPELINE" activeSection="3D STUDIO" applyLabel="Save Scene">
      <div className="flex items-center gap-0.5 rounded-ui-sm border border-border-default bg-surface-0/60 p-0.5">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Stop' : 'Play Animation'}
          className={`flex h-6 w-6 items-center justify-center rounded-sm transition-colors ${isPlaying ? 'bg-brand/15 text-brand' : 'text-text-muted hover:text-text-primary'}`}
        >
          {isPlaying ? <Pause size={11} /> : <Play size={11} />}
        </button>
      </div>
      <button className="ui-button-ghost" title="Reset Transform">
        <RotateCcw size={11} />
      </button>
    </TopBar>
  );

  const leftPanel = <ObjectHierarchyPanel selectedId={selectedId} onSelect={setSelectedId} />;

  const mainContent = (
    <div className="flex-1 overflow-hidden bg-surface-0">
      <StudioViewport activeObject={selectedLabel} />
    </div>
  );

  const rightPanel = (
    <>
      <div className="flex flex-shrink-0 border-b border-border-subtle">
        {rightTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`ui-tab flex-1 justify-center py-2 ${rightTab === tab.id ? 'ui-tab-active text-brand' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {tab.icon}
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {rightTab === 'properties' && <ObjectPropertiesPanel selectedId={selectedId} />}
        {rightTab === 'render' && <RenderSettingsPanel />}
        {rightTab === 'animation' && <AnimationPanel />}
      </div>
    </>
  );

  const middleContent = showTimeline ? <StudioTimeline /> : null;

  const bottomBar = (
    <>
      <div className="flex items-center gap-1.5">
        <div className={`ui-status-dot ${isPlaying ? 'bg-brand animate-pulse' : 'bg-success'}`}></div>
        <span className="ui-status-value">{isPlaying ? 'Playing' : 'Rendering'}</span>
      </div>

      <div className="ui-status-separator"></div>

      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Object:</span>
        <span className="font-mono text-[10px] text-text-primary">{selectedLabel}</span>
      </div>

      <div className="ui-status-separator"></div>

      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Render:</span>
        <span className="font-mono text-[10px] text-brand">PBR</span>
      </div>

      <div className="ui-status-separator"></div>

      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Objects:</span>
        <span className="ui-status-value">12 Meshes</span>
      </div>

      <div className="ui-status-separator"></div>

      <button
        onClick={() => setShowTimeline(!showTimeline)}
        className={`inline-flex items-center gap-1 rounded-ui-sm px-2 py-1 text-[10px] font-medium transition-colors ${
          showTimeline
            ? 'border border-brand/40 bg-brand/20 text-brand'
            : 'border border-border-default bg-surface-2 text-text-muted hover:text-text-primary'
        }`}
      >
        <Film size={9} />
        <span>Timeline: {showTimeline ? 'On' : 'Off'}</span>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-[9px] text-text-disabled">Frame: 0 / 240</span>
      </div>
    </>
  );

  return <PageLayout topBar={topBar} leftPanel={leftPanel} mainContent={mainContent} rightPanel={rightPanel} bottomBar={bottomBar} middleContent={middleContent} />;
};

export default ThreeDStudioPage;
