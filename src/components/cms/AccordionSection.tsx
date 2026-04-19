import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface AccordionSectionProps {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  rightBadge?: string;
}

const AccordionSection = ({ title, icon, children, defaultOpen = false, rightBadge }: AccordionSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="ui-panel-section">
      <button
        className="ui-panel-section-trigger"
        onClick={() => setOpen(!open)}
      >
        {icon && <span className="text-text-muted">{icon}</span>}
        <span className="ui-section-heading flex-1">{formatUiLabel(title)}</span>
        {rightBadge && (
          <span className="ui-meta mr-2">{rightBadge}</span>
        )}
        {open ? (
          <ChevronDown size={12} className="text-text-muted flex-shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-text-muted flex-shrink-0" />
        )}
      </button>
      {open && children && (
        <div className="ui-panel-section-body pt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;
