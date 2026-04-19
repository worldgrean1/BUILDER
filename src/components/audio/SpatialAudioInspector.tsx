import { useState } from 'react';
import { Volume2, Eye, Lock, ChevronDown } from 'lucide-react';
import { tokenColors } from '../../utils/designTokens';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface GainSliderProps {
  label: string;
  value: number;
}

const GainSlider = ({ label, value }: GainSliderProps) => {
  const [val] = useState(value);
  const pct = val * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="ui-label w-24 flex-shrink-0 truncate">{formatUiLabel(label)}</span>
      <div className="ui-slider-track flex-1 cursor-ew-resize">
        <div
          className="ui-slider-fill"
          style={{ width: `${pct}%`, backgroundColor: tokenColors.info }}
        ></div>
        <div
          className="ui-slider-thumb"
          style={{ left: `calc(${pct}% - 6px)` }}
        ></div>
      </div>
      <div className="ui-field-shell-compact w-14 justify-center">
        <span className="font-mono text-ui-xs text-text-primary">{val.toFixed(2)}</span>
      </div>
    </div>
  );
};

interface InspectorSectionProps {
  title: string;
  children: React.ReactNode;
}

const InspectorSection = ({ title, children }: InspectorSectionProps) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="ui-panel-section">
      <div
        className="ui-panel-section-trigger cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="w-0.5 h-3 bg-brand rounded-ui-sm flex-shrink-0"></div>
        <ChevronDown
          size={10}
          className={`text-text-muted transition-transform flex-shrink-0 ${open ? '' : '-rotate-90'}`}
        />
        <span className="ui-section-heading flex-1">{formatUiLabel(title)}</span>
        <Eye size={11} className="text-text-muted hover:text-text-secondary cursor-pointer transition-colors" />
        <Lock size={11} className="text-text-muted hover:text-text-secondary cursor-pointer transition-colors" />
      </div>
      {open && (
        <div className="ui-panel-section-body space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

const SpatialAudioInspector = () => (
  <div className="flex flex-col h-full overflow-hidden">
    <div className="ui-panel-header">
      <span className="ui-panel-title">Spatial Audio Engine</span>
      <div className="ui-field-shell-compact">
        <span className="font-mono text-ui-micro text-text-muted">ID: AUD_01</span>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-4">
        <div className="w-8 h-8 bg-brand/10 border border-brand/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Volume2 size={15} className="text-brand" />
        </div>
        <div>
          <div className="ui-section-heading">Spatial Audio Engine</div>
          <div className="ui-meta mt-0.5">Audio waypoints, soundscapes, and scroll triggers synced to 3D.</div>
        </div>
      </div>

      <InspectorSection title="Master gains">
        <GainSlider label="Engine master" value={0.8} />
      </InspectorSection>

      <InspectorSection title="Persistence">
        <div className="ui-field-shell justify-center gap-2 py-3">
          <div className="w-1.5 h-1.5 rounded-ui-sm bg-success"></div>
          <span className="text-ui-sm font-medium text-text-secondary">Synced</span>
        </div>
      </InspectorSection>

      <div className="px-4 py-4">
        <div className="ui-note-card">
          <p className="ui-body-copy">
            <span className="font-semibold text-brand">System:</span> Spatial audio parameters are synced to the 3D runtime in real time. Use the bottom timeline for clip placement.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default SpatialAudioInspector;

