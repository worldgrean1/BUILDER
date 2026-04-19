import { useState } from 'react';
import { Grid3x3 as Grid3X3, Maximize2, RotateCcw, ZoomIn, ZoomOut, Move3d as Move3D, Eye, Sun } from 'lucide-react';
import { rgba, tokenColors } from '../../utils/designTokens';
import { formatUiLabel } from '../../utils/formatUiLabel';

type ViewMode = 'perspective' | 'top' | 'front' | 'right';
type RenderMode = 'solid' | 'wireframe' | 'material' | 'rendered';

const viewModes: ViewMode[] = ['perspective', 'top', 'front', 'right'];
const renderModes: { id: RenderMode; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'wireframe', label: 'Wire' },
  { id: 'material', label: 'Material' },
  { id: 'rendered', label: 'PBR' },
];

const GridLines = () => (
  <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke={tokenColors.info} strokeWidth="0.4" />
      </pattern>
      <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="url(#grid-small)" />
        <path d="M 100 0 L 0 0 0 100" fill="none" stroke={tokenColors.info} strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid-large)" />
    <line x1="50%" y1="0" x2="50%" y2="100%" stroke={tokenColors.danger} strokeWidth="0.6" opacity="0.5" />
    <line x1="0" y1="50%" x2="100%" y2="50%" stroke={tokenColors.success} strokeWidth="0.6" opacity="0.5" />
  </svg>
);

const MeshWireframe = ({ renderMode }: { renderMode: RenderMode }) => {
  const isWire = renderMode === 'wireframe';
  const isMaterial = renderMode === 'material';
  const isPbr = renderMode === 'rendered';

  return (
    <svg
      viewBox="0 0 300 260"
      className="h-full max-h-[260px] w-full max-w-[340px]"
      style={{ filter: isPbr ? `drop-shadow(0 0 24px ${rgba(tokenColors.teal, 0.4)})` : undefined }}
    >
      {isPbr && (
        <defs>
          <radialGradient id="pbr-body" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor={tokenColors.info} stopOpacity="0.3" />
            <stop offset="100%" stopColor={tokenColors.surfaceBase} stopOpacity="0.8" />
          </radialGradient>
          <radialGradient id="pbr-top" cx="50%" cy="20%" r="60%">
            <stop offset="0%" stopColor={tokenColors.surfaceInverse} stopOpacity="0.15" />
            <stop offset="100%" stopColor={tokenColors.surfacePanel} stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="pbr-accent" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor={tokenColors.success} stopOpacity="0.2" />
            <stop offset="100%" stopColor={tokenColors.surfacePanel} stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {isMaterial && (
        <defs>
          <linearGradient id="mat-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tokenColors.surfaceHighest} />
            <stop offset="100%" stopColor={tokenColors.surfacePanel} />
          </linearGradient>
        </defs>
      )}

      <g transform="translate(150, 130)">
        <polygon
          points="0,-90 70,-50 70,50 0,90 -70,50 -70,-50"
          fill={isPbr ? 'url(#pbr-body)' : isMaterial ? 'url(#mat-body)' : 'none'}
          stroke={isWire || isPbr ? tokenColors.info : tokenColors.surfaceHighest}
          strokeWidth={isWire ? 0.8 : 1}
          strokeOpacity={isWire ? 0.9 : 0.4}
        />
        <polygon
          points="0,-90 40,-70 0,-50 -40,-70"
          fill={isPbr ? 'url(#pbr-top)' : isMaterial ? tokenColors.surfaceHigh : 'none'}
          stroke={isWire ? tokenColors.info : tokenColors.surfaceHighest}
          strokeWidth={isWire ? 0.8 : 0.5}
          strokeOpacity={0.6}
        />
        {isWire && (
          <>
            <line x1="0" y1="-90" x2="0" y2="90" stroke={tokenColors.info} strokeWidth="0.4" strokeOpacity="0.4" />
            <line x1="-70" y1="-50" x2="70" y2="50" stroke={tokenColors.info} strokeWidth="0.4" strokeOpacity="0.3" />
            <line x1="70" y1="-50" x2="-70" y2="50" stroke={tokenColors.info} strokeWidth="0.4" strokeOpacity="0.3" />
            <circle cx="0" cy="0" r="40" fill="none" stroke={tokenColors.info} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4,4" />
          </>
        )}
        <circle
          cx="0"
          cy="0"
          r="30"
          fill={isPbr ? 'url(#pbr-accent)' : 'none'}
          stroke={isPbr ? tokenColors.success : tokenColors.brand}
          strokeWidth={isPbr ? 1 : 0.7}
          strokeOpacity={isPbr ? 0.6 : 0.5}
          strokeDasharray={isPbr ? undefined : '3,3'}
        />
        <circle cx="0" cy="0" r="3" fill={isPbr ? tokenColors.success : tokenColors.brand} opacity="0.8" />
        <rect
          x="-15"
          y="-15"
          width="30"
          height="30"
          rx="2"
          fill={isPbr ? rgba(tokenColors.info, 0.15) : isMaterial ? rgba(tokenColors.surfaceHighest, 0.8) : 'none'}
          stroke={isWire ? tokenColors.info : tokenColors.surfaceHighest}
          strokeWidth="0.6"
          strokeOpacity="0.6"
          transform="rotate(45)"
        />
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const radians = (angle * Math.PI) / 180;
          const strokeColor =
            angle === 0 ? tokenColors.danger : angle === 120 ? tokenColors.success : angle === 240 ? tokenColors.info : tokenColors.surfaceHighest;

          return (
            <line
              key={angle}
              x1={Math.cos(radians) * 30}
              y1={Math.sin(radians) * 30}
              x2={Math.cos(radians) * 68}
              y2={Math.sin(radians) * 68}
              stroke={strokeColor}
              strokeWidth="0.8"
              strokeOpacity={isWire ? 0.9 : 0.3}
            />
          );
        })}
      </g>
    </svg>
  );
};

interface StudioViewportProps {
  activeObject: string;
}

const StudioViewport = ({ activeObject }: StudioViewportProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('perspective');
  const [renderMode, setRenderMode] = useState<RenderMode>('solid');
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-surface-0">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
        {viewModes.map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`rounded-ui-sm border px-2 py-1 font-mono text-ui-micro font-semibold transition-colors ${viewMode === mode ? 'border-info/40 bg-info/20 text-info' : 'border-border-subtle bg-surface-2/60 text-text-disabled hover:border-border-strong hover:text-text-muted'}`}
          >
            {formatUiLabel(mode)}
          </button>
        ))}
      </div>

      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
        {renderModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setRenderMode(mode.id)}
            className={`rounded-ui-sm border px-2 py-1 font-mono text-ui-micro font-semibold transition-colors ${renderMode === mode.id ? 'border-brand/40 bg-brand/10 text-brand' : 'border-border-subtle bg-surface-2/60 text-text-disabled hover:border-border-strong hover:text-text-muted'}`}
          >
            {mode.label}
          </button>
        ))}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex h-7 w-7 items-center justify-center rounded-ui-sm border transition-colors ${showGrid ? 'border-brand-teal/30 bg-brand-teal/20 text-brand-teal' : 'border-border-subtle bg-surface-2/60 text-text-disabled hover:border-border-strong hover:text-text-secondary'}`}
        >
          <Grid3X3 size={11} />
        </button>
      </div>

      {showGrid && <GridLines />}

      <div className="relative flex flex-1 items-center justify-center">
        <MeshWireframe renderMode={renderMode} />

        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
          {[
            { axis: 'X', color: 'bg-danger' },
            { axis: 'Y', color: 'bg-success' },
            { axis: 'Z', color: 'bg-info' },
          ].map(({ axis, color }) => (
            <div key={axis} className="flex items-center gap-2">
              <div className={`h-0.5 w-5 rounded-ui-sm ${color}`}></div>
              <span className="font-mono text-ui-micro text-text-disabled">{axis}</span>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
          {[ZoomIn, ZoomOut, RotateCcw, Maximize2].map((Icon, index) => (
            <button
              key={index}
              className="flex h-7 w-7 items-center justify-center rounded-ui-sm border border-border-default bg-surface-2/80 text-text-muted transition-colors hover:border-border-strong hover:text-text-secondary"
            >
              <Icon size={12} />
            </button>
          ))}
        </div>

        <div className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-2">
          {[Move3D, RotateCcw, Eye, Sun].map((Icon, index) => (
            <button
              key={index}
              className={`flex h-7 w-7 items-center justify-center rounded-ui-sm border transition-colors ${index === 0 ? 'border-brand/40 bg-brand/10 text-brand' : 'border-border-default bg-surface-2/80 text-text-muted hover:border-border-strong hover:text-text-secondary'}`}
            >
              <Icon size={12} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-8 flex-shrink-0 items-center gap-4 border-t border-border-subtle bg-surface-1/50 px-3">
        <span className="font-mono text-ui-micro text-text-muted">Canvas</span>
        <div className="h-3 w-px bg-border-subtle"></div>
        <span className="font-mono text-ui-micro text-text-disabled">
          Cam: <span className="text-text-muted">{formatUiLabel(viewMode)}</span>
        </span>
        <span className="font-mono text-ui-micro text-text-disabled">
          Render: <span className="text-text-muted">{renderModes.find((mode) => mode.id === renderMode)?.label}</span>
        </span>
        <span className="font-mono text-ui-micro text-text-disabled">
          Object: <span className="text-brand">{activeObject}</span>
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-ui-sm bg-success animate-pulse"></div>
          <span className="font-mono text-ui-micro text-success">GPU ready</span>
        </div>
      </div>
    </div>
  );
};

export default StudioViewport;

