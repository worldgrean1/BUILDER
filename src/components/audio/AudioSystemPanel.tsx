import type { ReactNode } from 'react';
import { Volume2, Music, Layers, Speaker, Activity } from 'lucide-react';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface FeatureItem {
  id: string;
  icon: ReactNode;
  label: string;
  sublabel: string;
  active?: boolean;
}

const features: FeatureItem[] = [
  { id: 'waypoints', icon: <Music size={13} />, label: 'WAYPOINTS', sublabel: 'SCROLL TRIGGERS', active: false },
  { id: 'ambient', icon: <Activity size={13} />, label: 'AMBIENT', sublabel: 'BACKGROUND LOOP', active: true },
  { id: 'volume', icon: <Volume2 size={13} />, label: 'VOLUME', sublabel: 'GLOBAL MASTER', active: false },
  { id: 'spatial', icon: <Layers size={13} />, label: 'SPATIAL DEPTH', sublabel: 'DISTANCE RANGE', active: false },
];

interface AudioSystemPanelProps {
  selectedFeature?: string;
  onSelectFeature?: (id: string) => void;
}

const AudioSystemPanel = ({ selectedFeature = 'ambient', onSelectFeature }: AudioSystemPanelProps) => (
  <div className="ui-panel-shell w-full flex-shrink-0">
    <div className="ui-tree-header">
      <span className="ui-tree-header-label">Audio System</span>
    </div>

    <div className="p-4 border-b border-border-subtle">
      <div className="ui-card p-4 cursor-pointer hover:border-border-strong transition-colors">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 bg-brand/10 border border-brand/20 rounded-ui-sm flex items-center justify-center">
            <Speaker size={12} className="text-brand" />
          </div>
          <span className="ui-section-heading">Spatial Audio Engine</span>
        </div>
        <p className="ui-body-copy leading-relaxed">Audio waypoints, soundscapes, and scroll triggers synced to 3D.</p>
      </div>
    </div>

    <div className="ui-tree-header">
      <span className="ui-tree-header-label">Features</span>
    </div>

    <div className="flex-1 overflow-y-auto py-1">
      {features.map((f) => (
        <div
          key={f.id}
          className={`ui-tree-row px-4 ${f.id === selectedFeature ? 'ui-tree-row-selected' : ''}`}
          onClick={() => onSelectFeature && onSelectFeature(f.id)}
        >
          <span className={`flex-shrink-0 ${f.id === selectedFeature ? 'text-brand' : 'text-text-muted'}`}>
            {f.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className={`ui-tree-label ${f.id === selectedFeature ? 'text-text-primary' : 'text-text-secondary'}`}>
              {formatUiLabel(f.label)}
            </div>
            <div className="ui-tree-meta">{formatUiLabel(f.sublabel)}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AudioSystemPanel;
