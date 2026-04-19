import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { tokenColors } from '../../utils/designTokens';

const HUE_STOPS = [
  '#ff0000',
  '#ff8000',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#0000ff',
  '#8000ff',
  '#ff00ff',
  '#ff0000',
];

interface ColorPickerPanelProps {
  hex?: string;
}

const ColorPickerPanel = ({ hex = tokenColors.surfaceInverse }: ColorPickerPanelProps) => {
  const [activeHex, setActiveHex] = useState(hex);
  const r = Number.parseInt(activeHex.slice(1, 3), 16);
  const g = Number.parseInt(activeHex.slice(3, 5), 16);
  const b = Number.parseInt(activeHex.slice(5, 7), 16);

  return (
    <div className="space-y-2.5">
      <div
        className="relative w-full overflow-hidden rounded-ui-md border border-border-default"
        style={{
          height: 130,
          background: `linear-gradient(to right, ${tokenColors.surfaceInverse}, ${activeHex}), linear-gradient(to top, ${tokenColors.charcoal}, transparent)`,
          backgroundBlendMode: 'multiply',
        }}
      >
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${tokenColors.surfaceInverse}, transparent)` }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${tokenColors.charcoal}, transparent)` }} />
        <div
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-ui-sm border-2 border-white shadow-elevation-low"
          style={{ left: '90%', top: '20%', backgroundColor: activeHex }}
        />
      </div>

      <div className="h-3 w-full cursor-pointer rounded-ui-sm border border-border-default" style={{ background: `linear-gradient(to right, ${HUE_STOPS.join(', ')})` }} />

      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2">
        <span className="ui-label">Hex</span>
        <div className="ui-field-shell-compact">
          <input
            type="text"
            value={activeHex}
            onChange={(event) => setActiveHex(event.target.value)}
            className="w-full bg-transparent font-mono text-ui-xs text-text-primary outline-none"
          />
          <ChevronDown size={10} className="flex-shrink-0 text-text-muted" />
        </div>
        <span className="font-mono text-ui-xs text-text-secondary tabular-nums">{r}</span>
        <span className="font-mono text-ui-xs text-text-secondary tabular-nums">{g}</span>
        <span className="font-mono text-ui-xs text-text-secondary tabular-nums">{b}</span>
      </div>

      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr] items-center gap-1.5">
        <span className="ui-label">RGB</span>
        {[r, `${g}, ${b}`].map((value, index) => (
          <div key={index} className="ui-field-shell-compact col-span-1 justify-center">
            <span className="font-mono text-ui-xs text-text-secondary">{value}</span>
          </div>
        ))}
        <span className="ui-label">HSL</span>
        <div className="ui-field-shell-compact col-span-1 justify-center">
          <span className="font-mono text-ui-xs text-text-secondary">H:0, 0%</span>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-1.5">
        <span className="ui-label">Hue</span>
        <div className="ui-field-shell-compact justify-center">
          <span className="font-mono text-ui-xs text-text-secondary">0</span>
        </div>
        <span className="ui-label">Lightness</span>
        <div className="ui-field-shell-compact justify-center">
          <span className="font-mono text-ui-xs text-text-secondary">100%</span>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerPanel;

