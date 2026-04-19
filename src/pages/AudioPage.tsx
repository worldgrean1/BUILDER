import { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import TopBar from '../components/cms/TopBar';
import AudioSystemPanel from '../components/audio/AudioSystemPanel';
import SpatialAudioInspector from '../components/audio/SpatialAudioInspector';
import MixerTimeline from '../components/audio/MixerTimeline';
import PageLayout from '../components/layout/PageLayout';

const AudioPage = () => {
  const [selectedFeature, setSelectedFeature] = useState('ambient');
  const [isPlaying, setIsPlaying] = useState(false);

  const topBar = (
    <TopBar module="BOLD" subModule="SPATIAL" activeSection="AUDIO" applyLabel="Apply Audio">
      <div className="flex items-center gap-0.5 rounded-ui-sm border border-border-default bg-surface-0/60 p-0.5">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Stop' : 'Play All'}
          className={`flex h-6 w-6 items-center justify-center rounded-sm transition-colors ${isPlaying ? 'bg-danger/15 text-danger' : 'text-text-muted hover:text-text-primary'}`}
        >
          {isPlaying ? <Pause size={11} /> : <Play size={11} />}
        </button>
        <button title="Master Volume" className="flex h-6 w-6 items-center justify-center rounded-sm text-text-muted hover:text-text-primary">
          <Volume2 size={11} />
        </button>
      </div>
    </TopBar>
  );

  const leftPanel = <AudioSystemPanel selectedFeature={selectedFeature} onSelectFeature={setSelectedFeature} />;

  const mainContent = (
    <div className="ui-runtime-stage">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center ui-animate-in">
          <div className="ui-section-kicker mb-2">Audio Preview</div>
          <div className="ui-meta mb-3">Spatial audio viewport</div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-ui-md border border-danger/25 bg-danger/10 px-3 py-1.5 font-mono text-ui-xs font-medium text-danger">
            <div className="h-1.5 w-1.5 rounded-ui-sm bg-danger animate-pulse"></div>
            <span>0.0%</span>
          </div>
          <div className="mt-2 flex justify-center gap-0.5 opacity-30">
            {Array.from({ length: 32 }).map((_, index) => (
              <div
                key={index}
                className="w-1.5 rounded-t-sm bg-brand/60 desktop-xl:w-2"
                style={{ height: `${Math.sin(index * 0.5) * 20 + 24}px` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const rightPanel = <SpatialAudioInspector />;

  const middleContent = <MixerTimeline />;

  const bottomBar = (
    <>
      <div className="flex items-center gap-1.5">
        <div className={`ui-status-dot ${isPlaying ? 'bg-danger animate-pulse' : 'bg-success'}`}></div>
        <span className="ui-status-value">{isPlaying ? 'Recording' : 'Ready'}</span>
      </div>

      <div className="ui-status-separator"></div>

      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Tracks:</span>
        <span className="font-mono text-[10px] text-text-primary">4 Active</span>
      </div>

      <div className="ui-status-separator"></div>

      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Sample rate:</span>
        <span className="font-mono text-[10px] text-brand">48 kHz</span>
      </div>

      <div className="ui-status-separator"></div>

      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Spatial:</span>
        <span className="ui-status-value">3D Positional</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-[9px] text-text-disabled">Buffer: 512 samples</span>
      </div>
    </>
  );

  return <PageLayout topBar={topBar} leftPanel={leftPanel} mainContent={mainContent} rightPanel={rightPanel} bottomBar={bottomBar} middleContent={middleContent} />;
};

export default AudioPage;
