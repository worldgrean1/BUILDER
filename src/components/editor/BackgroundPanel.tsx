import { Image, Square, Blend, Video } from 'lucide-react';

const modes = [
  { label: 'Image', icon: Image },
  { label: 'Solid', icon: Square },
  { label: 'Gradient', icon: Blend },
  { label: 'Video', icon: Video },
];

const fillTypes = [
  { id: 'fill', label: 'Fill' },
  { id: 'drop', label: 'Drop' },
];

const BackgroundPanel = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <span className="ui-label flex-shrink-0">Background source</span>
      <div className="ml-auto flex items-center gap-1">
        {modes.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            className={`flex h-8 w-8 items-center justify-center rounded-ui-sm border transition-colors ${index === 0 ? 'border-brand/40 bg-brand/10 text-brand' : 'border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary'}`}
          >
            <Icon size={12} />
          </button>
        ))}
      </div>
    </div>

    <button className="ui-field-shell w-full justify-center py-2 text-ui-sm text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary">
      None
    </button>

    <div className="flex items-center gap-2">
      {fillTypes.map(({ id, label }, index) => (
        <button
          key={id}
          className={`ui-segment-button h-8 w-8 px-0 ${index === 0 ? 'ui-segment-button-active' : ''}`}
          aria-label={label}
        >
          {label.charAt(0)}
        </button>
      ))}
      <div className="ui-field-shell flex-1 py-1.5">
        <span className="flex-1 text-ui-sm text-text-secondary">Transparent</span>
      </div>
    </div>
  </div>
);

export default BackgroundPanel;
