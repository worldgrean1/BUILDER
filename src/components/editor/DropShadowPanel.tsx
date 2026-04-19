import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { tokenColors } from '../../utils/designTokens';

const SpinInput = ({ value, unit, className = '' }: { value: string; unit?: string; className?: string }) => (
  <div className={`ui-field-shell-compact ${className}`}>
    <input type="text" defaultValue={value} className="min-w-0 w-full bg-transparent font-mono text-ui-xs text-text-primary outline-none" />
    {unit && <span className="flex-shrink-0 font-mono text-ui-micro text-text-muted">{unit}</span>}
    <div className="flex flex-shrink-0 flex-col gap-px">
      <button className="leading-none text-text-disabled transition-colors hover:text-text-secondary">▲</button>
      <button className="leading-none text-text-disabled transition-colors hover:text-text-secondary">▼</button>
    </div>
  </div>
);

interface DropShadowPanelProps {
  useToggle?: boolean;
}

const DropShadowPanel = ({ useToggle = false }: DropShadowPanelProps) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="ui-section-heading">Drop shadow</span>
        {useToggle ? (
          <button
            onClick={() => setEnabled(!enabled)}
            className={`ui-toggle-track ${enabled ? 'ui-toggle-track-active' : ''}`}
          >
            <span className={`ui-toggle-thumb ${enabled ? 'ui-toggle-thumb-active' : ''}`} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button className="ui-field-shell-compact px-2 text-ui-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary">
              Off
            </button>
            <ChevronDown size={12} className="text-text-muted" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-16">X offset</span>
          <SpinInput value="0" unit="px" className="flex-1" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-16">Y offset</span>
          <SpinInput value="0" unit="px" className="flex-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-16">Blur</span>
          <SpinInput value="5" unit="px" className="flex-1" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-16">Spread</span>
          <SpinInput value="0" unit="px" className="flex-1" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="ui-label w-12">Color</span>
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-ui-xs border border-border-default" style={{ backgroundColor: tokenColors.charcoal }} />
          <span className="font-mono text-ui-xs text-text-secondary">{tokenColors.charcoal}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-ui-sm border border-border-default" style={{ backgroundColor: `${tokenColors.charcoal}bf` }} />
          <span className="font-mono text-ui-xs text-text-secondary">75% opacity</span>
        </div>
      </div>
    </div>
  );
};

export default DropShadowPanel;

