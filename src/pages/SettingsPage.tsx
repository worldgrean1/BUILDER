import { AlertCircle, CheckCircle2, Key, Sparkles, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { settingsActions, useSettingsStore, type AIModel } from '@/features/settings/settingsStore';

const modelOptions: { label: string; value: AIModel }[] = [
  { label: 'Gemini 2.5 Flash (Recommended)', value: 'gemini-2.5-flash' },
  { label: 'Gemini 2.5 Pro (Advanced)', value: 'gemini-2.5-pro' },
];

const SettingsPage = () => {
  const { apiKey, aiEnabled, aiModel } = useSettingsStore((s) => s);

  const topBar = (
    <div className="ui-topbar min-w-0 overflow-x-auto overflow-y-hidden">
      <div className="flex items-center gap-2 min-w-0">
        <Link to="/creator" className="flex h-7 w-7 items-center justify-center rounded-ui-sm text-text-muted hover:text-text-primary hover:bg-surface-2/60 transition-colors">
          <ArrowLeft size={14} />
        </Link>
        <div className="ui-module-badge">
          <Shield size={10} />
          Settings
        </div>
      </div>
      <div className="ml-auto">
        <Link to="/creator" className="ui-button-secondary">
          Back to Creator
        </Link>
      </div>
    </div>
  );

  const leftPanel = (
    <div className="ui-panel-shell">
      <div className="ui-panel-header">
        <div className="ui-panel-title">Sections</div>
      </div>
      <div className="space-y-1.5 p-3">
        <div className="flex items-center gap-2 rounded-ui-sm bg-brand/8 border border-brand/15 px-3 py-2.5 cursor-pointer">
          <Sparkles size={11} className="text-brand flex-shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-text-primary">AI Integration</p>
            <p className="text-[9px] text-text-muted mt-0.5">Gemini API config</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-ui-sm px-3 py-2.5 text-text-muted hover:bg-surface-2/40 cursor-pointer transition-colors">
          <Shield size={11} className="flex-shrink-0" />
          <div>
            <p className="text-[10px] font-medium">Security</p>
            <p className="text-[9px] text-text-disabled mt-0.5">Key management</p>
          </div>
        </div>
      </div>
    </div>
  );

  const mainContent = (
    <div className="ui-runtime-stage items-start justify-start overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-2xl space-y-4 ui-animate-in">
        {/* AI Config Card */}
        <form onSubmit={e => e.preventDefault()} className="ui-card space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-brand" />
            <h2 className="text-ui-sm font-semibold text-text-primary">Creator AI Settings</h2>
            <div className={`ml-auto inline-flex items-center gap-1.5 rounded-ui-sm px-2 py-0.5 text-[9px] font-medium ${aiEnabled ? 'bg-success/10 text-success border border-success/20' : 'bg-surface-2 text-text-muted border border-border-default'}`}>
              <div className={`h-1 w-1 rounded-full ${aiEnabled ? 'bg-success' : 'bg-text-disabled'}`}></div>
              {aiEnabled ? 'Active' : 'Disabled'}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[10px] font-medium text-text-muted">AI Status</span>
              <select
                value={aiEnabled ? 'enabled' : 'disabled'}
                onChange={(event) => settingsActions.setAiEnabled(event.target.value === 'enabled')}
                className="ui-input h-7"
              >
                <option value="enabled" className="bg-surface-1 text-text-primary">Enabled</option>
                <option value="disabled" className="bg-surface-1 text-text-primary">Disabled</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-medium text-text-muted">Model</span>
              <select
                value={aiModel}
                onChange={(event) => settingsActions.setAiModel(event.target.value as AIModel)}
                className="ui-input h-7"
              >
                {modelOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-surface-1 text-text-primary">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-[10px] font-medium text-text-muted flex items-center gap-1"><Key size={10} /> Gemini API Key</span>
            <div className="ui-field-shell gap-2 h-7">
              <input
                type="password"
                value={apiKey}
                onChange={(event) => settingsActions.setApiKey(event.target.value)}
                autoComplete="off"
                className="w-full bg-transparent text-ui-xs text-text-primary outline-none font-mono"
                placeholder="AIzaSy..."
              />
            </div>
            <p className="text-[9px] text-text-disabled">Stored locally in this browser. Never transmitted except to Google API endpoints.</p>
          </label>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => settingsActions.clearApiKey()} className="ui-button-secondary h-6 px-2 text-[10px]">
              Clear Key
            </button>
            <div className={`inline-flex items-center gap-1.5 rounded-ui-sm border px-2.5 py-1 text-[10px] ${apiKey.length ? 'border-success/25 bg-success/10 text-success' : 'border-warning/25 bg-warning/10 text-warning'}`}>
              {apiKey.length ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
              <span>{apiKey.length ? 'API key configured' : 'API key missing'}</span>
            </div>
          </div>
        </form>

        {/* Info Card */}
        <div className="ui-card-muted p-3 space-y-2">
          <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">How it works</h3>
          <div className="space-y-1.5 text-[10px] text-text-secondary">
            <p>• The AI Chat panel in Creator uses your key to call Gemini for UI generation</p>
            <p>• Gemini 2.5 Flash is recommended for fast, high-quality results</p>
            <p>• Gemini 2.5 Pro offers deeper reasoning for complex layouts</p>
            <p>• All generated nodes integrate directly into the canvas and are fully editable</p>
          </div>
        </div>
      </div>
    </div>
  );

  const rightPanel = (
    <div className="ui-panel-shell">
      <div className="ui-panel-header">
        <div className="ui-panel-title">Guidance</div>
      </div>
      <div className="space-y-3 p-3">
        <div className="space-y-2 text-[10px] text-text-secondary">
          <p>Your API key is stored locally in this browser profile and is never sent to any server except Google's Gemini API.</p>
          <p>Creator AI features use these settings when generating or updating nodes from prompts.</p>
          <p>Use model selection to trade speed versus output quality.</p>
        </div>
        <div className="ui-card-muted p-2.5 space-y-1">
          <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Quick links</p>
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="block text-[10px] text-brand hover:underline">Get API Key →</a>
          <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" className="block text-[10px] text-brand hover:underline">Gemini API Docs →</a>
        </div>
      </div>
    </div>
  );

  const bottomBar = (
    <>
      <div className="flex items-center gap-1.5">
        <div className={`ui-status-dot ${aiEnabled ? 'bg-success' : 'bg-warning'}`}></div>
        <span className="ui-status-value">{aiEnabled ? 'AI Enabled' : 'AI Disabled'}</span>
      </div>
      <div className="ui-status-separator"></div>
      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">Model:</span>
        <span className="ui-status-meta">{aiModel}</span>
      </div>
      <div className="ui-status-separator"></div>
      <div className="flex items-center gap-1.5">
        <span className="ui-status-label">API Key:</span>
        <span className={`font-mono text-[10px] ${apiKey.length ? 'text-success' : 'text-warning'}`}>{apiKey.length ? 'Configured' : 'Missing'}</span>
      </div>
    </>
  );

  return <PageLayout topBar={topBar} leftPanel={leftPanel} mainContent={mainContent} rightPanel={rightPanel} bottomBar={bottomBar} />;
};

export default SettingsPage;
