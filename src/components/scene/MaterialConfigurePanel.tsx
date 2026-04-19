import { useState } from 'react';
import { Eye, Lock, ChevronDown } from 'lucide-react';
import { tokenColors } from '../../utils/designTokens';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface PbrSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  color?: string;
}

const PbrSlider = ({ label, value, min = 0, max = 1, color = tokenColors.teal }: PbrSliderProps) => {
  const [val] = useState(value);
  const pct = ((val - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="ui-label w-28 flex-shrink-0">{formatUiLabel(label)}</span>
      <div className="ui-slider-track flex-1">
        <div className="ui-slider-fill" style={{ width: `${pct}%`, backgroundColor: color }}></div>
        <div className="ui-slider-thumb cursor-ew-resize" style={{ left: `calc(${pct}% - 6px)` }}></div>
      </div>
      <div className="ui-field-shell-compact w-14 justify-center">
        <span className="font-mono text-ui-xs text-text-primary">{val.toFixed(2)}</span>
      </div>
    </div>
  );
};

interface ColorFieldProps {
  label: string;
  hex: string;
}

const ColorField = ({ label, hex }: ColorFieldProps) => (
  <div className="flex items-center gap-3">
    <span className="ui-label w-28 flex-shrink-0">{formatUiLabel(label)}</span>
    <div className="ui-field-shell flex-1 py-1.5">
      <div className="h-4 w-4 flex-shrink-0 rounded-ui-xs border border-border-default" style={{ backgroundColor: hex }}></div>
      <span className="font-mono text-ui-xs text-text-primary">{hex}</span>
    </div>
  </div>
);

interface SectionBlockProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SectionBlock = ({ title, children, defaultOpen = true }: SectionBlockProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="ui-panel-section">
      <div className="ui-panel-section-trigger cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="h-3 w-0.5 rounded-ui-sm bg-brand"></div>
        <ChevronDown size={10} className={`flex-shrink-0 text-text-muted transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="ui-section-heading flex-1">{formatUiLabel(title)}</span>
        <Eye size={11} className="cursor-pointer text-text-muted transition-colors hover:text-text-secondary" />
        <Lock size={11} className="cursor-pointer text-text-muted transition-colors hover:text-text-secondary" />
      </div>
      {open && <div className="ui-panel-section-body space-y-3">{children}</div>}
    </div>
  );
};

interface MaterialConfigurePanelProps {
  materialName?: string;
  onBackToLibrary?: () => void;
}

const MaterialConfigurePanel = ({ materialName = 'Head', onBackToLibrary }: MaterialConfigurePanelProps) => (
  <div className="flex h-full flex-col overflow-hidden">
    <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
      <div className="h-4 w-0.5 rounded-ui-sm bg-brand"></div>
      <span className="ui-panel-title">Material: {formatUiLabel(materialName)}</span>
      <button
        className="ml-auto rounded-ui-sm border border-border-default bg-surface-2 px-3 py-1 text-ui-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
        onClick={onBackToLibrary}
      >
        Back to library
      </button>
      <button className="flex h-6 w-6 items-center justify-center rounded-ui-sm border border-border-subtle text-text-disabled transition-colors hover:border-border-default hover:text-text-secondary">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>

    <div className="flex-1 overflow-y-auto">
      <SectionBlock title="Surface config">
        <ColorField label="Base tint" hex="#2A2A2A" />
        <PbrSlider label="Metalness" value={0.7} />
        <PbrSlider label="Roughness" value={0.45} />
      </SectionBlock>

      <SectionBlock title="Optics and refinement">
        <PbrSlider label="Hdr intensity" value={1} />
        <PbrSlider label="Transmission" value={0} />
        <div className="flex items-center gap-3">
          <span className="ui-label w-28 flex-shrink-0">Alpha blend</span>
          <div className="ui-toggle-track">
            <span className="ui-toggle-thumb" />
          </div>
        </div>
        <PbrSlider label="Opacity" value={1} />
        <PbrSlider label="Clearcoat" value={0} />
      </SectionBlock>

      <SectionBlock title="Luminance">
        <ColorField label="Emissive" hex={tokenColors.charcoal} />
        <PbrSlider label="Glow strength" value={0} color={tokenColors.warning} />
      </SectionBlock>

      <div className="px-4 py-4">
        <div className="ui-note-card">
          <p className="ui-body-copy">
            <span className="font-semibold text-brand">Runtime:</span> Changes to PBR properties are processed in real time. High metallic values depend on the active HDR environment.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default MaterialConfigurePanel;

