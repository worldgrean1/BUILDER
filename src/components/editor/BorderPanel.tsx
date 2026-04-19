import { Image, Square } from 'lucide-react';

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

interface BorderPanelProps {
  variant?: 'simple' | 'detailed';
}

const BORDER_STYLES = [
  { label: 'Solid', preview: '■' },
  { label: 'Thin', preview: '─' },
  { label: 'Dashed', preview: '- -' },
  { label: 'Medium', preview: '——' },
  { label: 'Long dash', preview: '— —' },
  { label: 'Dash dot', preview: '— · —' },
];

const BorderPanel = ({ variant = 'simple' }: BorderPanelProps) => {
  if (variant === 'detailed') {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-10">Style</span>
          <div className="flex flex-1 items-center gap-1">
            {BORDER_STYLES.map((style, index) => (
              <button
                key={style.label}
                title={style.label}
                className={`flex h-7 items-center justify-center rounded-ui-sm border px-2 font-mono text-ui-micro transition-colors ${index === 0 ? 'border-brand/40 bg-brand/10 text-brand' : 'border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary'}`}
              >
                {style.preview}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="ui-label w-12">Width</span>
            <SpinInput value="0" unit="px" className="flex-1" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="ui-label w-14">Radius</span>
            <SpinInput value="0" unit="px" className="flex-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="ui-label w-12">Style</span>
        <div className="ui-field-shell-compact gap-2">
          <div className="h-4 w-4 rounded-ui-xs border border-border-default bg-surface-0" />
          <span className="text-ui-sm text-text-secondary">None</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {[Image, Square, Square, Square].map((Icon, index) => (
            <button
              key={index}
              className="flex h-7 w-7 items-center justify-center rounded-ui-sm border border-border-default text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              {index === 0 ? <Icon size={11} /> : <span className="font-mono text-ui-micro">{['', '─', '- -', '——'][index]}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="ui-label w-12">Color</span>
        <div className="ui-field-shell-compact flex-1 gap-2">
          <div className="h-4 w-4 rounded-ui-xs border border-border-default bg-surface-0" />
          <span className="text-ui-sm text-text-secondary">None</span>
        </div>
        <button className="flex h-5 w-5 items-center justify-center text-text-disabled transition-colors hover:text-text-secondary">◁</button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-12">Width</span>
          <SpinInput value="0" unit="px" className="flex-1" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="ui-label w-14">Radius</span>
          <SpinInput value="0" unit="px" className="flex-1" />
        </div>
      </div>
    </div>
  );
};

export default BorderPanel;
