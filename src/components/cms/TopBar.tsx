import { Monitor, ChevronRight } from 'lucide-react';

interface TopBarProps {
  module: string;
  subModule?: string;
  activeSection: string;
  applyLabel?: string;
  onApply?: () => void;
  children?: React.ReactNode;
}

const TopBar = ({ module, subModule, activeSection, applyLabel = 'Apply', onApply, children }: TopBarProps) => (
  <div className="ui-topbar min-w-0 overflow-x-auto overflow-y-hidden">
    {/* Breadcrumb path */}
    <div className="flex items-center gap-1.5 min-w-0 text-ui-xs">
      <span className="text-text-disabled hidden sm:inline truncate">{module}</span>
      {subModule && (
        <>
          <ChevronRight size={9} className="text-text-disabled flex-shrink-0" />
          <span className="text-text-muted hidden md:inline truncate">{subModule}</span>
        </>
      )}
      <ChevronRight size={9} className="text-text-disabled flex-shrink-0" />
      <span className="ui-module-badge flex-shrink-0">
        <Monitor size={10} />
        {activeSection}
      </span>
    </div>

    {/* Center: page-specific controls */}
    {children && (
      <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
        {children}
      </div>
    )}

    {/* Right: Apply CTA */}
    <div className={`${children ? '' : 'ml-auto'} flex items-center gap-1.5 flex-shrink-0`}>
      <button className="ui-button-primary whitespace-nowrap" onClick={onApply}>
        {applyLabel}
      </button>
    </div>
  </div>
);

export default TopBar;
