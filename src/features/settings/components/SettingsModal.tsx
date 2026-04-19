import { useSettingsStore, settingsActions, type AIModel } from '../settingsStore';
import { Key, Settings, X, Sparkles, AlertCircle } from 'lucide-react';

const AI_MODELS: { value: AIModel; label: string }[] = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Advanced)' },
];

export const SettingsModal = () => {
  const { apiKey, aiModel, aiEnabled, settingsPanelOpen } = useSettingsStore(s => s);

  if (!settingsPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-0/80 backdrop-blur-[2px]">
      <div className="w-full max-w-[400px] rounded-xl border border-border-default bg-surface-1 shadow-elevation-float overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-2/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-text-muted" />
            <h2 className="text-ui-sm font-semibold text-text-primary">Creator Settings</h2>
          </div>
          <button onClick={() => settingsActions.toggleSettingsPanel(false)} className="text-text-muted hover:text-text-primary">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={e => e.preventDefault()} className="p-4 space-y-5">
          {/* AI Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand" />
              <h3 className="text-ui-sm font-medium text-text-primary">AI Generator Configuration</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-ui-xs text-text-muted">Enable generative AI features</span>
                <input 
                  type="checkbox" 
                  checked={aiEnabled} 
                  onChange={e => settingsActions.setAiEnabled(e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
              </label>

              {aiEnabled && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-ui-xs text-text-muted flex items-center gap-1.5">
                      <Key size={12} /> Gemini API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={apiKey}
                        onChange={e => settingsActions.setApiKey(e.target.value)}
                        autoComplete="off"
                        className="ui-input h-8 w-full font-mono text-ui-xs"
                      />
                      {apiKey && (
                        <button type="button" onClick={() => settingsActions.clearApiKey()} className="ui-button-secondary h-8 px-2 text-ui-xs text-danger hover:bg-danger/10">
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-text-disabled">Stored locally in your browser. Needs Gemini API access.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-ui-xs text-text-muted">Default Model</label>
                    <select
                      value={aiModel}
                      onChange={e => settingsActions.setAiModel(e.target.value as AIModel)}
                      className="ui-input h-8 w-full text-ui-xs"
                    >
                      {AI_MODELS.map(m => (
                        <option key={m.value} value={m.value} className="bg-surface-1">{m.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {(!apiKey && aiEnabled) && (
              <div className="flex gap-2 rounded bg-warning/10 p-2 text-warning border border-warning/20">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  You need a valid Gemini API key to use the generative chat features. Get one from Google AI Studio.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="bg-surface-2/40 border-t border-border-subtle p-3 flex justify-end">
          <button onClick={() => settingsActions.toggleSettingsPanel(false)} className="ui-button-primary h-8 px-4 text-ui-xs">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
