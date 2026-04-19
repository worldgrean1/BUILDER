import React from 'react';
import VerticalMenuBar from '../../components/cms/VerticalMenuBar';

interface PageLayoutProps {
  topBar: React.ReactNode;
  leftPanel: React.ReactNode;
  mainContent: React.ReactNode;
  rightPanel: React.ReactNode;
  bottomBar?: React.ReactNode;
  middleContent?: React.ReactNode; // For content that spans full width between main and bottom
}

const PageLayout = ({ topBar, leftPanel, mainContent, rightPanel, bottomBar, middleContent }: PageLayoutProps) => {
  return (
    <div className="ui-app-shell">
      <VerticalMenuBar />
      <div className="ui-shell-column">
        <div className="ui-layout-topbar">{topBar}</div>

        <div className="flex flex-1 min-h-0 flex-row overflow-hidden">
          <div className="ui-layout-aside-left bg-surface-1 border-r border-border-subtle flex flex-col flex-shrink-0 overflow-hidden">
            {leftPanel}
          </div>

          <div className="bg-surface-0 relative flex flex-1 flex-col overflow-hidden min-w-[24rem]">
            {mainContent}
          </div>

          <div className="ui-layout-aside-right bg-surface-1 flex flex-col overflow-hidden border-l border-border-subtle flex-shrink-0">
            {rightPanel}
          </div>
        </div>

        {middleContent && (
          <div className="flex-shrink-0 border-t border-border-subtle">
            {middleContent}
          </div>
        )}

        {bottomBar && (
          <div className="ui-statusbar flex-shrink-0">
            {bottomBar}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayout;
