import { useState } from 'react';
import { Tag, Palette, LayoutTemplate, Sliders, ChevronDown, ChevronRight, Eye, EyeOff, RotateCcw, Copy } from 'lucide-react';
import TopBar from '../components/cms/TopBar';
import NavigationTree from '../components/cms/NavigationTree';
import ScrollBar from '../components/cms/ScrollBar';
import AccordionSection from '../components/cms/AccordionSection';
import FieldRow from '../components/cms/FieldRow';
import ColorSwatch from '../components/cms/ColorSwatch';
import PageLayout from '../components/layout/PageLayout';
import { tokenColors } from '../utils/designTokens';
import { formatUiLabel } from '../utils/formatUiLabel';

const colorFields = [
  { label: 'Background number', color: tokenColors.textMuted },
  { label: 'Label', color: tokenColors.textPrimary },
  { label: 'Title', color: tokenColors.textPrimary },
  { label: 'Subtitle', color: tokenColors.textSecondary },
  { label: 'Uptime value', color: null },
  { label: 'Uptime label', color: null },
  { label: 'Coordinates', color: tokenColors.textSecondary },
  { label: 'Hud accents', color: tokenColors.brand },
];

const EditerPage = () => {
  const [detailedColorsOpen, setDetailedColorsOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);

  const topBar = (
    <TopBar module="BOLD" subModule="CMS" activeSection="EDITER" applyLabel="Apply Content">
      <button
        onClick={() => setPreviewVisible(!previewVisible)}
        className="ui-button-ghost"
        title={previewVisible ? 'Hide Preview' : 'Show Preview'}
      >
        {previewVisible ? <Eye size={12} /> : <EyeOff size={12} />}
      </button>
      <button className="ui-button-ghost" title="Duplicate Section">
        <Copy size={12} />
      </button>
      <button className="ui-button-ghost" title="Reset Section">
        <RotateCcw size={12} />
      </button>
    </TopBar>
  );

  const leftPanel = <NavigationTree />;

  const mainContent = (
    <div className="ui-runtime-stage ui-runtime-grid">
      <div className="text-center ui-animate-in">
        <div className="ui-section-kicker mb-2">Live Preview</div>
        <div className="ui-meta mb-3">Content runtime viewport</div>
        <div className="ui-badge-brand">
          <div className="h-1.5 w-1.5 rounded-ui-sm bg-brand animate-pulse"></div>
          <span>0.0% Scroll</span>
        </div>
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        {[Tag, Palette, LayoutTemplate, Sliders].map((Icon, index) => (
          <button key={index} className="ui-icon-button h-7 w-7">
            <Icon size={12} />
          </button>
        ))}
      </div>
    </div>
  );

  const rightPanel = (
    <>
      <div className="ui-panel-header">
        <span className="ui-panel-title">{formatUiLabel('Content Inspector')}</span>
        <span className="ui-meta">Z04</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AccordionSection title="CONTENT & LABELS" icon={<Tag size={12} />} defaultOpen={true}>
          <div className="space-y-1.5">
            <FieldRow label="Background Number" value="GPS" />
            <FieldRow label="LABEL" value="Real-time" />
            <FieldRow label="TITLE" value="Advanced Telematics" />
            <FieldRow label="SUBTITLE" value="In motion" />
            <FieldRow label="Uptime Value" value="99.9%" />
            <FieldRow label="Uptime Label" value="Uptime" />
            <FieldRow label="Coordinates" value="Powered by GNSS devices" />
          </div>
        </AccordionSection>

        <AccordionSection title="DESIGN & APPEARANCE" icon={<Palette size={12} />} defaultOpen={true}>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              {colorFields.map((field) => (
                <div key={field.label} className="flex items-center gap-1.5 py-0.5">
                  <span className="ui-label flex-1 truncate">{formatUiLabel(field.label)}</span>
                  {field.color === null ? (
                    <div className="flex h-5 w-12 items-center justify-center rounded-ui-sm border border-border-default bg-surface-0">
                      <span className="text-[9px] text-text-disabled">None</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="h-3.5 w-3.5 rounded-sm border border-border-default" style={{ backgroundColor: field.color }}></div>
                      <span className="font-mono text-[9px] text-text-disabled">{field.color}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              className="ui-button-secondary mt-1.5 w-full justify-between"
              onClick={() => setDetailedColorsOpen(!detailedColorsOpen)}
            >
              <span>Architectural colors</span>
              {detailedColorsOpen ? <ChevronDown size={11} className="text-text-muted" /> : <ChevronRight size={11} className="text-text-muted" />}
            </button>

            {detailedColorsOpen && (
              <div className="ui-card-muted space-y-1.5 p-2.5 ui-animate-in">
                <ColorSwatch label="Surface Base" color={tokenColors.surfaceBase} />
                <ColorSwatch label="Surface Panel" color={tokenColors.surfacePanel} />
                <ColorSwatch label="Surface High" color={tokenColors.surfaceHigh} />
                <ColorSwatch label="Fleet Red" color={tokenColors.brand} />
                <ColorSwatch label="Signal Teal" color={tokenColors.teal} />
              </div>
            )}
          </div>
        </AccordionSection>

        <AccordionSection title="LAYOUT & PRECISION" icon={<LayoutTemplate size={12} />}>
          <div className="space-y-1.5">
            {['Main Typography Transforms', 'Structural Elements (Spine & Bars)', 'Architecture & Lengths'].map((label) => (
              <button key={label} className="ui-button-secondary w-full justify-between text-left">
                <span className="truncate">{label}</span>
                <ChevronRight size={11} className="text-text-muted flex-shrink-0" />
              </button>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection title="MASTER COMPOSITION" icon={<Sliders size={12} />}>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Global X', val: '0', unit: 'px' },
                { label: 'Global Y', val: '0', unit: 'px' },
                { label: 'Scale', val: '1', unit: '' },
              ].map((field) => (
                <div key={field.label} className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-medium text-text-disabled">{formatUiLabel(field.label)}</span>
                  <div className="flex items-center gap-1 rounded-ui-sm border border-border-default bg-surface-0 px-2 py-1.5">
                    <input type="text" defaultValue={field.val} className="w-full bg-transparent font-mono text-ui-xs text-text-primary outline-none" />
                    {field.unit && <span className="text-[9px] text-text-disabled flex-shrink-0">{field.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionSection>
      </div>
    </>
  );

  const middleContent = <ScrollBar value={0} />;

  const bottomBar = (
    <>
      <div className="flex items-center gap-1.5">
        <div className="ui-status-dot bg-success animate-pulse"></div>
        <span className="ui-status-value">Content synced</span>
      </div>
      <div className="ui-status-separator"></div>
      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Section:</span>
        <span className="ui-status-meta">01 Intelligence</span>
      </div>
      <div className="ui-status-separator"></div>
      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Fields:</span>
        <span className="ui-status-meta">7 editable</span>
      </div>
      <div className="ml-auto">
        <span className="text-[9px] text-text-disabled">BOLD CMS v2.0</span>
      </div>
    </>
  );

  return <PageLayout topBar={topBar} leftPanel={leftPanel} mainContent={mainContent} rightPanel={rightPanel} bottomBar={bottomBar} middleContent={middleContent} />;
};

export default EditerPage;
