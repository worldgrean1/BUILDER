import { useState } from 'react';
import { RotateCcw, Download } from 'lucide-react';
import TopBar from '../components/cms/TopBar';
import ScrollBar from '../components/cms/ScrollBar';
import SceneNavigationTree from '../components/scene/SceneNavigationTree';
import SceneMaterialInspector from '../components/scene/SceneMaterialInspector';
import PageLayout from '../components/layout/PageLayout';
import { formatUiLabel } from '../utils/formatUiLabel';

const ScenePage = () => {
  const [selectedMesh, setSelectedMesh] = useState('fuel-head');

  const topBar = (
    <TopBar module="BOLD" subModule="MATERIALS" activeSection="SCENE" applyLabel="Apply Scene">
      <button className="ui-button-ghost" title="Reset Materials">
        <RotateCcw size={11} />
      </button>
      <button className="ui-button-ghost" title="Export Scene">
        <Download size={11} />
      </button>
    </TopBar>
  );

  const leftPanel = <SceneNavigationTree selectedId={selectedMesh} onSelect={setSelectedMesh} />;

  const mainContent = (
    <div className="ui-runtime-stage ui-runtime-grid">
      <div className="text-center ui-animate-in">
        <div className="ui-section-kicker mb-2">3D Scene Preview</div>
        <div className="ui-meta mb-3">Material & mesh viewport</div>
        <div className="ui-badge-brand">
          <div className="h-1.5 w-1.5 rounded-ui-sm bg-brand animate-pulse"></div>
          <span>0.0% Scroll</span>
        </div>
      </div>

      {/* Axis gizmo */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1">
        {['X', 'Y', 'Z'].map((axis, index) => (
          <div key={axis} className="flex items-center gap-1.5">
            <div className={`h-0.5 w-3 rounded-ui-sm ${index === 0 ? 'bg-danger' : index === 1 ? 'bg-success' : 'bg-info'}`}></div>
            <span className="text-[9px] font-mono text-text-disabled">{axis}</span>
          </div>
        ))}
      </div>

      {/* Scene info overlay */}
      <div className="ui-viewport-overlay top-3 right-3 flex-col !items-start !gap-0.5">
        <div className="text-[9px]">CAM: Perspective</div>
        <div className="text-[9px]">Render: PBR</div>
        <div className="text-[9px]">Mesh: {formatUiLabel(selectedMesh)}</div>
      </div>
    </div>
  );

  const rightPanel = <SceneMaterialInspector />;

  const middleContent = <ScrollBar value={0} />;

  const bottomBar = (
    <>
      <div className="flex items-center gap-1.5">
        <div className="ui-status-dot bg-success animate-pulse"></div>
        <span className="ui-status-value">Scene ready</span>
      </div>
      <div className="ui-status-separator"></div>
      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Mesh:</span>
        <span className="ui-status-meta">{formatUiLabel(selectedMesh)}</span>
      </div>
      <div className="ui-status-separator"></div>
      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Render:</span>
        <span className="font-mono text-[10px] text-brand">PBR</span>
      </div>
      <div className="ui-status-separator"></div>
      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Materials:</span>
        <span className="ui-status-value">5 Active</span>
      </div>
      <div className="ml-auto">
        <span className="text-[9px] text-text-disabled">Vertices: 12.4K</span>
      </div>
    </>
  );

  return <PageLayout topBar={topBar} leftPanel={leftPanel} mainContent={mainContent} rightPanel={rightPanel} bottomBar={bottomBar} middleContent={middleContent} />;
};

export default ScenePage;
