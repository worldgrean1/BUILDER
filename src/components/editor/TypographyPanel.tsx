import { useState } from 'react';
import { ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic } from 'lucide-react';
import { tokenColors } from '../../utils/designTokens';

const SpinInput = ({ value, unit }: { value: string; unit?: string }) => (
  <div className="ui-field-shell-compact flex-1">
    <input type="text" defaultValue={value} className="min-w-0 w-full bg-transparent font-mono text-ui-xs text-text-primary outline-none" />
    {unit && <span className="flex-shrink-0 font-mono text-ui-micro text-text-muted">{unit}</span>}
    <div className="flex flex-shrink-0 flex-col gap-px">
      <button className="leading-none text-text-disabled transition-colors hover:text-text-secondary">▲</button>
      <button className="leading-none text-text-disabled transition-colors hover:text-text-secondary">▼</button>
    </div>
  </div>
);

const TypographyPanel = () => {
  const [weight] = useState('Semibold');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <span className="text-ui-sm font-semibold text-text-muted">Aa</span>
        <div className="ui-field-shell flex-1 py-1.5">
          <span className="flex-1 text-ui-sm font-medium text-text-primary">Inter</span>
          <ChevronDown size={11} className="text-text-muted" />
        </div>
        <span className="ui-label">Advanced</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="ui-label">Weight</span>
        <div className="ui-field-shell flex-1 py-1.5">
          <span className="flex-1 text-ui-sm text-text-secondary">{weight}</span>
          <ChevronDown size={11} className="text-text-muted" />
        </div>
        <div className="flex items-center gap-1">
          <button className="flex h-7 w-7 items-center justify-center rounded-ui-sm border border-border-default text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary">
            Aa
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-ui-sm border border-border-default text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary">
            <Bold size={11} />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-ui-sm border border-border-default text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary">
            <Italic size={11} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="ui-label">Color</span>
        <div className="ui-field-shell-compact w-20 gap-2">
          <div className="h-4 w-4 rounded-ui-xs border border-border-default" style={{ backgroundColor: tokenColors.surfaceInverse }} />
          <span className="flex-1 text-ui-xs font-medium text-text-primary">White</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-8">Size</span>
          <SpinInput value="50" unit="px" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-8">Line</span>
          <SpinInput value="60" unit="px" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-8">Track</span>
          <SpinInput value="-0.01" unit="em" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-8">Wrap</span>
          <SpinInput value="0" />
        </div>
      </div>

      <div className="flex items-center gap-1 pt-1">
        {[AlignLeft, AlignCenter, AlignRight, AlignJustify].map((Icon, index) => (
          <button key={index} className={`flex h-7 w-7 items-center justify-center rounded-ui-sm border transition-colors ${index === 0 ? 'border-brand/40 bg-brand/10 text-brand' : 'border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary'}`}>
            <Icon size={11} />
          </button>
        ))}
        <div className="mx-1 h-5 w-px bg-border-subtle" />
        {['Aa', 'UP', 'Title', 'lower'].map((label) => (
          <button
            key={label}
            className="flex h-7 items-center justify-center rounded-ui-sm border border-border-default px-2 text-ui-micro font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {['Aa', 'Case', 'Dir'].map((label) => (
          <button
            key={label}
            className="flex h-7 items-center justify-center rounded-ui-sm border border-border-default px-2 text-ui-micro font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            {label}
          </button>
        ))}
        <div className="mx-1 h-5 w-px bg-border-subtle" />
        {['LTR', 'RTL'].map((label) => (
          <button
            key={label}
            className="flex h-7 items-center justify-center rounded-ui-sm border border-border-default px-2 text-ui-micro font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <span className="ui-label">Clamp</span>
        <div className="ui-field-shell flex-1 py-1">
          <span className="flex-1 text-ui-sm text-text-secondary">Auto</span>
          <div className="flex flex-col gap-px">
            <button className="leading-none text-text-disabled">▲</button>
            <button className="leading-none text-text-disabled">▼</button>
          </div>
        </div>
        <button className="flex h-7 w-7 items-center justify-center rounded-ui-sm border border-border-default text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary">
          <span>⚙</span>
        </button>
      </div>
    </div>
  );
};

export default TypographyPanel;
