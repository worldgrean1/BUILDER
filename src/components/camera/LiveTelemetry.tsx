import { Radio } from 'lucide-react';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface TelemetryField {
  label: string;
  value: string;
}

const fields: TelemetryField[] = [
  { label: 'Distance', value: '0' },
  { label: 'Inter', value: '0°' },
  { label: 'Posit', value: '0°' },
  { label: 'Scale', value: '0%' },
];

const LiveTelemetry = () => (
  <div className="border-b border-border-subtle">
    <div className="flex items-center gap-2 px-4 py-2.5">
      <Radio size={11} className="text-brand" />
      <span className="ui-section-heading text-text-muted">Live telemetry</span>
    </div>
    <div className="mx-4 mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-ui-md border border-border-subtle bg-border-subtle">
      {fields.map((field) => (
        <div key={field.label} className="bg-surface-1 px-3 py-3">
          <div className="ui-label mb-1">{formatUiLabel(field.label)}</div>
          <div className="font-mono text-ui-sm font-semibold text-text-primary">{field.value}</div>
        </div>
      ))}
    </div>
  </div>
);

export default LiveTelemetry;
