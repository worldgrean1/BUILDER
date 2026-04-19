import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Copy, Eye, X } from 'lucide-react';
import { formatUiLabel } from '../../utils/formatUiLabel';

type KeyframeType = 'ENTRY' | 'TRANSITION' | 'FOCUS' | 'EXIT';

const tagColors: Record<KeyframeType, string> = {
  ENTRY: 'border-success/30 bg-success/20 text-success',
  TRANSITION: 'border-warning/30 bg-warning/20 text-warning',
  FOCUS: 'border-info/30 bg-info/20 text-info',
  EXIT: 'border-danger/30 bg-danger/20 text-danger',
};

interface KeyframeCardProps {
  index: number;
  tag: KeyframeType;
  title: string;
  expanded?: boolean;
  scroll?: string;
  orbit?: string;
  pitch?: string;
  dist?: string;
  fov?: string;
  ease?: string;
  target?: string;
  vel?: string;
  push?: string;
  catmull?: string;
}

interface CollapsedKeyframeProps {
  index: number;
  tag: KeyframeType;
  title: string;
  s?: string;
  o?: string;
  dist?: string;
  deg?: string;
  target?: string;
}

const InfoLabel = ({ children }: { children: ReactNode }) => (
  <div className="ui-label mb-1">{children}</div>
);

const InlineField = ({ value, unit }: { value: string; unit?: string }) => (
  <div className="ui-field-shell-compact">
    <input type="text" defaultValue={value} className="w-full bg-transparent font-mono text-ui-xs text-text-primary outline-none" />
    {unit && <span className="font-mono text-ui-micro text-text-muted">{unit}</span>}
  </div>
);

const keyframeTagLabel = (tag: KeyframeType) => formatUiLabel(tag);

export const CollapsedKeyframe = ({ index, tag, title, s, o, dist, deg, target }: CollapsedKeyframeProps) => (
  <div className="flex cursor-pointer items-center gap-2 border-b ui-border-brand-soft px-3 py-2 transition-colors hover:bg-surface-2/40">
    <span className="w-4 flex-shrink-0 font-mono text-ui-xs text-text-muted">{index}</span>
    <span className={`flex-shrink-0 rounded-ui-xs border px-1.5 py-0.5 text-ui-micro font-semibold ${tagColors[tag]}`}>
      {keyframeTagLabel(tag)}
    </span>
    <span className="flex-1 truncate text-ui-xs font-medium text-text-secondary">{title}</span>
    <div className="flex flex-shrink-0 items-center gap-2 font-mono text-ui-micro text-text-disabled">
      {s && <span>S: {s}</span>}
      {o && <span>O: {o}</span>}
      {dist && <span>{dist}</span>}
      {deg && <span>{deg}°</span>}
      {target && <span className="text-info">{target}</span>}
    </div>
    <div className="ml-1 flex items-center gap-1">
      <button className="flex h-5 w-5 items-center justify-center text-text-disabled transition-colors hover:text-text-secondary">
        <Copy size={9} />
      </button>
      <button className="flex h-5 w-5 items-center justify-center text-text-disabled transition-colors hover:text-text-secondary">
        <Eye size={9} />
      </button>
    </div>
  </div>
);

const SubSection = ({ label, value, active = false }: { label: string; value: string; active?: boolean }) => (
  <div className={`flex cursor-pointer items-center justify-between rounded-ui-sm border px-3 py-2 transition-colors ${active ? 'border-brand/20 bg-brand/10' : 'border-border-subtle bg-surface-0/70 hover:bg-surface-0'}`}>
    <div className="flex items-center gap-1.5">
      <ChevronRight size={10} className={active ? 'text-brand' : 'text-text-muted'} />
      <span className={`text-ui-xs font-medium ${active ? 'text-brand' : 'text-text-secondary'}`}>{label}</span>
      {active && <span className="h-1.5 w-1.5 rounded-ui-sm bg-brand"></span>}
    </div>
    <span className="font-mono text-ui-micro text-text-muted">{value}</span>
  </div>
);

const KeyframeCard = ({
  index,
  tag,
  title,
  expanded = false,
  scroll = '0',
  orbit = '260',
  pitch = '85',
  dist = '7',
  fov = '50',
  ease = 'DRAMATIC',
  target = 'center (Scene Offline)',
  vel = 'VEL: 1.4x',
  push = 'PUSH: 70%',
  catmull = 'CATMULL-ROM',
}: KeyframeCardProps) => {
  const [open, setOpen] = useState(expanded);

  return (
    <div className={`${open ? 'bg-brand/5' : ''} border-b ui-border-brand-soft`}>
      <div
        className="flex cursor-pointer items-center gap-2 px-3 py-2.5 transition-colors hover:bg-surface-2/40"
        onClick={() => setOpen(!open)}
      >
        <span className="w-4 flex-shrink-0 font-mono text-ui-xs text-text-muted">{index}</span>
        <span className={`flex-shrink-0 rounded-ui-xs border px-1.5 py-0.5 text-ui-micro font-semibold ${tagColors[tag]}`}>
          {keyframeTagLabel(tag)}
        </span>
        <span className="flex-1 text-ui-sm font-semibold text-text-primary">{title}</span>
        <div className="flex items-center gap-1">
          <button className="flex h-5 w-5 items-center justify-center text-text-disabled hover:text-text-secondary">
            <Copy size={9} />
          </button>
          <button className="flex h-5 w-5 items-center justify-center text-text-disabled hover:text-text-secondary">
            <Eye size={9} />
          </button>
          <button className="flex h-5 w-5 items-center justify-center text-text-disabled hover:text-danger">
            <X size={9} />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 px-3 pb-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <InfoLabel>Scroll</InfoLabel>
              <div className="mb-1 flex items-center gap-1">
                {['0', '25', '50', '75', '100'].map((value) => (
                  <button
                    key={value}
                    className={`rounded-ui-xs border px-1 py-0.5 text-ui-micro transition-colors ${value === '0' ? 'border-brand/40 bg-brand/10 text-brand' : 'border-border-default text-text-disabled hover:border-border-strong hover:text-text-secondary'}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <InlineField value={scroll} unit="%" />
            </div>
            <div>
              <InfoLabel>Distance</InfoLabel>
              <div className="mt-[18px]">
                <InlineField value={dist} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <InfoLabel>Orbit</InfoLabel>
              <InlineField value={orbit} unit="°" />
            </div>
            <div>
              <InfoLabel>Pitch</InfoLabel>
              <InlineField value={pitch} unit="°" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <InfoLabel>Field of view</InfoLabel>
              <InlineField value={fov} />
            </div>
            <div>
              <InfoLabel>Ease</InfoLabel>
              <div className="ui-field-shell-compact cursor-pointer justify-between">
                <span className="text-ui-xs font-medium text-text-primary">{formatUiLabel(ease)}</span>
                <ChevronDown size={10} className="text-text-muted" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <InfoLabel>Keyframe tag</InfoLabel>
              <div className="ui-field-shell-compact cursor-pointer justify-between">
                <span className="text-ui-xs font-medium text-text-primary">Entry</span>
                <ChevronDown size={10} className="text-text-muted" />
              </div>
            </div>
            <div>
              <InfoLabel>Target transform</InfoLabel>
              <div className="ui-field-shell-compact cursor-pointer justify-between">
                <span className="truncate text-ui-xs text-text-secondary">{target}</span>
                <ChevronDown size={10} className="ml-1 flex-shrink-0 text-text-muted" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <SubSection label="Motion dynamics" value={vel} active={true} />
            <SubSection label="Cinematic effects" value={push} active={true} />
            <SubSection label="Advanced easing" value={catmull} active={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyframeCard;

