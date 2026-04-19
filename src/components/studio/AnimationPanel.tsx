import { Play, Pause, SkipBack, SkipForward, Repeat, Film, Clock, TrendingUp } from 'lucide-react';

const frameCards = [
  { label: 'Frame', value: '0' },
  { label: 'Start', value: '0' },
  { label: 'End', value: '240' },
];

const keyframes = [
  { frame: 0, property: 'Position', value: '0, 0, 0' },
  { frame: 60, property: 'Rotation', value: '0°, 45°, 0°' },
  { frame: 120, property: 'Scale', value: '1.0, 1.0, 1.0' },
  { frame: 180, property: 'Position', value: '5, 2, 0' },
];

const AnimationPanel = () => (
  <div className="h-full w-full overflow-y-auto">
    <div className="border-b border-border-subtle px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="ui-panel-title">Animation controls</span>
        <Film size={11} className="text-brand" />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <button className="flex h-8 w-8 items-center justify-center rounded-ui-sm border border-border-default bg-surface-2 text-text-muted transition-colors hover:border-border-strong hover:text-text-primary">
          <SkipBack size={12} />
        </button>
        <button className="flex h-8 w-10 items-center justify-center rounded-ui-sm bg-brand text-white transition-colors hover:bg-brand-soft">
          <Play size={12} />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-ui-sm border border-border-default bg-surface-2 text-text-muted transition-colors hover:border-border-strong hover:text-text-primary">
          <Pause size={12} />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-ui-sm border border-border-default bg-surface-2 text-text-muted transition-colors hover:border-border-strong hover:text-text-primary">
          <SkipForward size={12} />
        </button>
        <button className="ml-auto flex h-8 w-8 items-center justify-center rounded-ui-sm border border-border-default bg-surface-2 text-text-muted transition-colors hover:border-border-strong hover:text-text-primary">
          <Repeat size={12} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {frameCards.map((card) => (
          <div key={card.label} className="ui-metric-card">
            <span className="ui-label mb-0.5 block">{card.label}</span>
            <span className="font-mono text-ui-sm font-semibold text-text-primary">{card.value}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="border-b border-border-subtle px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="ui-section-heading">Timeline settings</span>
        <Clock size={10} className="text-text-muted" />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="ui-value text-text-secondary">Frame rate</span>
          <div className="flex items-center gap-1">
            <input type="number" defaultValue="24" className="ui-input h-8 w-14 px-2 font-mono text-ui-xs" />
            <span className="ui-meta">fps</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="ui-value text-text-secondary">Duration</span>
          <div className="flex items-center gap-1">
            <input type="number" defaultValue="10" className="ui-input h-8 w-14 px-2 font-mono text-ui-xs" />
            <span className="ui-meta">sec</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="ui-value text-text-secondary">Loop</span>
          <button className="ui-toggle-track ui-toggle-track-active">
            <span className="ui-toggle-thumb ui-toggle-thumb-active" />
          </button>
        </div>
      </div>
    </div>

    <div className="border-b border-border-subtle px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="ui-section-heading">Keyframes</span>
        <button className="text-ui-xs font-medium text-brand transition-colors hover:text-brand-soft">Add</button>
      </div>

      <div className="space-y-2">
        {keyframes.map((keyframe) => (
          <div key={`${keyframe.property}-${keyframe.frame}`} className="ui-metric-card transition-colors hover:border-border-strong">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-ui-xs font-medium text-text-primary">{keyframe.property}</span>
              <span className="font-mono text-ui-micro text-brand">F: {keyframe.frame}</span>
            </div>
            <span className="font-mono text-ui-micro text-text-muted">{keyframe.value}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="ui-section-heading">Easing curves</span>
        <TrendingUp size={10} className="text-text-muted" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {['Linear', 'Ease in', 'Ease out', 'Ease in-out', 'Bounce', 'Elastic'].map((curve) => (
          <button
            key={curve}
            className="rounded-ui-sm border border-border-subtle bg-surface-0 px-2 py-2 text-ui-xs font-medium text-text-secondary transition-colors hover:border-brand/40 hover:text-brand"
          >
            {curve}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default AnimationPanel;
