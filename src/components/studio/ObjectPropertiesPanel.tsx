import { useState, type ReactNode } from 'react';
import { ChevronDown, Eye, Lock, Maximize2, Move3d as Move3D, Cpu, Palette } from 'lucide-react';
import { tokenColors } from '../../utils/designTokens';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const axisColors = [tokenColors.danger, tokenColors.success, tokenColors.info];

const Vec3Field = ({ label, value, unit = '' }: { label: string; value: Vec3; unit?: string }) => (
  <div className="flex items-center gap-2">
    <span className="ui-label w-20 flex-shrink-0">{formatUiLabel(label)}</span>
    <div className="flex flex-1 gap-1">
      {(['x', 'y', 'z'] as const).map((axis, index) => (
        <div key={axis} className="flex flex-1 items-center gap-1 rounded-ui-sm border border-border-default bg-surface-0 px-1.5 py-1">
          <span className="font-mono text-ui-micro font-semibold" style={{ color: axisColors[index] }}>
            {axis.toUpperCase()}
          </span>
          <span className="flex-1 text-right font-mono text-ui-xs text-text-primary">
            {value[axis].toFixed(2)}
            {unit}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const SliderField = ({
  label,
  value,
  min = 0,
  max = 1,
  color = tokenColors.teal,
  unit = '',
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  color?: string;
  unit?: string;
}) => {
  const [val, setVal] = useState(value);
  const pct = ((val - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="ui-label w-20 flex-shrink-0">{formatUiLabel(label)}</span>
      <div
        className="ui-slider-track flex-1 cursor-ew-resize"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const newPct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
          setVal(min + newPct * (max - min));
        }}
      >
        <div className="ui-slider-fill" style={{ width: `${pct}%`, backgroundColor: color }}></div>
        <div className="ui-slider-thumb" style={{ left: `calc(${pct}% - 5px)` }}></div>
      </div>
      <div className="ui-field-shell-compact w-14 justify-center">
        <span className="font-mono text-ui-xs text-text-primary">
          {val.toFixed(2)}
          {unit}
        </span>
      </div>
    </div>
  );
};

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

interface ObjectPropertiesPanelProps {
  selectedId: string;
}

const ObjectPropertiesPanel = ({ selectedId }: ObjectPropertiesPanelProps) => {
  const objectName = formatUiLabel(selectedId);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2.5">
        <span className="ui-panel-title">Object properties</span>
        <div className="ui-field-shell-compact">
          <span className="block max-w-[80px] truncate font-mono text-ui-micro text-text-muted">{objectName}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <SectionBlock title="Transform" icon={<Move3D size={10} />}>
          <Vec3Field label="Position" value={{ x: 0, y: 1.24, z: -0.5 }} unit="m" />
          <Vec3Field label="Rotation" value={{ x: 0, y: 45, z: 0 }} unit="°" />
          <Vec3Field label="Scale" value={{ x: 1, y: 1, z: 1 }} />
        </SectionBlock>

        <SectionBlock title="Geometry" icon={<Maximize2 size={10} />}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Verts', value: '12,480' },
              { label: 'Faces', value: '24,960' },
              { label: 'Edges', value: '37,440' },
              { label: 'Tris', value: '49,920' },
            ].map(({ label, value }) => (
              <div key={label} className="ui-metric-card">
                <div className="font-mono text-ui-micro text-text-muted">{label}</div>
                <div className="mt-0.5 font-mono text-ui-xs text-info">{value}</div>
              </div>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="Physics" icon={<Cpu size={10} />} defaultOpen={false}>
          <SliderField label="Mass" value={1} min={0} max={100} color={tokenColors.warning} unit=" kg" />
          <SliderField label="Friction" value={0.5} color={tokenColors.warning} />
          <SliderField label="Restitution" value={0.2} color={tokenColors.warning} />
          <div className="mt-1 flex items-center gap-2">
            <span className="ui-label w-20 flex-shrink-0">Body type</span>
            <div className="flex flex-1 gap-1">
              {['Rigid', 'Soft', 'Static'].map((type, index) => (
                <button
                  key={type}
                  className={`flex-1 rounded-ui-sm border py-1 text-ui-micro font-medium transition-colors ${index === 0 ? 'border-warning/30 bg-warning/10 text-warning' : 'border-border-default bg-surface-0 text-text-disabled hover:border-border-strong hover:text-text-muted'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title="Material override" icon={<Palette size={10} />} defaultOpen={false}>
          <SliderField label="Metalness" value={0.7} color={tokenColors.teal} />
          <SliderField label="Roughness" value={0.45} color={tokenColors.teal} />
          <SliderField label="Opacity" value={1} color={tokenColors.teal} />
          <div className="flex items-center gap-2">
            <span className="ui-label w-20 flex-shrink-0">Base color</span>
            <div className="ui-field-shell flex-1 py-1.5">
              <div className="h-4 w-4 flex-shrink-0 rounded-ui-xs border border-border-default" style={{ backgroundColor: '#2A2A2A' }}></div>
              <span className="font-mono text-ui-xs text-text-primary">#2A2A2A</span>
            </div>
          </div>
        </SectionBlock>

        <div className="px-3 py-3">
          <div className="ui-note-card">
            <div className="mb-1.5 flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-ui-sm bg-success animate-pulse"></div>
              <span className="text-ui-micro font-medium text-success">Live data</span>
            </div>
            <p className="ui-body-copy">
              <span className="font-semibold text-brand">Object:</span> {objectName} is selected in the scene. Changes are applied to the render pipeline in real time.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border-subtle px-3 py-2">
        <button className="ui-button-primary flex-1">Apply</button>
        <button className="ui-button-secondary flex-1">Reset</button>
      </div>
    </div>
  );
};

export default ObjectPropertiesPanel;

