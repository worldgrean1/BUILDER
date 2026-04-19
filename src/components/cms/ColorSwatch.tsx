import { formatUiLabel } from '../../utils/formatUiLabel';

interface ColorSwatchProps {
  label: string;
  color: string;
}

const ColorSwatch = ({ label, color }: ColorSwatchProps) => (
  <div className="flex items-center gap-2">
    <span className="ui-label w-24 flex-shrink-0">{formatUiLabel(label)}</span>
    <div className="flex items-center gap-1.5 flex-1">
      <div
        className="h-5 w-5 rounded-ui-sm border border-border-default flex-shrink-0"
        style={{ backgroundColor: color }}
      ></div>
      <span className="ui-meta text-text-secondary">{color}</span>
    </div>
  </div>
);

export default ColorSwatch;
