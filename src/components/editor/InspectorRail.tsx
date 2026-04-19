import { useState } from 'react';
import { ChevronDown, Columns2, Square, Circle } from 'lucide-react';
import ColorPickerPanel from './ColorPickerPanel';
import BackgroundPanel from './BackgroundPanel';
import BorderPanel from './BorderPanel';
import DropShadowPanel from './DropShadowPanel';
import TypographyPanel from './TypographyPanel';

type InspectorTab = 'page' | 'typography';

const InspectorRail = () => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('page');

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-surface-1">
      <div className="flex flex-shrink-0 items-center border-b border-border-subtle">
        {(['page', 'typography'] as InspectorTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-ui-xs font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-brand text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {tab === 'page' ? 'Page' : 'Typography'}
          </button>
        ))}
      </div>

      {activeTab === 'page' && (
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-border-subtle px-4 py-2">
          <span className="ui-label">Position</span>
          <span className="text-ui-xs font-medium text-text-primary">Auto</span>
          <div className="ml-auto flex items-center gap-1">
            {[Square, Circle, Columns2].map((Icon, index) => (
              <button
                key={index}
                className="flex h-7 w-7 items-center justify-center rounded-ui-sm border border-border-default text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
              >
                <Icon size={11} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'page' && (
          <>
            <div className="border-b border-border-subtle p-4">
              <ColorPickerPanel />
            </div>

            <div className="ui-panel-section">
              <div className="ui-panel-section-trigger">
                <ChevronDown size={11} className="text-text-muted" />
                <span className="ui-section-heading">Background</span>
              </div>
              <div className="ui-panel-section-body pt-0">
                <BackgroundPanel />
              </div>
            </div>

            <div className="ui-panel-section">
              <div className="ui-panel-section-trigger">
                <ChevronDown size={11} className="text-text-muted" />
                <span className="ui-section-heading">Border</span>
              </div>
              <div className="ui-panel-section-body pt-0">
                <BorderPanel variant="detailed" />
              </div>
            </div>

            <div className="ui-panel-section">
              <div className="ui-panel-section-body pt-4">
                <DropShadowPanel useToggle={false} />
              </div>
            </div>

            <div className="ui-panel-section">
              <div className="ui-panel-section-body pt-4">
                <DropShadowPanel useToggle={true} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'typography' && (
          <>
            <div className="ui-panel-section">
              <div className="ui-panel-section-trigger">
                <ChevronDown size={11} className="text-text-muted" />
                <span className="ui-section-heading">Typography</span>
              </div>
              <div className="ui-panel-section-body pt-0">
                <TypographyPanel />
              </div>
            </div>

            <div className="ui-panel-section">
              <div className="ui-panel-section-trigger">
                <ChevronDown size={11} className="text-text-muted" />
                <span className="ui-section-heading">Background</span>
              </div>
              <div className="ui-panel-section-body pt-0">
                <BackgroundPanel />
              </div>
            </div>

            <div className="ui-panel-section">
              <div className="ui-panel-section-trigger">
                <ChevronDown size={11} className="text-text-muted" />
                <span className="ui-section-heading">Border</span>
              </div>
              <div className="ui-panel-section-body pt-0">
                <BorderPanel variant="simple" />
              </div>
            </div>

            <div className="ui-panel-section">
              <div className="ui-panel-section-body pt-4">
                <DropShadowPanel useToggle={true} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InspectorRail;
