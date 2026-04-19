import { Plus, RefreshCw, Link, Layers, Play, Pause, SkipForward } from 'lucide-react';
import { useState } from 'react';
import TopBar from '../components/cms/TopBar';
import ScrollBar from '../components/cms/ScrollBar';
import CameraNavigationTree from '../components/camera/CameraNavigationTree';
import LiveTelemetry from '../components/camera/LiveTelemetry';
import KeyframeCard, { CollapsedKeyframe } from '../components/camera/KeyframeCard';
import PageLayout from '../components/layout/PageLayout';

const CameraPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const topBar = (
    <TopBar module="BOLD" subModule="INTELLIGENCE" activeSection="CAMERA" applyLabel="Apply Camera">
      <div className="flex items-center gap-0.5 rounded-ui-sm border border-border-default bg-surface-0/60 p-0.5">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause' : 'Play'}
          className={`flex h-6 w-6 items-center justify-center rounded-sm transition-colors ${isPlaying ? 'bg-brand/15 text-brand' : 'text-text-muted hover:text-text-primary'}`}
        >
          {isPlaying ? <Pause size={11} /> : <Play size={11} />}
        </button>
        <button title="Next Keyframe" className="flex h-6 w-6 items-center justify-center rounded-sm text-text-muted hover:text-text-primary">
          <SkipForward size={11} />
        </button>
      </div>
      <button className="ui-button-ghost" title="Reset Camera">
        <RefreshCw size={11} />
      </button>
    </TopBar>
  );

  const leftPanel = <CameraNavigationTree />;

  const mainContent = (
    <div className="ui-runtime-stage ui-runtime-grid">
      <div className="text-center ui-animate-in">
        <div className="ui-section-kicker mb-2">Camera Preview</div>
        <div className="ui-meta mb-3">3D camera viewport</div>
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

      {/* Camera info overlay */}
      <div className="ui-viewport-overlay top-3 right-3 flex-col !items-start !gap-0.5">
        <div className="text-[9px]">CAM: Perspective</div>
        <div className="text-[9px]">FOV: 50°</div>
        <div className="text-[9px]">Orbit: 260°</div>
      </div>
    </div>
  );

  const rightPanel = (
    <>
      <div className="ui-panel-header">
        <span className="ui-panel-title">Camera Architect</span>
        <span className="ui-badge-teal">Live</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <LiveTelemetry />

        <div className="border-b border-border-subtle">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Layers size={10} className="text-brand" />
              <span className="text-[10px] font-semibold text-text-muted tracking-wider uppercase">Timeline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="ui-button-primary px-2 py-1 h-auto text-[9px]">
                <Plus size={8} /> Keyframe
              </button>
              <button className="ui-icon-button h-6 w-6">
                <RefreshCw size={9} />
              </button>
            </div>
          </div>

          <KeyframeCard
            index={1}
            tag="ENTRY"
            title="Wide Hero Pose"
            expanded={true}
            scroll="0"
            orbit="260"
            pitch="85"
            dist="7"
            fov="50"
            ease="DRAMATIC"
            target="center (Scene Offline)"
            vel="VEL: 1.4x"
            push="PUSH: 70%"
            catmull="CATMULL-ROM"
          />

          <CollapsedKeyframe index={2} tag="TRANSITION" title="Slow Dolly Forward" s="3%" o="5.9" dist="276 deg" target="center" />
          <CollapsedKeyframe index={3} tag="TRANSITION" title="Subtle Orbit" s="5%" o="6.9" dist="300 deg" target="center" />
          <CollapsedKeyframe index={4} tag="FOCUS" title="Focus Detail" s="8%" o="2.5" dist="289 deg" target="Fuel head" />
          <CollapsedKeyframe index={5} tag="EXIT" title="Transition to S2" s="9%" o="6.8" dist="300 deg" target="Fuel head" />
        </div>

        <div className="border-b border-border-subtle">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <Link size={10} className="text-brand" />
            <span className="text-[10px] font-semibold text-text-muted tracking-wider uppercase">Overlay Analytics</span>
          </div>
          <div className="space-y-1.5 px-3 pb-2.5">
            <div className="ui-card-muted flex items-center justify-between px-2.5 py-1.5">
              <span className="text-[10px] font-semibold text-brand">Hero Overlay (Z6)</span>
              <span className="text-[9px] font-mono text-text-disabled">S1 Primary</span>
            </div>
            <div className="ui-card-muted px-2.5 py-1.5">
              <span className="text-[10px] font-semibold text-text-secondary">3D Attachment Anchor</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const middleContent = <ScrollBar value={0} />;

  const bottomBar = (
    <>
      <div className="flex items-center gap-1.5">
        <div className={`ui-status-dot ${isPlaying ? 'bg-brand animate-pulse' : 'bg-success'}`}></div>
        <span className="ui-status-value">{isPlaying ? 'Playing' : 'Ready'}</span>
      </div>
      <div className="ui-status-separator"></div>
      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Keyframes:</span>
        <span className="ui-status-meta">5</span>
      </div>
      <div className="ui-status-separator"></div>
      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">FOV:</span>
        <span className="font-mono text-[10px] text-brand">50°</span>
      </div>
      <div className="ui-status-separator"></div>
      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Mode:</span>
        <span className="ui-status-value">Perspective</span>
      </div>
      <div className="ml-auto">
        <span className="text-[9px] text-text-disabled">Scroll: 0.0%</span>
      </div>
    </>
  );

  return <PageLayout topBar={topBar} leftPanel={leftPanel} mainContent={mainContent} rightPanel={rightPanel} bottomBar={bottomBar} middleContent={middleContent} />;
};

export default CameraPage;
