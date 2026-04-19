import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Circle } from 'lucide-react';
import { rgba, tokenColors } from '../../utils/designTokens';

interface TrackKeyframe {
  frame: number;
}

interface AnimationTrack {
  id: string;
  label: string;
  keyframes: TrackKeyframe[];
  color: string;
}

const tracks: AnimationTrack[] = [
  { id: 'pos-track', label: 'position', color: tokenColors.danger, keyframes: [{ frame: 0 }, { frame: 24 }, { frame: 60 }, { frame: 90 }] },
  { id: 'rot-track', label: 'rotation', color: tokenColors.success, keyframes: [{ frame: 0 }, { frame: 30 }, { frame: 75 }] },
  { id: 'scale-track', label: 'scale', color: tokenColors.info, keyframes: [{ frame: 10 }, { frame: 50 }, { frame: 100 }] },
];

const TOTAL_FRAMES = 120;
const timelineBorderColor = rgba(tokenColors.surfaceHighest, 0.74);
const timelineRuleColor = rgba(tokenColors.surfaceHighest, 0.92);
const timelineRuleSoftColor = rgba(tokenColors.surfaceHighest, 0.58);
const playheadColor = tokenColors.danger;
const playheadGlow = `0 0 0 1px ${rgba(tokenColors.danger, 0.18)}, 0 0 14px ${rgba(tokenColors.danger, 0.36)}`;

const StudioTimeline = () => {
  const [currentFrame, setCurrentFrame] = useState(24);
  const [playing, setPlaying] = useState(false);
  const frameToPercent = (frame: number) => (frame / TOTAL_FRAMES) * 100;

  return (
    <div className="h-40 flex-shrink-0 border-t bg-surface-1" style={{ borderColor: timelineBorderColor }}>
      <div className="flex h-full">
        <div className="flex w-[160px] flex-shrink-0 flex-col border-r xl:w-[190px] 2xl:w-[220px]" style={{ borderColor: timelineBorderColor }}>
          <div className="flex h-8 items-center gap-2 border-b px-3" style={{ borderColor: timelineBorderColor }}>
            <span className="font-mono text-ui-xs font-semibold tracking-[0.18em] text-brand">// TIMELINE</span>
            <div className="ml-auto flex items-center gap-1">
              <button className="flex h-5 w-5 items-center justify-center text-text-muted transition-colors hover:text-text-secondary" onClick={() => setCurrentFrame(0)}>
                <SkipBack size={9} />
              </button>
              <button
                className={`flex h-6 w-6 items-center justify-center rounded-ui-sm border transition-colors ${playing ? 'border-brand/40 bg-brand/10 text-brand' : 'border-border-default text-text-muted hover:border-border-strong hover:text-text-primary'}`}
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause size={9} /> : <Play size={9} />}
              </button>
              <button className="flex h-5 w-5 items-center justify-center text-text-muted transition-colors hover:text-text-secondary" onClick={() => setCurrentFrame(TOTAL_FRAMES)}>
                <SkipForward size={9} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {tracks.map((track) => (
              <div key={track.id} className="flex h-8 items-center gap-2 border-b px-3" style={{ borderColor: timelineBorderColor }}>
                <div className="h-3 w-1 rounded-ui-sm" style={{ backgroundColor: track.color }}></div>
                <span className="flex-1 truncate font-mono text-ui-xs font-semibold tracking-[0.08em] text-text-secondary">
                  {track.label.toUpperCase()}
                </span>
                <Circle size={8} className="text-text-disabled" />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t px-3 py-1.5" style={{ borderColor: timelineBorderColor }}>
            <span className="font-mono text-ui-micro text-text-disabled">FPS: <span className="text-text-muted">24</span></span>
            <span className="ml-auto font-mono text-ui-micro text-text-disabled">Duration: <span className="text-text-muted">5.0s</span></span>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div className="relative h-8 overflow-hidden border-b" style={{ borderColor: timelineBorderColor }}>
            <div className="absolute inset-0 flex items-end pb-1">
              {Array.from({ length: TOTAL_FRAMES / 10 + 1 }, (_, index) => index * 10).map((frame) => (
                <div key={frame} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${frameToPercent(frame)}%` }}>
                  <span className="font-mono text-ui-micro text-text-disabled">{frame}</span>
                  <div className="h-2 w-px rounded-ui-sm" style={{ backgroundColor: timelineRuleColor }}></div>
                </div>
              ))}
              {Array.from({ length: TOTAL_FRAMES / 2 }, (_, index) => (index + 1) * 2)
                .filter((frame) => frame % 10 !== 0)
                .map((frame) => (
                  <div key={frame} className="absolute bottom-0 h-1.5 w-px" style={{ left: `${frameToPercent(frame)}%`, backgroundColor: timelineRuleSoftColor }}></div>
                ))}
            </div>
          </div>

          <div
            className="relative flex-1 overflow-hidden cursor-crosshair"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const pct = (event.clientX - rect.left) / rect.width;
              setCurrentFrame(Math.round(pct * TOTAL_FRAMES));
            }}
          >
            {tracks.map((track) => (
              <div key={track.id} className="relative h-8 border-b" style={{ borderColor: timelineBorderColor }}>
                <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                  <div className="h-px w-full" style={{ backgroundColor: timelineRuleSoftColor }}></div>
                </div>
                {track.keyframes.map((keyframe, index) => (
                  <div
                    key={index}
                    className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 cursor-pointer border transition-transform hover:scale-125"
                    style={{
                      left: `calc(${frameToPercent(keyframe.frame)}% - 4px)`,
                      backgroundColor: track.color,
                      borderColor: track.color,
                    }}
                  ></div>
                ))}
              </div>
            ))}

            <div
              className="pointer-events-none absolute bottom-0 top-0 z-10 w-[2px] -translate-x-1/2 rounded-ui-sm"
              style={{ left: `${frameToPercent(currentFrame)}%`, backgroundColor: playheadColor, boxShadow: playheadGlow }}
            >
              <div
                className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45"
                style={{ backgroundColor: playheadColor, boxShadow: playheadGlow }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t px-3 py-1.5" style={{ borderColor: timelineBorderColor }}>
            <span className="font-mono text-ui-micro font-semibold text-brand">FR{String(currentFrame).padStart(3, '0')}</span>
            <div className="relative h-1 flex-1 overflow-hidden rounded-ui-sm bg-surface-0/90">
              <div
                className="absolute left-0 top-0 h-full rounded-ui-sm transition-all"
                style={{ width: `${frameToPercent(currentFrame)}%`, backgroundColor: rgba(tokenColors.danger, 0.55) }}
              ></div>
            </div>
            <span className="font-mono text-ui-micro text-text-disabled">F{TOTAL_FRAMES}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioTimeline;

