interface ScrollBarProps {
  value?: number;
}

const ScrollBar = ({ value = 0 }: ScrollBarProps) => (
  <div className="h-10 bg-surface-1 flex items-center px-4 gap-3 flex-shrink-0">
    <span className="ui-status-label">Scroll position</span>
    <div className="ui-status-dot bg-brand flex-shrink-0"></div>
    <div className="flex-1 h-[2px] bg-surface-3 rounded-ui-sm relative">
      <div
        className="absolute left-0 top-0 h-full bg-brand/40 rounded-ui-sm"
        style={{ width: `${value}%` }}
      ></div>
    </div>
    <span className="font-mono text-ui-xs text-brand font-medium">{value.toFixed(1)}%</span>
  </div>
);

export default ScrollBar;

