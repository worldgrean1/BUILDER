import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

/* ── Types ─────────────────────────────────────── */

export type AIModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface SettingsState {
  /** Gemini API key (stored in localStorage only) */
  apiKey: string;
  /** Selected model variant */
  aiModel: AIModel;
  /** Master toggle for AI features */
  aiEnabled: boolean;
  /** Tracks whether the settings panel is open */
  settingsPanelOpen: boolean;
}

/* ── Persistence helpers ───────────────────────── */

const STORAGE_KEY = 'bold-settings';

const loadPersistedSettings = (): Partial<SettingsState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<SettingsState>;
  } catch {
    return {};
  }
};

const persistSettings = (state: SettingsState) => {
  try {
    const { settingsPanelOpen: _, ...persistable } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    /* quota exceeded — silent fail */
  }
};

/* ── Store ─────────────────────────────────────── */

const VALID_MODELS: ReadonlySet<string> = new Set<AIModel>(['gemini-2.5-flash', 'gemini-2.5-pro']);
const DEFAULT_MODEL: AIModel = 'gemini-2.5-flash';

const persisted = loadPersistedSettings();

/** Migrate stale model names from older versions to current valid defaults */
const resolvedModel: AIModel =
  persisted.aiModel && VALID_MODELS.has(persisted.aiModel)
    ? persisted.aiModel
    : DEFAULT_MODEL;

export const settingsStore = createStore<SettingsState>(() => ({
  apiKey: persisted.apiKey ?? '',
  aiModel: resolvedModel,
  aiEnabled: persisted.aiEnabled ?? true,
  settingsPanelOpen: false,
}));

/* ── Actions ───────────────────────────────────── */

export const settingsActions = {
  setApiKey(key: string) {
    settingsStore.setState({ apiKey: key.trim() });
    persistSettings(settingsStore.getState());
  },

  setAiModel(model: AIModel) {
    settingsStore.setState({ aiModel: model });
    persistSettings(settingsStore.getState());
  },

  setAiEnabled(enabled: boolean) {
    settingsStore.setState({ aiEnabled: enabled });
    persistSettings(settingsStore.getState());
  },

  toggleSettingsPanel(open?: boolean) {
    settingsStore.setState((s) => ({ settingsPanelOpen: open ?? !s.settingsPanelOpen }));
  },

  /** Returns true if AI features are ready to use */
  isReady(): boolean {
    const s = settingsStore.getState();
    return s.aiEnabled && s.apiKey.length > 0;
  },

  clearApiKey() {
    settingsStore.setState({ apiKey: '' });
    persistSettings(settingsStore.getState());
  },
};

/* ── React hook ────────────────────────────────── */

export function useSettingsStore<T>(selector: (state: SettingsState) => T): T {
  return useStore(settingsStore, selector);
}
