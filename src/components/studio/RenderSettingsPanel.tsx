import { useState, type ReactNode } from 'react';
import { ChevronDown, Eye, Lock, Cpu, Sun, Sliders } from 'lucide-react';
import { formatUiLabel } from '../../utils/formatUiLabel';

const ToggleRow = ({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) => (
  <div className="flex items-center gap-2">
    <span className="ui-label flex-1">{formatUiLabel(label)}</span>
    <button className={`ui-toggle-track ${active ? 'ui-toggle-track-active' : ''}`} onClick={onToggle}>
      <span className={`ui-toggle-thumb ${active ? 'ui-toggle-thumb-active' : ''}`} />
    </button>
  </div>
);

const SelectRow = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex items-center gap-2">
    <span className="ui-label w-20 flex-shrink-0">{formatUiLabel(label)}</span>
    <div className="flex flex-1 flex-wrap gap-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-ui-sm border px-2 py-1 text-ui-micro font-medium transition-colors ${value === option ? 'border-brand/40 bg-brand/10 text-brand' : 'border-border-default bg-surface-0 text-text-disabled hover:border-border-strong hover:text-text-muted'}`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

const SectionBlock = ({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="ui-panel-section">
      <div className="ui-panel-section-trigger cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="h-3 w-0.5 rounded-ui-sm bg-brand"></div>
        <ChevronDown size={9} className={`flex-shrink-0 text-text-muted transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="flex-shrink-0 text-text-muted">{icon}</span>
        <span className="ui-section-heading flex-1">{formatUiLabel(title)}</span>
        <Eye size={10} className="cursor-pointer text-text-muted transition-colors hover:text-text-secondary" />
        <Lock size={10} className="ml-1 cursor-pointer text-text-muted transition-colors hover:text-text-secondary" />
      </div>
      {open && <div className="ui-panel-section-body space-y-2.5">{children}</div>}
    </div>
  );
};

const RenderSettingsPanel = () => {
  const [sampling, setSampling] = useState('High');
  const [lightModel, setLightModel] = useState('PBR');
  const [shadows, setShadows] = useState(true);
  const [ao, setAo] = useState(true);
  const [ssr, setSsr] = useState(false);
  const [bloom, setBloom] = useState(true);
  const [dof, setDof] = useState(false);
  const [motionBlur, setMotionBlur] = useState(false);
  const [outputFormat, setOutputFormat] = useState('EXR');

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2.5">
        <span className="ui-panel-title">Render settings</span>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-ui-sm bg-success animate-pulse"></div>
          <span className="font-mono text-ui-micro text-success">RT active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <SectionBlock title="Engine" icon={<Cpu size={10} />}>
          <SelectRow label="Quality" options={['Low', 'Med', 'High', 'Max']} value={sampling} onChange={setSampling} />
          <SelectRow label="Light" options={['Flat', 'Phong', 'PBR', 'PT']} value={lightModel} onChange={setLightModel} />
          <div className="mt-1 grid grid-cols-2 gap-2">
            {[
              { label: 'Samples', value: '512' },
              { label: 'Bounces', value: '8' },
              { label: 'Tile w', value: '256px' },
              { label: 'Tile h', value: '256px' },
            ].map(({ label, value }) => (
              <div key={label} className="ui-metric-card">
                <div className="font-mono text-ui-micro text-text-muted">{label}</div>
                <div className="mt-0.5 font-mono text-ui-xs text-brand-teal">{value}</div>
              </div>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="Lighting and shadows" icon={<Sun size={10} />}>
          <ToggleRow label="Shadows" active={shadows} onToggle={() => setShadows(!shadows)} />
          <ToggleRow label="Ambient occlusion" active={ao} onToggle={() => setAo(!ao)} />
          <ToggleRow label="Screen space reflections" active={ssr} onToggle={() => setSsr(!ssr)} />
          {shadows && <SelectRow label="Shadow" options={['Soft', 'Hard', 'PCF', 'PCSS']} value="PCF" onChange={() => {}} />}
        </SectionBlock>

        <SectionBlock title="Post fx" icon={<Sliders size={10} />} defaultOpen={false}>
          <ToggleRow label="Bloom" active={bloom} onToggle={() => setBloom(!bloom)} />
          <ToggleRow label="Depth of field" active={dof} onToggle={() => setDof(!dof)} />
          <ToggleRow label="Motion blur" active={motionBlur} onToggle={() => setMotionBlur(!motionBlur)} />
          <ToggleRow label="Chromatic aberration" active={false} onToggle={() => {}} />
          <ToggleRow label="Film grain" active={false} onToggle={() => {}} />
        </SectionBlock>

        <SectionBlock title="Output" icon={<Eye size={10} />} defaultOpen={false}>
          <SelectRow label="Format" options={['PNG', 'EXR', 'WEBP', 'MP4']} value={outputFormat} onChange={setOutputFormat} />
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Width', value: '3840' },
              { label: 'Height', value: '2160' },
            ].map(({ label, value }) => (
              <div key={label} className="ui-metric-card">
                <div className="font-mono text-ui-micro text-text-muted">{label}</div>
                <div className="mt-0.5 font-mono text-ui-xs text-text-primary">{value}px</div>
              </div>
            ))}
          </div>
          <div className="rounded-ui-sm border border-border-subtle bg-surface-0 px-2 py-1.5 font-mono text-ui-micro text-text-disabled">
            Codec: <span className="text-brand-teal">{outputFormat} · 32-bit · Linear</span>
          </div>
        </SectionBlock>

        <div className="px-3 py-3">
          <button className="ui-button-primary w-full justify-center">
            <Cpu size={11} />
            Render scene
          </button>
          <button className="ui-button-secondary mt-2 w-full justify-center">Render preview</button>
        </div>
      </div>
    </div>
  );
};

export default RenderSettingsPanel;

