import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Circle } from 'lucide-react';
import { rgba, tokenColors } from '../../utils/designTokens';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface AudioClip {
  id: string;
  startPct: number;
  widthPct: number;
  color: string;
  label: string;
}

interface AudioTrack {
  id: string;
  name: string;
  filename: string;
  clips: AudioClip[];
  color: string;
}

const tracks: AudioTrack[] = [
  {
    id: 'scroll-1',
    name: 'Scroll Transit 01',
    filename: 'swoosh_01.mp3',
    color: tokenColors.teal,
    clips: [
      { id: 'c1', startPct: 0, widthPct: 2, color: tokenColors.teal, label: 'Sync' },
      { id: 'c2', startPct: 28, widthPct: 5, color: tokenColors.brand, label: 'Swoosh' },
    ],
  },
  {
    id: 'scroll-2',
    name: 'Scroll Transit 02',
    filename: 'swoosh_02.mp3',
    color: tokenColors.info,
    clips: [
      { id: 'c3', startPct: 50, widthPct: 3, color: tokenColors.info, label: '' },
    ],
  },
  {
    id: 'scroll-3',
    name: 'Scroll Transit 03',
    filename: 'swoosh_03.mp3',
    color: tokenColors.danger,
    clips: [],
  },
  {
    id: 'ambient',
    name: 'Master Ambient',
    filename: 'ambient_loop.mp3',
    color: tokenColors.success,
    clips: [
      { id: 'c4', startPct: 0, widthPct: 100, color: tokenColors.success, label: 'ambient_loop.mp3' },
    ],
  },
];

const TOTAL_PERCENT = 100;

const MixerTimeline = () => {
  const [currentPercent, setCurrentPercent] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="h-40 flex-shrink-0 border-t ui-border-brand-soft bg-surface-1">
      <div className="flex h-full">
        {/* Left Panel - Track Controls */}
        <div className="flex w-[160px] flex-shrink-0 flex-col border-r ui-border-brand-soft xl:w-[190px] 2xl:w-[220px]">
          <div className="flex h-8 flex-shrink-0 items-center gap-2 border-b ui-border-brand-soft px-3">
            <span className="ui-section-kicker text-brand">Mixer</span>
            <div className="ml-auto flex items-center gap-1">
              <button className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors" onClick={() => setCurrentPercent(0)}>
                <SkipBack size={9} />
              </button>
              <button
                className={`h-6 w-6 rounded-ui-sm border transition-colors ${
                  playing ? 'ui-segment-button-active border-brand/40 bg-brand/10 text-brand' : 'border-border-default text-text-muted hover:border-border-strong hover:text-text-primary'
                }`}
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause size={9} /> : <Play size={9} />}
              </button>
              <button className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors" onClick={() => setCurrentPercent(TOTAL_PERCENT)}>
                <SkipForward size={9} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {tracks.map((track) => (
              <div key={track.id} className="flex h-8 items-center gap-2 border-b ui-border-brand-soft px-3">
                <div className="h-3 w-1 rounded-ui-sm flex-shrink-0" style={{ backgroundColor: track.color }}></div>
                <span className="flex-1 truncate text-ui-micro font-medium text-text-secondary">
                  {formatUiLabel(track.name)}
                </span>
                <Circle size={8} className="text-text-disabled" />
              </div>
            ))}
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 border-t ui-border-brand-soft px-3 py-1.5">
            <span className="font-mono text-ui-micro text-text-disabled">Rate: <span className="text-text-muted">48k</span></span>
            <span className="ml-auto font-mono text-ui-micro text-text-disabled">Duration: <span className="text-text-muted">5.0s</span></span>
          </div>
        </div>

        {/* Right Panel - Timeline Grid */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Timeline Header with Markers */}
          <div className="relative h-8 flex-shrink-0 overflow-hidden border-b ui-border-brand-soft">
            <div className="absolute inset-0 flex items-end pb-1">
              {Array.from({ length: 11 }, (_, i) => i * 10).map((pct) => (
                <div
                  key={pct}
                  className="absolute bottom-0 flex flex-col items-center"
                  style={{ left: `${pct}%` }}
                >
                  <span className="font-mono text-ui-micro text-text-disabled">{pct}%</span>
                  <div className="ui-rule-brand h-2 w-px"></div>
                </div>
              ))}
              {Array.from({ length: 20 }, (_, i) => (i + 1) * 5).filter(f => f % 10 !== 0).map((pct) => (
                <div
                  key={pct}
                  className="ui-rule-brand-soft absolute bottom-0 h-1 w-px"
                  style={{ left: `${pct}%` }}
                ></div>
              ))}
            </div>
          </div>

          {/* Track Lanes with Clips */}
          <div
            className="flex-1 overflow-hidden relative cursor-crosshair"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentPercent(Math.round(pct * TOTAL_PERCENT));
            }}
          >
            {tracks.map((track) => (
              <div key={track.id} className="relative h-8 border-b ui-border-brand-soft">
                <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                  <div className="ui-rule-brand-soft h-px w-full"></div>
                </div>
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className="absolute bottom-1 top-1 flex cursor-pointer items-center overflow-hidden rounded-ui-sm px-1.5 transition-all hover:brightness-110"
                    style={{
                      left: `${clip.startPct}%`,
                      width: `${Math.max(clip.widthPct, 2)}%`,
                      backgroundColor: rgba(clip.color, 0.18),
                      borderLeft: `2px solid ${clip.color}`,
                    }}
                  >
                    {clip.label && (
                      <span className="truncate text-ui-micro font-medium text-text-primary">
                        {clip.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-brand z-10 pointer-events-none"
              style={{ left: `${currentPercent}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand rounded-ui-sm"></div>
            </div>
          </div>

          {/* Timeline Footer with Progress Bar */}
          <div className="flex flex-shrink-0 items-center gap-3 border-t ui-border-brand-soft px-3 py-1.5">
            <span className="font-mono text-ui-micro font-semibold text-brand">
              {String(currentPercent).padStart(3, '0')}%
            </span>
            <div className="flex-1 h-1 bg-surface-0 rounded-ui-sm relative overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-brand/40 rounded-ui-sm transition-all"
                style={{ width: `${currentPercent}%` }}
              ></div>
            </div>
            <span className="font-mono text-ui-micro text-text-disabled">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MixerTimeline;

